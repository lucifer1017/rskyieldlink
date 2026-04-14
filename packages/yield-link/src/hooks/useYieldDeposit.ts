"use client";

import { useCallback, useEffect, useRef } from "react";
import { useFlyover } from "./useFlyover";
import { usePegInStatus } from "./usePegInStatus";
import type { FlyoverNetwork } from "../flyover/types";

/**
 * The full lifecycle of a Yield-Link deposit flow.
 *
 * idle           → user hasn't done anything yet
 * creating-quote → Flyover SDK is fetching a peg-in quote
 * waiting-for-btc→ BTC address generated, polling for BTC deposit
 * peg-in-complete→ Flyover confirmed rBTC delivery
 * deposit-pending→ Executing the yield-protocol deposit tx
 * complete       → Yield-protocol deposit confirmed
 * failed         → Peg-in failed/expired (recoverable by creating a new quote)
 * error          → Unexpected error (network, SDK, etc.)
 */
export type DepositFlowStatus =
  | "idle"
  | "creating-quote"
  | "waiting-for-btc"
  | "peg-in-complete"
  | "deposit-pending"
  | "complete"
  | "failed"
  | "error";

export interface UseYieldDepositOptions {
  /** User's Rootstock address (from wallet) */
  rskAddress: `0x${string}` | undefined;
  /** Amount in wei (rBTC) to peg-in */
  amountWei: bigint | undefined;
  /** Flyover network – defaults to Testnet */
  network?: FlyoverNetwork;
  /**
   * Called exactly once when the Flyover peg-in is confirmed.
   * Use this to trigger the subsequent yield-protocol deposit.
   *
   * @param payload.amountWei — the rBTC amount delivered by the LP
   */
  onPegInComplete?: (payload: { amountWei: bigint }) => void;
}

export interface UseYieldDepositResult {
  /** Current flow status */
  status: DepositFlowStatus;
  /** Triggers Flyover quote creation → returns BTC deposit address + QR */
  createQuote: () => Promise<void>;
  /** BTC deposit address (available after a quote is created) */
  btcDepositAddress: string | null;
  /** Base64 data-URL QR code image (available after a quote is created) */
  qrCodeDataUrl: string | null;
  /** Raw peg-in state string from the Flyover SDK */
  pegInState: string | null;
  /** Amount (wei) of rBTC originally requested */
  amountWei: bigint | undefined;
  /** Amount (wei) of rBTC the LP will deliver (from the accepted quote) */
  deliveredAmountWei: bigint | null;
  /** True once Flyover confirms rBTC delivery */
  isPegInComplete: boolean;
  /** True when the peg-in quote expired or the LP failed to deliver */
  isPegInFailed: boolean;
  /** Error object if status === "error" */
  error: Error | null;
  /** True while the Flyover quote request is in-flight */
  isCreatingQuote: boolean;
}

/**
 * Orchestrates the Yield-Link BTC → rBTC → yield-protocol flow.
 *
 * 1. Call `createQuote()` to obtain a Flyover peg-in quote (BTC address + QR).
 * 2. The hook polls the Flyover SDK for peg-in status every 10 s.
 * 3. On confirmation, `onPegInComplete` is called with the delivered rBTC amount.
 *
 * @example
 * const { createQuote, btcDepositAddress, status } = useYieldDeposit({ rskAddress, amountWei });
 */
export function useYieldDeposit(
  options: UseYieldDepositOptions
): UseYieldDepositResult {
  const { rskAddress, amountWei, network = "Testnet", onPegInComplete } = options;

  const flyover = useFlyover({ network });
  const quoteHash = flyover.quoteResult?.quoteHash ?? null;

  const pegInStatus = usePegInStatus({
    quoteHash,
    getStatus: flyover.getStatus,
    pollIntervalMs: 10_000,
    stopWhenComplete: true,
  });

  // Ensure onPegInComplete fires exactly once per unique quote lifecycle.
  const lastFiredQuoteHashRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      pegInStatus.isComplete &&
      onPegInComplete &&
      quoteHash &&
      lastFiredQuoteHashRef.current !== quoteHash
    ) {
      lastFiredQuoteHashRef.current = quoteHash;
      const delivered = flyover.quoteResult?.valueWei ?? amountWei ?? 0n;
      onPegInComplete({ amountWei: delivered });
    }
  }, [
    pegInStatus.isComplete,
    onPegInComplete,
    quoteHash,
    flyover.quoteResult?.valueWei,
    amountWei,
  ]);

  const createQuote = useCallback(async () => {
    if (!rskAddress || !amountWei || amountWei <= 0n) return;
    await flyover.createQuote(rskAddress, amountWei);
  }, [rskAddress, amountWei, flyover.createQuote]);

  const combinedError = (flyover.initError ?? pegInStatus.error) as Error | null;

  const status: DepositFlowStatus = (() => {
    if (combinedError) return "error";
    if (flyover.isCreatingQuote) return "creating-quote";
    if (!flyover.quoteResult) return "idle";
    if (pegInStatus.isFailed) return "failed";
    if (pegInStatus.isComplete) return "peg-in-complete";
    return "waiting-for-btc";
  })();

  return {
    status,
    createQuote,
    btcDepositAddress: flyover.quoteResult?.btcDepositAddress ?? null,
    qrCodeDataUrl: flyover.quoteResult?.qrCodeDataUrl ?? null,
    pegInState: pegInStatus.status?.state ?? null,
    amountWei,
    deliveredAmountWei: flyover.quoteResult?.valueWei ?? null,
    isPegInComplete: pegInStatus.isComplete,
    isPegInFailed: pegInStatus.isFailed,
    error: combinedError,
    isCreatingQuote: flyover.isCreatingQuote,
  };
}
