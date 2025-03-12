import { MeshAdapter } from "@/contract/mesh";
import { blockfrostProvider } from "@/lib/blockfrost";
import { NFT } from "@/types";

export async function GET() {
  try {
    const mesh = new MeshAdapter({});
    const utxos = await blockfrostProvider.fetchAddressUTxOs(mesh.marketplaceAddress);
    const result: NFT[] = utxos
      .map((utxo) => {
        const datum = mesh.readPlutusData(utxo.output.plutusData as string);
        return datum;
      })
      .filter((datum) => datum != null);
    return Response.json({
      result,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ data: [], message: e instanceof Error ? e.message : JSON.stringify(e) }, { status: 500 });
  }
}
