import { Wallet } from "lucide-react";
import { useBalanceQuery } from "../query/useTokenBalance";

interface Props {
  coinType: string;
  wrapperClassName?: string;
}

export const WalletBalance = ({ coinType, wrapperClassName }: Props) => {
  const { balance, isLoading, isError } = useBalanceQuery(coinType);

  return (
    <div
      className={`flex items-center gap-1 text-gray-400 border rounded-xl border-gray-400 w-max py-1 px-2 ${wrapperClassName}`}
    >
      <Wallet />
      {isLoading ? "Loading..." : balance}
      {isError && <span className="text-red-400">Get balance failed</span>}
    </div>
  );
};
