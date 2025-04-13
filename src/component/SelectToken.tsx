import { ChevronDownIcon } from "@radix-ui/themes";
import { useState, useMemo, useEffect } from "react";

export interface Token {
  coin_type: string; // "address::wal::WAL"
  name: string;
  symbol: string;
  logo: string;
  price: string;
  price_change_1h: number;
  price_change_6h: number;
  price_change_1d: number;
  tx_24h: number;
  volume_24h: string;
  maker_24h: number;
  market_cap: string;
  liquidity_usd: string;
  circulating_supply: string;
  total_supply: string;
  published_at: string;
  verified: boolean;
}

interface Props {
  selectedToken?: Token;
  setSelectedToken: (token: Token) => void;
}

const NUMBER_PER_PAGE = 20;

const TokenSelect = ({ selectedToken, setSelectedToken }: Props) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Todo: search and infinity scroll
  const getList = async () => {
    try {
      const res = await fetch(
        "https://api-staging.noodles.fi/api/v1/token/list",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pagination: {
              offset: (page - 1) * NUMBER_PER_PAGE,
              limit: NUMBER_PER_PAGE,
            },
          }),
        }
      );
      if (res.status == 200) {
        const body = await res.json();
        // Set default token if not exists
        if (!selectedToken?.coin_type) {
          setSelectedToken(body.data[0]);
        }
        setTokens(body.data);
      } else {
        throw res.status;
      }
    } catch (error) {
      console.error(`Get list tokens error`, error);
    }
  };

  useEffect(() => {
    getList();
  }, [page]);

  console.log(selectedToken);
  console.log(tokens);
  return (
    <div className="border border-gray-400 rounded-xl px-2 py-1 w-max cursor-pointer hover:border-blue-400">
      {selectedToken && (
        <div className="flex items-center gap-2">
          <img src={selectedToken.logo} alt="token" className="w-4 h-4" />
          <p>{selectedToken.symbol}</p>
          <ChevronDownIcon />
        </div>
      )}
    </div>
  );
};

export default TokenSelect;
