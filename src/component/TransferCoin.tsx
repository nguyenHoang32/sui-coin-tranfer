import { useEffect, useState } from "react";
import TokenSelect, { Token } from "./SelectToken";
import { WalletBalance } from "./WalletBalance";
import {
  ConnectModal,
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { useBalanceQuery } from "../query/useTokenBalance";
import { Transaction } from "@mysten/sui/transactions";
import { SUI_TYPE_ARG, isValidSuiAddress } from "@mysten/sui/utils";
import { NETWORK, SCAN_URL } from "../config";
import { NumericFormat } from "react-number-format";
import { shortenAddress } from "../utils";
import { AddressIcon } from "../icons/address";
import { ExternalLinkIcon } from "lucide-react";

export const TransferCoin = () => {
  const [selectedToken, setSelectedToken] = useState<Token | undefined>();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionDigest, setTransactionDigest] = useState<string | null>(
    null,
  );

  const [receiverAddress, setReceiverAddress] = useState("");
  const { balance, refetch: refetchBalance } = useBalanceQuery(
    selectedToken?.coin_type ?? "",
  );
  const [amount, setAmount] = useState("");
  const [txError, setTxError] = useState<string | null>(null);

  useEffect(() => {
    setAmount("");
  }, [selectedToken]);

  const isAmountValid =
    balance !== undefined &&
    amount !== "" &&
    Number(amount) > 0 &&
    Number(amount) <=
      balance - (selectedToken?.coin_type === SUI_TYPE_ARG ? 0.01 : 0);

  const isAddressValid = isValidSuiAddress(receiverAddress);

  const handleSend = async () => {
    if (!receiverAddress || !amount) {
      setTxError("Receiver address or amount missing");
      return;
    }

    if (!isAddressValid) {
      setTxError("Invalid receiver address");
      return;
    }

    if (!isAmountValid) {
      setTxError(
        selectedToken?.coin_type === SUI_TYPE_ARG
          ? "Amount exceeds balance (remember 0.01 SUI fee)"
          : "Amount exceeds balance",
      );
      return;
    }

    setIsLoading(true);
    setTxError(null);
    setTransactionDigest(null);

    try {
      const amountInMist = Math.floor(Number(amount) * 1e9);
      const tx = new Transaction();

      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountInMist)]);

      tx.transferObjects([coin], tx.pure.address(receiverAddress));

      signAndExecuteTransaction(
        {
          transaction: tx,
          chain: `sui:${NETWORK}`,
        },
        {
          onSuccess: (result) => {
            console.log("Transaction executed successfully:", result);
            setTransactionDigest(result.digest);
            setIsLoading(false);
            refetchBalance();
          },
          onError: (error) => {
            console.error("Error executing transaction:", error);
            setTxError(error.message || "Transaction failed");
            setIsLoading(false);
          },
        },
      );
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      setTxError(error.message || "Failed to create transaction");
      setIsLoading(false);
    }
  };

  const setCustomAmount = (option: "half" | "max") => {
    if (!balance) return;
    switch (option) {
      case "half": {
        setAmount((balance / 2).toString());
        return;
      }
      case "max": {
        // Todo: get realtime fee
        const maxAmount =
          selectedToken?.coin_type === SUI_TYPE_ARG
            ? Math.max(0, balance - 0.01)
            : balance;
        setAmount(maxAmount.toString());
        return;
      }
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto border border-gray-300 rounded-lg p-4">
      {currentAccount ? (
        <a
          href={`${SCAN_URL}/account/${currentAccount.address}/portfolio`}
          target="_blank"
          className="flex items-center gap-2 border rounded-lg px-2 py-1 border-gray-300 mb-2 font-bold"
        >
          <AddressIcon className="w-8 h-8" />
          {shortenAddress(currentAccount.address)}
          <ExternalLinkIcon className="text-gray-400" />
        </a>
      ) : (
        ""
      )}
      <p className="font-medium">Receiver address</p>
      <input
        className={`mt-2 text-lg font-medium w-full
          focus:outline-none
          border ${isAddressValid || receiverAddress === "" ? "border-slate-400" : "border-red-500"}
          focus:border-slate-500  
          focus:ring-1 focus:ring-slate-400
          rounded-lg px-3 py-1
          transition-all duration-200 ease-in-out
          placeholder:text-gray-400`}
        placeholder="Input receiver address"
        type="text"
        value={receiverAddress}
        onChange={(e) => {
          const value = e.target.value;
          setReceiverAddress(value);
        }}
      />
      {!isAddressValid && receiverAddress !== "" && (
        <p className="text-red-500 text-sm mt-1">Invalid Sui address</p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <p>You send</p>
        <div className="flex items-center gap-6 text-orange-500">
          <button
            className="cursor-pointer"
            onClick={() => setCustomAmount("half")}
          >
            Half
          </button>
          <button
            className="cursor-pointer"
            onClick={() => setCustomAmount("max")}
          >
            Max
          </button>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <TokenSelect
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
          wrapperClassName=""
        />
        <NumericFormat
          thousandSeparator=","
          className={`text-2xl font-bold min-w-[160px] text-right
            focus:outline-none focus:ring-1 ring-slate-400 
            border ${isAmountValid || amount === "" ? "border-slate-400" : "border-red-500"}
            focus:border-slate-500
            rounded-lg px-3 py-1
            transition-all duration-200 ease-in-out
            placeholder:text-gray-400`}
          value={amount}
          size={amount ? amount.length : 1}
          onValueChange={(values) => {
            const value = values.value.replace(/[^0-9.]/g, "");
            if ((value.match(/\./g) || []).length <= 1) {
              setAmount(value);
            }
            values.value;
          }}
        />
      </div>
      {!isAmountValid && amount !== "" && (
        <p className="text-red-500 text-sm mt-1">
          {selectedToken?.coin_type === SUI_TYPE_ARG
            ? "Amount exceeds your balance (remember 0.01 SUI fee)"
            : "Amount exceeds your balance"}
        </p>
      )}
      <WalletBalance
        coinType={selectedToken?.coin_type ?? SUI_TYPE_ARG}
        wrapperClassName="mt-3"
      />

      {currentAccount ? (
        <button
          onClick={handleSend}
          disabled={isLoading || !isAmountValid || !isAddressValid}
          className={`mt-4 text-white ${isLoading || !isAmountValid || !isAddressValid ? "bg-gray-500" : "bg-black"} w-full rounded-2xl py-1.5 cursor-pointer`}
        >
          {isLoading ? "Processing..." : "Send"}
        </button>
      ) : (
        <button
          onClick={() => {
            setOpen(true);
          }}
          className={`mt-4 text-white bg-black w-full rounded-2xl py-1.5 cursor-pointer`}
        >
          Connect wallet
        </button>
      )}

      {txError && (
        <div className="mt-2 text-red-500 text-sm text-center">{txError}</div>
      )}

      {transactionDigest && (
        <div className="mt-2 text-green-600 text-sm text-center">
          Transaction successful!{" "}
          <a href={`${SCAN_URL}/tx/${transactionDigest}`} target="_blank">
            {transactionDigest.substring(0, 8)}...
          </a>
        </div>
      )}
      <ConnectModal
        trigger={<></>}
        open={open}
        onOpenChange={(isOpen) => setOpen(isOpen)}
      />
    </div>
  );
};
