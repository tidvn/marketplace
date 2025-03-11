"use client";

import { CardanoWallet } from "@meshsdk/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";


function Header() {
  return (
    <header className="flex h-16 items-center justify-between py-6">
      <Link href="/" className="text-lg font-semibold">
        Cardano Marketplace
      </Link>
      <Button variant="destructive">Click me</Button>
      <CardanoWallet isDark={false} persist={true} />
    </header>
  );
}

export { Header };
