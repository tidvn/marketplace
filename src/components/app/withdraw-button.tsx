"use client";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export const WithdrawButton = ({ className }: { className?: string }) => {
  return <Button className={cn(className)}>Delist</Button>;
};
