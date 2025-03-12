"use client";

import Link from "next/link";
import { CardanoWallet } from "@/components/common/cardano-wallet";

function Header() {
  return (
    <header className="flex h-16 items-center justify-between py-6 border-b">
      <Link href="/" className="text-lg font-semibold">
        Cardano Marketplace
      </Link>
      <CardanoWallet persist={true} />
    </header>
  );
}

export { Header };
