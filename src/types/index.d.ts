export type NFT = {
  policyId: string;
  assetName: string;
  seller: string;
  price: number;
};
export type NFTExtended = NFT & {
  metadata: Record<string, string>;
};
