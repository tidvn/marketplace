"use client";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useState, use } from "react";
import useSWR from "swr";
import { get } from "@/lib/axios";
import { hexToString, parseAssetUnit } from "@meshsdk/core";
import { useWallet } from "@/hooks/use-wallet";
import { TransactionButton } from "@/components/app/transaction-button";

export default function NftDetailPage({ params }: { params: Promise<{ unit: string }> }) {
  const { unit } = use(params);

  const { address } = useWallet();
  const [imgError, setImgError] = useState(false);

  const { data: nftData, error, isLoading } = useSWR(`/specific-asset?unit=${unit}`, get);
  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;
  const metadata = nftData.metadata;
  const { policyId, assetName } = parseAssetUnit(unit);
  const img = `https://ipfs.blockfrost.dev/ipfs/` + metadata.image.replace("ipfs://", "");
  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back to marketplace
      </Link>
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="relative aspect-square overflow-hidden rounded-lg border-2">
            <Image src={imgError ? "/placeholder.png" : img} alt="NFT Image" fill className="object-cover" onError={() => setImgError(true)} />
          </div>
        </div>
        <div className="space-y-8">
          <div>
            <Badge className="mb-3">{policyId}</Badge>
            <h1 className="text-3xl font-bold truncate">{hexToString(assetName)}</h1>
            {nftData.seller && (
              <div className="mt-4 flex items-center gap-2">
                <p className="text-sm text-muted-foreground ">Seller</p>
                <div className="flex items-center gap-2">
                  <Link href="#" className="text-sm font-medium truncate">
                    {nftData.seller.slice(0, 25) + "..." + nftData.seller.slice(-25)}
                  </Link>
                </div>
              </div>
            )}
          </div>
          {nftData.seller && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-3xl font-bold">{nftData.price / 1_000_000} ₳</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-between gap-4">
                  {address === nftData.seller ? (
                    <>
                      <TransactionButton action="update" className="w-1/2 bg-blue-500" unit={unit} />
                      <TransactionButton action="withdraw" className="w-1/2 bg-red-500" unit={unit} />
                    </>
                  ) : (
                    <TransactionButton action="buy" className="w-1/2 bg" unit={unit} />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="pt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Metadata</h3>
              </div>
              <div className="grid gap-2">
                {Object.entries(metadata).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-4 gap-2 border-b border-muted-foreground py-2">
                    <p className="text-sm text-muted-foreground col-span-1">{key}</p>
                    <p className="text-sm font-medium text-end col-span-3">{value as string}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
