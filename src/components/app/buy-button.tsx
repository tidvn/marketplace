"use client";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export const BuyButton = ({ className }: { className?: string }) => {
  return <Button className={cn(className)}>Buy</Button>;
};
