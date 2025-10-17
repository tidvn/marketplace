/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  applyParamsToScript,
  BlockfrostProvider,
  deserializeDatum,
  IFetcher,
  MeshTxBuilder,
  MeshWallet,
  Network,
  PlutusScript,
  serializeAddressObj,
  serializePlutusScript,
  UTxO,
} from "@meshsdk/core";
import blueprint from "./plutus.json";

export class MeshAdapter {
  protected fetcher: IFetcher;
  protected wallet: MeshWallet;
  protected meshTxBuilder: MeshTxBuilder;
  protected network: Network;
  protected networkId: number;

  public marketplaceAddress: string;
  protected marketplaceScript: PlutusScript;
  protected marketplaceScriptCbor: string;
  protected marketplaceCompileCode: string;

  constructor({
    wallet = null!,
    fetcher = null!,
    blockfrostProvider = null!,
  }: {
    wallet?: MeshWallet;
    fetcher?: IFetcher;
    blockfrostProvider?: BlockfrostProvider;
  }) {
    this.wallet = wallet;
    this.fetcher = fetcher;
    this.meshTxBuilder = new MeshTxBuilder({
      fetcher: this.fetcher,
      evaluator: blockfrostProvider,
    });
    this.network = (process.env.BLOCKFROST_PROJECT_ID?.slice(0, 7) as Network) || "preview";
    this.networkId = this.network == "mainnet" ? 1 : 0;
    this.marketplaceCompileCode = this.readValidator(blueprint, "marketplace.marketplace.spend");

    this.marketplaceScriptCbor = applyParamsToScript(this.marketplaceCompileCode, []);

    this.marketplaceScript = {
      code: this.marketplaceScriptCbor,
      version: "V3",
    };

    this.marketplaceAddress = serializePlutusScript(this.marketplaceScript, undefined, 0, false).address;
  }

  protected getWalletForTx = async (): Promise<{
    utxos: UTxO[];
    collateral: UTxO;
    walletAddress: string;
  }> => {
    const utxos = await this.wallet.getUtxos();
    const collaterals = await this.wallet.getCollateral();
    const walletAddress = this.wallet.getChangeAddress();
    if (!utxos || utxos.length === 0) throw new Error("No UTXOs found in getWalletForTx method.");

    if (!collaterals || collaterals.length === 0) throw new Error("No collateral found in getWalletForTx method.");

    if (!walletAddress) throw new Error("No wallet address found in getWalletForTx method.");

    return { utxos, collateral: collaterals[0], walletAddress };
  };

  protected getUtxoForTx = async (address: string, txHash: string) => {
    const utxos: UTxO[] = await this.fetcher.fetchAddressUTxOs(address);
    const utxo = utxos.find(function (utxo: UTxO) {
      return utxo.input.txHash === txHash;
    });

    if (!utxo) throw new Error("No UTXOs found in getUtxoForTx method.");
    return utxo;
  };

  protected readValidator = function (plutus: any, title: string): string {
    const validator = plutus.validators.find(function (validator: any) {
      return validator.title === title;
    });

    if (!validator) {
      throw new Error(`${title} validator not found.`);
    }

    return validator.compiledCode;
  };

  public readPlutusData = (plutusData: string) => {
    try {
      const inputDatum = deserializeDatum(plutusData);
      const seller = serializeAddressObj(deserializeDatum(plutusData).fields[0], this.networkId);
      return {
        seller: seller,
        price: inputDatum.fields[1].int,
        unit: inputDatum.fields[2].bytes + inputDatum.fields[3].bytes,
      };
    } catch (e) {
      console.error("Error reading plutus data: ", e);
      return null!;
    }
  };

  protected getAddressUTXOAsset = async (address: string, unit: string) => {
    const utxos = await this.fetcher.fetchAddressUTxOs(address, unit);
    return utxos[utxos.length - 1];
  };

  protected getAddressUTXOAssets = async (address: string, unit: string) => {
    return await this.fetcher.fetchAddressUTxOs(address, unit);
  };
}
