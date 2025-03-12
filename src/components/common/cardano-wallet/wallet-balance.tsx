/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { Wallet } from "@meshsdk/common";
import { useLovelace } from "@meshsdk/react";
import { ChevronDown } from "lucide-react";

export const WalletBalance = ({
  connected,
  connecting,
  label,
  wallet,
}: {
  connected: boolean;
  connecting: boolean;
  label: string;
  wallet: Wallet | undefined;
}) => {
  const lovelace = useLovelace();

  return connected && lovelace && wallet?.icon ? (
    <>
      <img className="m-2 h-6" src={wallet.icon} />₳ {parseInt((parseInt(lovelace, 10) / 1_000_000).toString(), 10)}.
      <span className="text-xs">{lovelace.substring(lovelace.length - 6)}</span>
    </>
  ) : connected && wallet?.icon ? (
    <>
      <img className="m-2 h-6" src={wallet.icon} />
    </>
  ) : connecting ? (
    <>Connecting...</>
  ) : (
    <>
      {label} <ChevronDown />
    </>
  );
};
