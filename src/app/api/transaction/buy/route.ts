import { MeshAdapter } from "@/contract/mesh";
import { blockfrostProvider } from "@/lib/blockfrost";
import { NFTExtended } from "@/types";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unit = searchParams.get("unit") as string;
    const mesh = new MeshAdapter({});
    const metadata = await blockfrostProvider.fetchAssetMetadata(unit);
    const [utxo] = await blockfrostProvider.fetchAddressUTxOs(mesh.marketplaceAddress, unit);
    const datum = mesh.readPlutusData(utxo.output.plutusData as string);
    const nft: NFTExtended = { ...datum, metadata };

    return Response.json(nft, { status: 200 });
  } catch (e) {
    console.error(e);
    return Response.json({ data: null, message: e instanceof Error ? e.message : JSON.stringify(e) }, { status: 500 });
  }
}
