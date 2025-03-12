"use client";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export const UpdateButton = ({ className }: { className?: string }) => {
  return <Button className={cn(className)}>Update</Button>;
};
