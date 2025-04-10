"use client";
import { Lexend } from "next/font/google";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { SWRConfig } from "swr";
import "@/styles/globals.css";

const fontSans = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(fontSans.className, `antialiased`)}>
        <SWRConfig>
          <div className="container mx-auto ">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </SWRConfig>
      </body>
    </html>
  );
}
