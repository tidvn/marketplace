import { MarketplaceContract } from "@/contract";
import { blockfrostProvider } from "@/lib/blockfrost";
import { MeshWallet } from "@meshsdk/core";

export async function POST(request: Request) {
  try {
    const { address, assetHex, price } = await request.json();
    if (!address) {
      throw new Error("Wallet not connected");
    }
    if (!assetHex) {
      throw new Error("Asset not found");
    }
    if (isNaN(price) || price <= 1_000_000) {
      throw new Error("Price must be a number and greater than 1 ADA");
    }
    const wallet = new MeshWallet({
      networkId: 0,
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      key: {
        type: "address",
        address: address,
      },
    });
    const contract: MarketplaceContract = new MarketplaceContract({
      wallet: wallet,
      fetcher: blockfrostProvider,
      blockfrostProvider: blockfrostProvider,
    });

    const unsignedTx: string = await contract.update({
      unit: assetHex,
      newPrice: price,
    });
    return Response.json(
      {
        result: true,
        data: unsignedTx,
        message: "Transaction created successfully",
      },
      { status: 200 },
    );
  } catch (e) {
    console.error(e);
    return Response.json({ result: false, data: null, message: e instanceof Error ? e.message : JSON.stringify(e) }, { status: 500 });
  }
}
