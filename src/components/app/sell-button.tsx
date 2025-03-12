"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const SellButton = ({ className }: { className?: string }) => {
  const [price, setPrice] = useState("");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={cn(className)}>Sell</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[425px]">
        <div className="p-4 space-y-6">
          <div>
            <label htmlFor="price" className="block text-lg font-medium mb-2">
              Price
            </label>
            <div className="relative">
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className=" border-gray-700 pr-16 h-14 text-lg"
                placeholder="0"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 pointer-events-none">ADA</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="submit">Send Listing</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
