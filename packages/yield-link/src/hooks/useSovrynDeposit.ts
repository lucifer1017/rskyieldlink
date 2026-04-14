"use client";

import { useCallback, useState } from "react";
import { getWalletClient } from "wagmi/actions";
import { useConfig, useWalletClient, useSwitchChain } from "wagmi";
import { useYieldDeposit } from "./useYieldDeposit";
import type { DepositFlowStatus } from "./useYieldDeposit";
import { getAdapter } from "../adapters/registry";
import { SOVRYN_PROTOCOL_ID, WHITELISTED_PROTOCOLS } from "../config/protocols";
import type { YieldProtocol } from "../types";
import {
  ROOTSTOCK_MAINNET_CHAIN_ID,
  ROOTSTOCK_TESTNET_CHAIN_ID,
} from "../config/networks";

export interface UseSovrynDepositOptions {
  /** Connected wallet address on Rootstock */
  rskAddress: `0x${string}` | undefined;
  /** Desired deposit amount in wei (rBTC) */
  amountWei: bigint | undefined;
  /** Network to operate on – defaults to Testnet */
  network?: "Mainnet" | "Testnet";
}

export interface UseSovrynDepositResult {
  /** Full deposit-flow status (includes deposit-pending / complete) */
  status: DepositFlowStatus;
  /** Triggers Flyover quote creation */
  createQuote: () => Promise<void>;
  /** BTC deposit address from Flyover (after quote) */
  btcDepositAddress: string | null;
  /** Base64 QR code for the BTC deposit address */
  qrCodeDataUrl: string | null;
  /** Raw peg-in state string from Flyover SDK */
  pegInState: string | null;
  /** Amount in wei originally requested */
  amountWei: bigint | undefined;
  /** rBTC amount the LP will deliver (from accepted quote) */
  deliveredAmountWei: bigint | null;
  /** True once Flyover confirms rBTC delivery */
  isPegInComplete: boolean;
  /** True when peg-in quote expired or LP failed */
  isPegInFailed: boolean;
  /** True while executing the Sovryn deposit transaction */
  isDepositing: boolean;
  /** True while creating the Flyover quote */
  isCreatingQuote: boolean;
  /** Sovryn deposit tx hash (on success) */
  depositTxHash: `0x${string}` | undefined;
  /** Sovryn deposit error (if the deposit tx failed) */
  depositError: Error | undefined;
  /** Peg-in / init error */
  error: Error | null;
  /** The Sovryn protocol config used for this deposit */
  protocol: YieldProtocol | undefined;
  /** Manually trigger the Sovryn deposit (useful after peg-in if auto-trigger fails) */
  retryDeposit: (payload?: { amountWei: bigint }) => Promise<void>;
}

/**
 * All-in-one hook: Flyover peg-in → Sovryn iRBTC deposit.
 *
 * 1. Call `createQuote()` to get a BTC deposit address + QR code.
 * 2. Once Flyover confirms rBTC delivery, the hook automatically deposits
 *    into Sovryn's iRBTC lending pool via LoanToken.mint().
 * 3. The full flow status is exposed through `status`, covering every stage
 *    from idle → quote → bridging → depositing → complete.
 *
 * Requires a WagmiProvider and a connected wallet on Rootstock Testnet.
 */
export function useSovrynDeposit(
  options: UseSovrynDepositOptions
): UseSovrynDepositResult {
  const { rskAddress, amountWei, network = "Testnet" } = options;

  const chainId =
    network === "Mainnet"
      ? ROOTSTOCK_MAINNET_CHAIN_ID
      : ROOTSTOCK_TESTNET_CHAIN_ID;

  const protocol: YieldProtocol | undefined = WHITELISTED_PROTOCOLS.find(
    (p) => p.id === SOVRYN_PROTOCOL_ID && p.chainId === chainId
  );

  const { data: walletClient } = useWalletClient();
  const wagmiConfig = useConfig();
  const { switchChainAsync } = useSwitchChain();

  const [depositTxHash, setDepositTxHash] = useState<`0x${string}` | undefined>();
  const [depositError, setDepositError] = useState<Error | undefined>();
  const [isDepositing, setIsDepositing] = useState(false);

  /**
   * Builds the raw-transaction executor:
   * • Switches to Rootstock if the wallet is on a different chain
   * • Sends the encoded LoanToken.mint() calldata
   */
  const executor = useCallback(
    async (params: { to: `0x${string}`; data: `0x${string}`; value: bigint }) => {
      if (!walletClient) throw new Error("No wallet connected.");

      let txClient = walletClient;
      if (txClient.chain?.id !== chainId && switchChainAsync) {
        await switchChainAsync({ chainId });
        const switchedClient = await getWalletClient(wagmiConfig, { chainId });
        if (!switchedClient) {
          throw new Error("Wallet not available after network switch.");
        }
        txClient = switchedClient;
      }

      return txClient.sendTransaction({
        to: params.to,
        data: params.data,
        value: params.value,
        chainId,
      });
    },
    [walletClient, chainId, switchChainAsync, wagmiConfig]
  );

  /**
   * Executes the Sovryn deposit with the delivered rBTC amount.
   * Called automatically by useYieldDeposit when peg-in completes.
   */
  const executeDeposit = useCallback(
    async (payload?: { amountWei: bigint }) => {
      const amount = payload?.amountWei ?? amountWei;
      setDepositError(undefined);
      setDepositTxHash(undefined);

      if (!rskAddress) {
        setDepositError(new Error("Connect your wallet before depositing."));
        return;
      }
      if (!amount || amount <= 0n) {
        setDepositError(new Error("Deposit amount is invalid."));
        return;
      }
      if (!protocol) {
        setDepositError(new Error("Selected yield protocol is unavailable."));
        return;
      }

      const adapter = getAdapter(SOVRYN_PROTOCOL_ID);
      if (!adapter) {
        setDepositError(new Error("Sovryn adapter is not registered."));
        return;
      }

      setIsDepositing(true);

      try {
        const hash = await adapter.deposit(amount, rskAddress, protocol, executor);
        setDepositTxHash(hash);
      } catch (err) {
        setDepositError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsDepositing(false);
      }
    },
    [rskAddress, amountWei, protocol, executor]
  );

  const yieldDeposit = useYieldDeposit({
    rskAddress,
    amountWei,
    network,
    onPegInComplete: executeDeposit,
  });

  // Extend the base status to cover Sovryn-specific stages
  const status: DepositFlowStatus = (() => {
    if (yieldDeposit.status === "peg-in-complete") {
      if (isDepositing) return "deposit-pending";
      if (depositTxHash) return "complete";
      if (depositError) return "error";
      // peg-in just finished, waiting to start deposit
      return "deposit-pending";
    }
    return yieldDeposit.status;
  })();

  return {
    ...yieldDeposit,
    status,
    isDepositing,
    depositTxHash,
    depositError,
    protocol,
    retryDeposit: executeDeposit,
  };
}
