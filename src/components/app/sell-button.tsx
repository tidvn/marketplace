"use client";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export const SellButton = ({ className }: { className?: string }) => {
  return <Button className={cn(className)}>Sell</Button>;
};
