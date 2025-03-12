import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import useSWR from "swr";
import { get } from "@/lib/axios";
import { useState } from "react";

interface NftCardProps {
  assetHex: string;
  seller: string;
  price: number;
}

export function NftCard({ assetHex, seller, price }: NftCardProps) {
  const [imgError, setImgError] = useState(false);
  const { data, error, isLoading } = useSWR(`/specific-asset?unit=${assetHex}`, get);
  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;
  const { onchain_metadata, fingerprint } = data;
  if (!onchain_metadata) return null;
  const img = `https://ipfs.blockfrost.dev/ipfs/` + onchain_metadata.image.replace("ipfs://", "");
  return (
    <Link href={`/nft/${assetHex}`}>
      <Card className="overflow-hidden">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={imgError ? "/placeholder.png" : img}
            alt={fingerprint}
            fill
            onError={() => setImgError(true)}
            className="object-cover transition-transform hover:scale-105"
          />
        </div>

        <CardContent className="p-4">
          <div className="space-y-1">
            <p className="font-medium hover:underline truncate"> {fingerprint}</p>
            <p className="text-sm text-muted-foreground truncate">{seller}</p>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4 pt-0">
          <div>
            <p className="text-xs text-muted-foreground"> Price</p>
            <p className="font-medium truncate ">{price / 1_000_000} ₳</p>
          </div>
          <Button size="sm">Detail</Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
