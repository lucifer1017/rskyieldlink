"use client";

import type { YieldProtocol } from "../types";
import { useYieldDeposit } from "../hooks/useYieldDeposit";
import type { DepositFlowStatus } from "../hooks/useYieldDeposit";
import { APYDisplay } from "./APYDisplay";
import { PegInQRCode } from "./PegInQRCode";
import { StatusStepper } from "./StatusStepper";
import { explorerTxUrl, formatWeiAsBtc } from "../utils";

export interface YieldDepositProps {
  /** Connected user Rootstock address */
  rskAddress: `0x${string}` | undefined;
  /** Deposit amount in wei (rBTC) */
  amountWei: bigint | undefined;
  /** Selected yield protocol (for APY display) */
  protocol?: YieldProtocol;
  /** Flyover network – defaults to Testnet */
  network?: "Mainnet" | "Testnet";
  /**
   * Called once when the Flyover peg-in is confirmed.
   * Receives the delivered rBTC amount in wei.
   * Use this to trigger the yield-protocol deposit from the consuming app.
   */
  onPegInComplete?: (payload: { amountWei: bigint }) => void;
  /**
   * Override current flow status.
   * Pass this when using a wrapper hook (e.g. useSovrynDeposit) that extends
   * the peg-in status with deposit-pending / complete stages.
   */
  overrideStatus?: DepositFlowStatus;
  /** Sovryn deposit tx hash (shows success link) */
  depositTxHash?: `0x${string}`;
  /** Sovryn deposit error */
  depositError?: Error;
  /** True while executing the yield-protocol deposit tx */
  isDepositing?: boolean;
  /** APY loading state for APYDisplay skeleton */
  isApyLoading?: boolean;
  /** APY source degraded mode */
  isApyDegraded?: boolean;
  /** Last APY refresh timestamp */
  apyUpdatedAt?: Date | null;
}

const STATUS_LABEL: Record<DepositFlowStatus, string> = {
  idle: "Ready",
  "creating-quote": "Generating quote…",
  "waiting-for-btc": "Waiting for BTC deposit",
  "peg-in-complete": "Peg-in complete!",
  "deposit-pending": "Depositing into protocol…",
  complete: "Done — earning yield! 🎉",
  failed: "Peg-in failed or expired",
  error: "Something went wrong",
};

function toUserErrorMessage(error: Error): string {
  const message = error.message.toLowerCase();
  if (message.includes("wallet") || message.includes("user rejected")) {
    return "Wallet confirmation was not completed.";
  }
  if (message.includes("network") || message.includes("chain")) {
    return "Please switch to the expected Rootstock network and retry.";
  }
  if (message.includes("insufficient")) {
    return "Insufficient balance for this action.";
  }
  return "An unexpected error occurred in the deposit flow.";
}

export function YieldDeposit({
  rskAddress,
  amountWei,
  protocol,
  network = "Testnet",
  onPegInComplete,
  overrideStatus,
  depositTxHash,
  depositError,
  isDepositing = false,
  isApyLoading = false,
  isApyDegraded = false,
  apyUpdatedAt,
}: YieldDepositProps) {
  const {
    status: baseStatus,
    createQuote,
    btcDepositAddress,
    qrCodeDataUrl,
    error,
    isCreatingQuote,
  } = useYieldDeposit({ rskAddress, amountWei, network, onPegInComplete });

  const status = overrideStatus ?? baseStatus;
  const amountBtc = amountWei ? formatWeiAsBtc(amountWei, 6) : undefined;

  const canCreateQuote =
    !!rskAddress &&
    !!amountWei &&
    amountWei > 0n &&
    status === "idle";

  const combinedError = error ?? depositError;

  return (
    <div
      data-testid="yield-deposit"
      className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Bitcoin Savings Deposit
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          BTC → rBTC via Flyover · Yield on Rootstock
        </p>
      </div>

      {/* ── Protocol / APY ─────────────────────────────────────────────── */}
      {protocol && (
        <APYDisplay
          protocol={protocol}
          isLoading={isApyLoading}
          isDegraded={isApyDegraded}
          updatedAt={apyUpdatedAt}
        />
      )}

      {/* ── Status Stepper ─────────────────────────────────────────────── */}
      <StatusStepper status={status} />

      {/* ── Status label ───────────────────────────────────────────────── */}
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        {STATUS_LABEL[status]}
      </p>

      {/* ── Action area ────────────────────────────────────────────────── */}
      {!btcDepositAddress ? (
        <button
          type="button"
          onClick={createQuote}
          disabled={!canCreateQuote}
          aria-busy={isCreatingQuote}
          className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-amber-400"
        >
          {isCreatingQuote
            ? "Generating quote…"
            : !rskAddress
            ? "Connect your wallet first"
            : "Generate BTC deposit address"}
        </button>
      ) : (
        <PegInQRCode
          btcDepositAddress={btcDepositAddress}
          qrCodeDataUrl={qrCodeDataUrl}
          amountBtc={amountBtc}
          network={network}
        />
      )}

      {/* ── Sovryn deposit result ───────────────────────────────────────── */}
      {status === "deposit-pending" && isDepositing && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
          Depositing rBTC into {protocol?.name ?? "protocol"}…
        </div>
      )}

      {status === "complete" && depositTxHash && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
          <p className="font-semibold">✓ Deposit confirmed!</p>
          <a
            href={explorerTxUrl(depositTxHash, network)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block truncate font-mono text-xs underline opacity-80 hover:opacity-100"
          >
            {depositTxHash}
          </a>
        </div>
      )}

      {/* ── Error banner ────────────────────────────────────────────────── */}
      {combinedError && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300"
        >
          <p className="font-semibold">Error</p>
          <p className="mt-0.5 text-xs opacity-80">{toUserErrorMessage(combinedError)}</p>
        </div>
      )}
    </div>
  );
}
