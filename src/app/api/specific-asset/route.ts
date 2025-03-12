import { MeshAdapter } from "@/contract/mesh";
import { blockfrostProvider } from "@/lib/blockfrost";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unit = searchParams.get("unit") as string;
    const mesh = new MeshAdapter({});
    const metadata = await blockfrostProvider.fetchAssetMetadata(unit);
    let datum = {};
    const [utxo] = await blockfrostProvider.fetchAddressUTxOs(mesh.marketplaceAddress, unit);
    if (utxo) {
      datum = mesh.readPlutusData(utxo.output.plutusData as string);
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
