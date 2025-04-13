import { useCurrentAccount } from "@mysten/dapp-kit";

export const WalletBalance = () => {
  const currentAccount = useCurrentAccount();
  console.log("current account", currentAccount);
  return <></>;
};
