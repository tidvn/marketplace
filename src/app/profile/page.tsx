"use client";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NftCard } from "@/components/app/nft-card";
import { useWallet } from "@/hooks/use-wallet";
import useSWR from "swr";
import { get } from "@/lib/axios";
import { NFT } from "@/types";

export default function ProfilePage() {
  const { address } = useWallet();
  const { data, error, isLoading } = useSWR("/profile?address=" + address, get);

  if (!address) return null;
  else if (error) return <div>failed to load</div>;
  else if (isLoading) return <div>loading...</div>;
  const { ownAssets, listingAssets } = data;
  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="relative mb-8">
        <div className="relative h-48 w-full overflow-hidden rounded-lg md:h-64">
          <Image src="/placeholder.png" alt="Profile cover" fill className="object-cover" />
        </div>
        <div className="absolute -bottom-12 left-4 h-24 w-24 overflow-hidden rounded-xl border-4 border-background md:-bottom-16 md:left-8 md:h-32 md:w-32">
          <Image src="/user-placeholder.png" alt="Profile picture" fill className="object-cover" />
        </div>
      </div>
      <div className="mt-16 md:mt-20">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold">{address.slice(0, 25) + "..." + address.slice(-25)}</h1>
          </div>
        </div>

        <div className="mt-12">
          <Tabs defaultValue="ownNFTs">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger value="ownNFTs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                My NFTs
              </TabsTrigger>
              <TabsTrigger value="listingNfts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Listings
              </TabsTrigger>
            </TabsList>
            <TabsContent value="ownNFTs" className="pt-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {ownAssets.map((asset: NFT) => (
                  <NftCard key={asset.assetHex} assetHex={asset.assetHex} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="listingNfts" className="pt-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {listingAssets.map((asset: NFT) => (
                  <NftCard key={asset.assetHex} assetHex={asset.assetHex} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
