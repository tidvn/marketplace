export type NFT = {
  unit: string;
  seller: string;
  price: number;
};
export type NFTExtended = NFT & {
  metadata: Record<string, string>;
};

export type TransactionAction = "sell" | "buy" | "update" | "withdraw";
