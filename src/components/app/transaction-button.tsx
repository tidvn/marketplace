"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { post } from "@/lib/axios";
import Link from "next/link";
import { TransactionAction } from "@/types";


interface TransactionButtonProps {
  action: TransactionAction;
  unit: string;
  className?: string;
}

const actionConfig = {
  sell: {
    label: "Sell",
    dialogTitle: "Price",
    successAction: "Send Listing",
    requiresPrice: true,
  },
  buy: {
    label: "Buy",
    dialogTitle: "",
    successAction: "Buy",
    requiresPrice: false,
  },
  update: {
    label: "Update",
    dialogTitle: "New Price",
    successAction: "Update",
    requiresPrice: true,
  },
  withdraw: {
    label: "Delist",
    dialogTitle: "",
    successAction: "Delist",
    requiresPrice: false,
  },
};

export const TransactionButton = ({ action, unit, className }: TransactionButtonProps) => {
  const { address, browserWallet: wallet } = useWallet();
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [txhash, setTxhash] = useState("");
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const config = actionConfig[action];

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      if (!unit) {
        throw new Error("Asset not found");
      }

      if (!address || !wallet) {
        throw new Error("Wallet not connected");
      }

      let priceInLovelace: number | undefined;
      if (config.requiresPrice) {
        priceInLovelace = parseInt(price) * 1_000_000;
        if (isNaN(priceInLovelace) || priceInLovelace <= 1_000_000) {
          throw new Error("Price must be a number and greater than 1 ADA");
        }
      }

      const response = await post("/tx", {
        action,
        address,
        unit,
        ...(priceInLovelace && { price: priceInLovelace }),
      });

      const { result, data, message } = response;
      if (!result) {
        throw new Error(message);
      }

      const signedTx = await wallet.signTx(data);
      const txHash = await wallet.submitTx(signedTx);
      setTxhash(txHash);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // For actions that don't require price input (buy, withdraw)
  if (!config.requiresPrice) {
    return (
      <>
        <Button onClick={handleSubmit} className={cn(className)} disabled={loading}>
          {loading ? "Create Transaction ..." : config.label}
        </Button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Dialog
          open={txhash !== ""}
          onOpenChange={(open) => {
            if (!open) {
              setTxhash("");
            }
          }}
        >
          <DialogContent className="max-w-[425px]">
            <div className="h-full py-8 px-10 m-auto flex flex-col">
              <div className="flex flex-col items-center justify-center">
                <p className="mb-2 text-center text-lg font-semibold">successful! 🎉</p>
                <p className="mb-4 max-w-md text-center text-sm text">Please wait a moment for the transaction to complete.</p>
                <div className="flex flex-row items-center justify-center space-x-4">
                  <Link
                    href={`https://${process.env.NEXT_PUBLIC_APP_NETWORK}.cexplorer.io/tx/${txhash}`}
                    target="_blank"
                    className="mt-4 rounded-lg px-6 py-2 bg-gray-900 text-sm font-semibold text-blue-200 shadow-md"
                  >
                    View on Cexplorer
                  </Link>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // For actions that require price input (sell, update)
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className={cn(className)}>{config.label}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[425px]">
        {txhash === "" ? (
          <>
            <div className="p-4 space-y-6">
              <div>
                <label htmlFor="price" className="block text-lg font-medium mb-2">
                  {config.dialogTitle}
                </label>
                <div className="relative">
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className=" border-gray-700 pr-16 h-14 text-lg"
                    placeholder="0"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 pointer-events-none">ADA</div>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleSubmit}>{loading ? "Create Transaction ..." : config.successAction}</Button>
            </DialogFooter>
          </>
        ) : (
          <div className="h-full py-8 px-10 m-auto flex flex-col">
            <div className="flex flex-col items-center justify-center">
              <p className="mb-2 text-center text-lg font-semibold">successful! 🎉</p>
              <p className="mb-4 max-w-md text-center text-sm text">Please wait a moment for the transaction to complete.</p>
              <div className="flex flex-row items-center justify-center space-x-4">
                <Link
                  href={`https://${process.env.NEXT_PUBLIC_APP_NETWORK}.cexplorer.io/tx/${txhash}`}
                  target="_blank"
                  className="mt-4 rounded-lg px-6 py-2 bg-gray-900 text-sm font-semibold text-blue-200 shadow-md"
                >
                  View on Cexplorer
                </Link>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
