"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { useWallet } from "@meshsdk/react";
import { post } from "@/lib/axios";
import Link from "next/link";

export const WithdrawButton = ({ className, assetHex }: { className?: string; assetHex: string }) => {
  const { address, wallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [txhash, setTxhash] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      if (!assetHex) {
        throw new Error("Asset not found");
      }

      if (!address || !wallet) {
        throw new Error("Wallet not connected");
      }

      const response = await post("/tx/withdraw", { address, assetHex });

      const { result, data, message } = response;
      if (!result) {
        throw new Error(message);
      }
      const signedTx = await wallet.signTx(data);
      const txhash = await wallet.submitTx(signedTx);
      setTxhash(txhash);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Button onClick={handleSubmit} className={cn(className)} disabled={loading}>
        {loading ? "Create Transaction ..." : "Delist"}
      </Button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Dialog
        open={txhash != ""}
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
                  href={`https://preview.cexplorer.io/tx/${txhash}`}
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
};
