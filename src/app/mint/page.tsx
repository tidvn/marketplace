/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, Zap, Crown, Star } from "lucide-react";
import { ipfs } from "./ipfs";
import { MeshTxBuilder, ForgeScript, resolveScriptHash, stringToHex } from "@meshsdk/core";
import { useWallet } from "@/hooks/use-wallet";
import Link from "next/link";

export default function MintPage() {
  const { browserWallet: wallet } = useWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [previewMetadata, setPreviewMetadata] = useState<any>(null);
  const [tokenName, setTokenName] = useState<string>("MeshToken");
  const [error, setError] = useState<string | null>(null);
  const [prefix, setPrefix] = useState<string>("");
  const [txhash, setTxhash] = useState<string | null>(null);

  const generateRandomMetadata = (index: number = 0, prefix: string = "rug") => {
    const name = `${prefix} #00${index}`;
    const description = `random pixel art`;
    const randomIpfs = ipfs[Math.floor(Math.random() * ipfs.length)];
    const image = `ipfs://${randomIpfs.cid}`;
    const mediaType = "image/png";
    const rarity = ["Common", "Legendary", "Mythic", "Rare"][Math.floor(Math.random() * 4)];
    return {
      assetName: `${prefix}00${index + 1}`,
      name,
      description,
      image,
      mediaType,
      rarity,
    };
  };

  const generatePreview = () => {
    const randomPrefix = prefix.trim() || [...Array(3)].map(() => "abcdefghijklmnopqrstuvwxyz"[(Math.random() * 26) | 0]).join("");
    const index = Math.floor(Math.random() * 1000);
    const metadata = generateRandomMetadata(index, randomPrefix);
    setTokenName(`${randomPrefix}00${index}`);
    setPreviewMetadata(metadata);
    setError(null);
  };

  const handleMint = async () => {
    if (!previewMetadata) {
      return;
    }
    if (!wallet) {
      return;
    }

    setIsMinting(true);
    setError(null);

    try {
      const utxos = await wallet.getUtxos();
      const changeAddress = await wallet.getChangeAddress();
      const forgingScript = ForgeScript.withOneSignature(changeAddress);
      const policyId = resolveScriptHash(forgingScript);
      const tokenNameHex = stringToHex(tokenName);
      const metadata = { [policyId]: { [tokenName]: { ...previewMetadata } } };

      const txBuilder = new MeshTxBuilder();
      const unsignedTx = await txBuilder
        .mint("1", policyId, tokenNameHex)
        .mintingScript(forgingScript)
        .metadataValue(721, metadata)
        .changeAddress(changeAddress)
        .selectUtxosFrom(utxos)
        .complete();

      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      setTxhash(txHash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mint NFT");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">Mint Random NFT</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Mint Controls */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Mint Your NFT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="prefix" className="text-sm font-medium text-gray-700">
                  NFT Prefix (optional)
                </label>
                <Input
                  id="prefix"
                  type="text"
                  placeholder="Enter prefix (e.g., Rug, Cat, Dog) or leave empty for random"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full"
                />
              </div>

              <Button
                onClick={generatePreview}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={isMinting}
              >
                <Zap className="h-4 w-4 mr-2" />
                Generate Random Metadata
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                NFT Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {previewMetadata ? (
                <div className="space-y-4">
                  {/* NFT Image */}
                  <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 relative">
                    <Image
                      src={`https://ipfs.blockfrost.dev/ipfs/${previewMetadata.image.replace("ipfs://", "")}`}
                      alt={previewMetadata.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* NFT Details */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{previewMetadata.name}</h3>
                      <p className="text-gray-600 text-sm">{previewMetadata.description}</p>
                    </div>

                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {previewMetadata.rarity}
                      </Badge>
                    </div>

                    {previewMetadata && (
                      <Button
                        onClick={handleMint}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        disabled={isMinting}
                      >
                        {isMinting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Minting NFT...
                          </>
                        ) : (
                          <>
                            <Crown className="h-4 w-4 mr-2" />
                            Mint NFT
                          </>
                        )}
                      </Button>
                    )}

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}

                    {txhash && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-600 text-sm font-medium">NFT mint transaction created successfully!</p>
                        <p className="text-green-500 text-sm mt-1 truncate">
                          View on Cexplorer:{" "}
                          <Link
                            href={`https://${process.env.NEXT_PUBLIC_APP_NETWORK}.cexplorer.io/tx/${txhash}`}
                            target="_blank"
                            className="text-blue-500 "
                          >
                            {txhash}
                          </Link>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Click &quot;Generate Random Metadata&quot; to preview your NFT</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
