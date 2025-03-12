import { useEffect, useState } from "react";

import { useWallet, useWalletList } from "@meshsdk/react";
import ButtonDropdown from "./button-dropdown";
import { WalletBalance } from "./wallet-balance";
import { MenuItem } from "./menu-item";
import { useRouter } from "next/navigation";

interface ButtonProps {
  label?: string;
  onConnected?: () => void;
  persist?: boolean;
  isDark?: boolean;
  extensions?: number[];
}

export const CardanoWallet = ({
  label = "Connect Wallet",
  onConnected = undefined,
  persist = false,
  isDark = false,
  extensions = [],
}: ButtonProps) => {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hideMenuList, setHideMenuList] = useState(true);

  const { connect, connecting, connected, disconnect, name, setPersist } = useWallet();
  const wallets = useWalletList();
  
  useEffect(() => {
    setPersist(persist);
  }, [persist, setPersist]);

  useEffect(() => {
    if (connected && onConnected) {
      onConnected();
    }
  }, [connected, onConnected]);

  useEffect(() => {
    setIsDarkMode(isDark);
  }, [isDark]);

  return (
    <div onMouseEnter={() => setHideMenuList(false)} onMouseLeave={() => setHideMenuList(true)} style={{ width: "min-content", zIndex: 50 }}>
      <ButtonDropdown isDarkMode={isDarkMode} hideMenuList={hideMenuList} setHideMenuList={setHideMenuList}>
        <WalletBalance connected={connected} connecting={connecting} label={label} wallet={wallets.find((wallet) => wallet.id === name)} />
      </ButtonDropdown>
      <div
        className={`mr-menu-list absolute w-60 rounded-b-md border text-center shadow-sm backdrop-blur ${hideMenuList && "hidden"} ${isDarkMode ? `bg-neutral-950	text-neutral-50` : `bg-neutral-50	text-neutral-950`}`}
        style={{ zIndex: 50 }}
      >
        {!connected && wallets.length > 0 ? (
          <>
            {wallets.map((wallet, index) => (
              <MenuItem
                key={index}
                icon={wallet.icon}
                label={wallet.name}
                action={() => {
                  connect(wallet.id, extensions, persist);
                  setHideMenuList(!hideMenuList);
                }}
                active={name === wallet.id}
              />
            ))}
          </>
        ) : wallets.length === 0 ? (
          <span>No Wallet Found</span>
        ) : (
          <>
            <MenuItem active={false} label="Go Profile" action={() => router.push("/profile")} icon={undefined} />
            <MenuItem active={false} label="disconnect" action={disconnect} icon={undefined} />
          </>
        )}
      </div>
    </div>
  );
};
