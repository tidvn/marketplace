import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import useSWR from "swr";
import { get } from "@/lib/axios";
import { useState } from "react";
import { TransactionButton } from "./transaction-button";

export function NftCard({ unit }: { unit: string }) {
  const [imgError, setImgError] = useState(false);
  const { data: nftData, error, isLoading } = useSWR(`/specific-asset?unit=${unit}`, get);
  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;
  const metadata = nftData.metadata;
  const img = `https://ipfs.blockfrost.dev/ipfs/` + metadata.image.replace("ipfs://", "");
  return (
    <Card className="overflow-hidden">
      <Link href={`/nft/${unit}`}>
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={imgError ? "/placeholder.png" : img}
            alt={metadata.fingerprint || ""}
            fill
            onError={() => setImgError(true)}
            className="object-cover transition-transform hover:scale-105"
          />
        </div>

        <CardContent className="p-4">
          <div className="space-y-1">
            <p className="font-medium hover:underline truncate"> {metadata.fingerprint || ""}</p>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        {nftData.price ? (
          <>
            <div>
              <p className="text-xs text-muted-foreground"> Price</p>
              <p className="font-medium truncate ">{nftData.price / 1_000_000} ₳</p>
            </div>
          </>
        ) : (
          <TransactionButton action="sell" className="w-full" unit={unit} />
        )}
      </CardFooter>
    </Card>
  );
}
