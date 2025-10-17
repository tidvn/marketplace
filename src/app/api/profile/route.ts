import { MeshAdapter } from "@/contract/mesh";
import { blockfrostProvider } from "@/lib/blockfrost";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address") as string;
    const mesh = new MeshAdapter({});
    const assets = await blockfrostProvider.fetchAddressAssets(address);
    const filteredAssets = Object.keys(assets)
      .filter((item) => item !== "lovelace")
      .map((item) => {
        return {
          unit: item,
        };
      });
    const listingAssets = await blockfrostProvider.fetchAddressUTxOs(mesh.marketplaceAddress);
    const addressListingAssets = listingAssets
      .map((utxo) => {
        return mesh.readPlutusData(utxo.output.plutusData as string);
      })
      .filter((datum) => datum != null)
      .filter((datum) => datum.seller == address);

    return Response.json(
      {
        ownAssets: filteredAssets,
        listingAssets: addressListingAssets,
      },
      { status: 200 },
    );
  } catch (e) {
    console.error(e);
    return Response.json({ data: null, message: e instanceof Error ? e.message : JSON.stringify(e) }, { status: 500 });
  }
}
