import { MeshAdapter } from "@/contract/mesh";
import { blockfrostProvider } from "@/lib/blockfrost";
import { NFT } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unit = searchParams.get("unit") as string;
    const mesh = new MeshAdapter({});
    const metadata = await blockfrostProvider.fetchAssetMetadata(unit);
    let datum: NFT = null!;
    const [utxo] = await blockfrostProvider.fetchAddressUTxOs(mesh.marketplaceAddress, unit);
    if (utxo) {
      const inputLovelace = Number(utxo.output.amount.find((a) => a.unit === "lovelace")!.quantity);
      datum = mesh.readPlutusData(utxo.output.plutusData as string);
      datum.price = datum.price + inputLovelace;
    }
    const nft = {
      ...datum,
      metadata,
    };

    return Response.json(nft, { status: 200 });
  } catch (e) {
    console.error(e);
    return Response.json({ data: null, message: e instanceof Error ? e.message : JSON.stringify(e) }, { status: 500 });
  }
}
