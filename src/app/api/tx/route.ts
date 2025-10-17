import { MarketplaceContract } from "@/contract";
import { blockfrostProvider } from "@/lib/blockfrost";
import { MeshWallet } from "@meshsdk/core";

type TransactionAction = "sell" | "buy" | "update" | "withdraw";

interface TransactionRequest {
  action: TransactionAction;
  address: string;
  unit: string;
  price?: number;
}

export async function POST(request: Request) {
  try {
    const { action, address, unit, price } = (await request.json()) as TransactionRequest;

    // Validate common fields
    if (!address) {
      throw new Error("Wallet not connected");
    }
    if (!unit) {
      throw new Error("Asset not found");
    }
    if (!action || !["sell", "buy", "update", "withdraw"].includes(action)) {
      throw new Error("Invalid action");
    }

    // Validate price for actions that require it
    if ((action === "sell" || action === "update") && (isNaN(price!) || price! <= 1_000_000)) {
      throw new Error("Price must be a number and greater than 1 ADA");
    }

    // Create wallet instance
    const wallet = new MeshWallet({
      networkId: 0,
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      key: {
        type: "address",
        address: address,
      },
    });

    // Create contract instance
    const contract = new MarketplaceContract({
      wallet: wallet,
      fetcher: blockfrostProvider,
      blockfrostProvider: blockfrostProvider,
    });

    // Build transaction based on action
    let unsignedTx: string;
    switch (action) {
      case "sell":
        unsignedTx = await contract.sell({
          unit: unit,
          price: price!,
        });
        break;
      case "buy":
        unsignedTx = await contract.buy({
          unit: unit,
        });
        break;
      case "update":
        unsignedTx = await contract.update({
          unit: unit,
          newPrice: price!,
        });
        break;
      case "withdraw":
        unsignedTx = await contract.withdraw({
          unit: unit,
        });
        break;
      default:
        throw new Error("Invalid action");
    }

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
