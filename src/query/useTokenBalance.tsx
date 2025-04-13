import { useQuery } from "@tanstack/react-query";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";

export function useBalanceQuery(coinType: string) {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  const queryResult = useQuery({
    queryKey: ["balance", coinType],
    queryFn: () =>
      suiClient.getCoins({
        owner: account?.address!,
        coinType,
      }),
    enabled: !!coinType && Boolean(account?.address),
    select: (data) => {
      const totalBalance = data.data.reduce(
        (sum, coin) => sum + BigInt(coin.balance),
        BigInt(0),
      );

      // Todo: Decimal ???
      const formattedBalance = parseFloat(
        (Number(totalBalance) / 10 ** 9).toFixed(2),
      );

      return {
        rawBalance: totalBalance,
        formattedBalance,
        coins: data.data,
      };
    },
  });

  return {
    ...queryResult,
    balance: queryResult.data?.formattedBalance ?? 0,
    rawBalance: queryResult.data?.rawBalance ?? BigInt(0),
    coins: queryResult.data?.coins ?? [],
  };
}
