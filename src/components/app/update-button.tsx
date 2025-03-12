"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useWallet } from "@meshsdk/react";
import { post } from "@/lib/axios";
import Link from "next/link";

export const UpdateButton = ({ className, assetHex }: { className?: string; assetHex: string }) => {
  const { address, wallet } = useWallet();
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [txhash, setTxhash] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const priceInLovelace = parseInt(price) * 1_000_000;

      if (isNaN(priceInLovelace) || priceInLovelace <= 1_000_000) {
        throw new Error("Price must be a number and greater than 1 ADA");
      }

      if (!assetHex) {
        throw new Error("Asset not found");
      }

      if (!address || !wallet) {
        throw new Error("Wallet not connected");
      }
      const response = await post("/tx/update", { address, assetHex, price: priceInLovelace });
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
    <Dialog>
      <DialogTrigger asChild>
        <Button className={cn(className)}>Update</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[425px]">
        {txhash == "" ? (
          <>
            <div className="p-4 space-y-6">
              <div>
                <label htmlFor="price" className="block text-lg font-medium mb-2">
                  New Price
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
              <Button onClick={handleSubmit}>{loading ? "Create Transaction ..." : "Update"}</Button>
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
