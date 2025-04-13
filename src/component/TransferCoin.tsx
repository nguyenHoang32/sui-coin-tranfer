import { useEffect, useState } from "react";
import TokenSelect, { Token } from "./SelectToken";
import { WalletBalance } from "./WalletBalance";
import {
  ConnectButton,
  ConnectModal,
  useCurrentAccount,
} from "@mysten/dapp-kit";

// Connec wallet
export const TransferCoin = () => {
  const [selectedToken, setSelectedToken] = useState<Token | undefined>();
  const currentAccount = useCurrentAccount();
  const [open, setOpen] = useState(false);
  console.log(open);
  return (
    <div className="max-w-xl w-full mx-auto border border-gray-300 rounded-lg p-4">
      <p className="font-medium">Receiver address</p>
      <input className="" placeholder="Input receiver address" />

      <section>
        <div>
          <p>You send</p>
          <div>Half</div>
          <div>Max</div>
        </div>
        <TokenSelect
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
        />
        <input className="" />
        <WalletBalance />
        <ConnectButton />
      </section>
    </div>
  );
};
