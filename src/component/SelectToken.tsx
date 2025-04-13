import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useState, useMemo, useEffect, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { SUI_TYPE_ARG } from "@mysten/sui/utils";

export interface Token {
  coin_type: string;
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
  wrapperClassName?: string;
}

const NUMBER_PER_PAGE = 20;

const DEFAULT_SUI_TOKEN: Token = {
  coin_type: SUI_TYPE_ARG,
  name: "Sui",
  symbol: "SUI",
  logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png",
  price: "0.00",
  price_change_1h: 0,
  price_change_6h: 0,
  price_change_1d: 0,
  tx_24h: 0,
  volume_24h: "0",
  maker_24h: 0,
  market_cap: "0",
  liquidity_usd: "0",
  circulating_supply: "0",
  total_supply: "0",
  published_at: "",
  verified: true,
};

const TokenSelect = ({
  selectedToken,
  setSelectedToken,
  wrapperClassName,
}: Props) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedToken) {
      setSelectedToken(DEFAULT_SUI_TOKEN);
    }
  }, [selectedToken, setSelectedToken]);

  const filteredTokens = useMemo(() => {
    if (!searchQuery) return tokens;
    return tokens.filter(
      (token) =>
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.coin_type.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [tokens, searchQuery]);

  const loadTokens = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const url = searchQuery ? "https://api-staging.noodles.fi/api/v1/token/info-list" : "https://api-staging.noodles.fi/api/v1/token/list"
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pagination: {
            offset: (page - 1) * NUMBER_PER_PAGE,
            limit: NUMBER_PER_PAGE,
          },
          ...(searchQuery && {
            search: {
              query: searchQuery,
            },
          }),
        }),
      });

      if (res.status === 200) {
        const body = await res.json();
        const newTokens = page === 1 ? body.data : [...tokens, ...body.data];
        
        // ensure sui token always in list
        const suiTokenExists = newTokens.some((token: Token) => token.coin_type === SUI_TYPE_ARG);
        const tokensToSet = suiTokenExists ? newTokens : [DEFAULT_SUI_TOKEN, ...newTokens];
        
        setTokens(tokensToSet);
        setHasMore(body.data.length === NUMBER_PER_PAGE);
      }
    } catch (error) {
      console.error("Error loading tokens:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, isLoading, tokens]);

  useEffect(() => {
    loadTokens();
  }, [page, searchQuery]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (scrollHeight - scrollTop <= clientHeight * 1.2 && !isLoading && hasMore) {
        setPage((prev) => prev + 1);
      }
    },
    [isLoading, hasMore],
  );

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Trigger asChild>
          <div
            className={`border border-gray-400 rounded-xl px-2 py-1 w-max cursor-pointer hover:border-blue-400 ${wrapperClassName}`}
          >
            {selectedToken && (
              <div className="flex items-center gap-2">
                <img
                  src={selectedToken.logo}
                  alt="token"
                  className="w-4 h-4"
                />
                <p className="text-gray-900">{selectedToken.symbol}</p>
                <ChevronDownIcon />
              </div>
            )}
          </div>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0" />
          <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
            <Dialog.Title className="text-lg font-medium mb-4 text-gray-900">
              Select Token
            </Dialog.Title>

            <div className="relative mb-4">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search token name"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div
              className="max-h-[60vh] overflow-y-auto pr-2"
              onScroll={handleScroll}
            >
              {filteredTokens.map((token) => (
                <div
                  key={token.coin_type}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                    selectedToken?.coin_type === token.coin_type
                      ? "bg-blue-50"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedToken(token);
                    setIsOpen(false);
                  }}
                >
                  <img
                    src={token.logo}
                    alt={token.symbol}
                    className="w-6 h-6"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{token.symbol}</span>
                      {token.verified && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{token.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">${token.price}</div>
                   
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}
              {!isLoading && filteredTokens.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No tokens found
                </div>
              )}
            </div>

            <Dialog.Close asChild>
              <button
                className="absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:outline-none text-gray-900"
                aria-label="Close"
              >
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default TokenSelect;