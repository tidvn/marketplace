"use client";
import { NftCard } from "@/components/app/nft-card";
import { get } from "@/lib/axios";
import { NFT } from "@/types";
import useSWR from "swr";

export default function Home() {
  const { data, error, isLoading } = useSWR("/listed-nfts", get);
  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm"></div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Explore the Marketplace</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Browse and discover the latest trending NFTs from top artists and collectors
            </p>
          </div>
        </div>
        <div className="mx-auto w-full space-y-6 py-12">
          <div className="w-full">
            <div className="pt-6">
              <div className="grid grid-cols-1 gap-6 grid-cols-4">
                {data && data.result.map((nft: NFT) => <NftCard key={nft.assetHex} assetHex={nft.assetHex} />)}
                {/* <NftCard assetHex="Cosmic Perspective #42" seller="@stellarArtist" price="0.45 ETH" image="/placeholder.svg?height=400&width=400" />
                <NftCard assetHex="Digital Dreams #08" seller="@pixelPioneer" price="0.32 ETH" image="/placeholder.svg?height=400&width=400" />
                <NftCard assetHex="Abstract Realms #15" seller="@artExplorer" price="0.56 ETH" image="/placeholder.svg?height=400&width=400" />
                <NftCard assetHex="Neon Genesis #03" seller="@futureVision" price="0.28 ETH" image="/placeholder.svg?height=400&width=400" />
                <NftCard assetHex="Quantum Fragments #21" seller="@digitalSculptor" price="0.75 ETH" image="/placeholder.svg?height=400&width=400" />
                <NftCard assetHex="Ethereal Echoes #11" seller="@dreamWeaver" price="0.39 ETH" image="/placeholder.svg?height=400&width=400" />
                <NftCard assetHex="Cybernetic Sunset #27" seller="@neoseller" price="0.51 ETH" image="/placeholder.svg?height=400&width=400" />
                <NftCard assetHex="Virtual Vistas #14" seller="@metaArtisan" price="0.44 ETH" image="/placeholder.svg?height=400&width=400" /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
