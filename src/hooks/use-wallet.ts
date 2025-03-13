import { create } from "zustand";
import { BrowserWallet } from "@meshsdk/core";

export interface WalletStoreType {
  walletName: string | null;
  address: string | null;
  browserWallet: BrowserWallet | null;
  connect: (walletName: string) => Promise<void>;
  disconnect: () => Promise<void>;
}

export const useWallet = create<WalletStoreType>((set, get) => ({
  address: null,
  walletName: null,
  browserWallet: null,
  connect: async (walletName: string) => {
    const wallet = walletName.toLowerCase();
    const browserWallet: BrowserWallet = await BrowserWallet.enable(wallet);

    if (!browserWallet) {
      throw new Error("Failed to connect wallet");
    }

    const address = await browserWallet.getChangeAddress();
    if (!address) {
      throw new Error("Failed to get address");
    }

    const stakeAddress = await browserWallet.getRewardAddresses();
    if (!stakeAddress) {
      throw new Error("Failed to get stake address");
    }

    set({
      walletName: wallet,
      address: address,
      browserWallet: browserWallet,
    });
  },

  signTx: async (unsignedTx: string) => {
    const { browserWallet } = get();
    if (!browserWallet) {
      throw new Error("Wallet not connected");
    }
    const signedTx = await browserWallet.signTx(unsignedTx);
    if (!signedTx) {
      throw new Error("Failed to sign data");
    }
    return signedTx;
  },

  submitTx: async (signedTx: string) => {
    const { browserWallet } = get();
    if (!browserWallet) {
      throw new Error("Wallet not connected");
    }
    const txHash = await browserWallet.submitTx(signedTx);
    if (!txHash) {
      throw new Error("Failed to submit transaction");
    }
    return txHash;
  },

  disconnect: async () => {
    set({ browserWallet: null, walletName: null, address: null });
  },
}));
