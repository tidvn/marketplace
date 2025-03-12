"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Eye, Heart, Share2 } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { get } from "@/lib/axios";

export default function NftDetailPage({ params }: { params: { assetHex: string } }) {
  const assetHex = params.assetHex;
  const [imgError, setImgError] = useState(false);

  const { data, error, isLoading } = useSWR(`/specific-asset?unit=${assetHex}`, get);
  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;
  const { onchain_metadata, fingerprint } = data;
  if (!onchain_metadata) return null;
  const img = `https://ipfs.blockfrost.dev/ipfs/` + onchain_metadata.image.replace("ipfs://", "");
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Add to favorites</span>
              </Button>
              <span className="text-sm text-muted-foreground">142 favorites</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">1.2k views</span>
              </div>
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
                <span className="sr-only">Share</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <div>
            <Badge className="mb-3">Collection: Ethereal Dreams</Badge>
            <h1 className="text-3xl font-bold md:text-4xl">{fingerprint}</h1>
            <div className="mt-4 flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Seller : </p>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="/placeholder.svg" alt="@stellarArtist" />
                  <AvatarFallback>SA</AvatarFallback>
                </Avatar>
                <Link href="#" className="text-sm font-medium hover:underline">
                 {data.seller}
                </Link>
              </div>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Bid</p>
                  <p className="text-3xl font-bold">0.45 ETH</p>
                  <p className="text-sm text-muted-foreground">≈ $1,245.12</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Auction ends in 14h 32m 11s</span>
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <Button className="flex-1" size="lg">
                  Place a Bid
                </Button>
                <Button variant="outline" className="flex-1" size="lg">
                  Make Offer
                </Button>
              </div>
            </CardContent>
          </Card>
          <Tabs defaultValue="details">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="bids">Bids</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="pt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Cosmic Perspective is a unique digital artwork that explores the vastness of the universe and our place within it. This piece
                    combines elements of abstract art with cosmic imagery to create a mesmerizing visual experience that invites contemplation and
                    wonder.
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="flex justify-between py-1">
                    <p className="text-sm text-muted-foreground">Contract Address</p>
                    <p className="text-sm font-medium">0x1a2b...3c4d</p>
                  </div>
                  <div className="flex justify-between py-1">
                    <p className="text-sm text-muted-foreground">Token ID</p>
                    <p className="text-sm font-medium">#{params.assetHex}</p>
                  </div>
                  <div className="flex justify-between py-1">
                    <p className="text-sm text-muted-foreground">Token Standard</p>
                    <p className="text-sm font-medium">ERC-721</p>
                  </div>
                  <div className="flex justify-between py-1">
                    <p className="text-sm text-muted-foreground">Blockchain</p>
                    <p className="text-sm font-medium">Ethereum</p>
                  </div>
                  <div className="flex justify-between py-1">
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">Apr 15, 2023</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="bids" className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg" alt="@bidder1" />
                      <AvatarFallback>B1</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">@cryptoWhale</p>
                      <p className="text-sm text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">0.45 ETH</p>
                    <p className="text-sm text-muted-foreground">≈ $1,245.12</p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg" alt="@bidder2" />
                      <AvatarFallback>B2</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">@artCollector</p>
                      <p className="text-sm text-muted-foreground">5 hours ago</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">0.42 ETH</p>
                    <p className="text-sm text-muted-foreground">≈ $1,162.80</p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg" alt="@bidder3" />
                      <AvatarFallback>B3</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">@nftEnthusiast</p>
                      <p className="text-sm text-muted-foreground">8 hours ago</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">0.38 ETH</p>
                    <p className="text-sm text-muted-foreground">≈ $1,052.32</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="history" className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-muted p-2">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Listed for sale</p>
                      <p className="text-sm text-muted-foreground">by @stellarArtist</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">0.35 ETH</p>
                    <p className="text-sm text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-muted p-2">
                      <Heart className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">by @stellarArtist</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Apr 15, 2023</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
