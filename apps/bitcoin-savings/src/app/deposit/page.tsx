"use client";

import { useState } from "react";
import { useAccount, useConnect } from "wagmi";
import {
  parseBtcToWei,
  useSovrynDeposit,
  useYieldProtocols,
  YieldDeposit,
  SOVRYN_PROTOCOL_ID,
} from "@rootstock-kits/yield-link";
import { Layout } from "../../components/Layout";

const MIN_AMOUNT = "0.0001";
const MAX_AMOUNT = "1";

/**
 * Bitcoin Savings Deposit page.
 *
 * Wires together:
 *  • Wagmi wallet connection
 *  • useSovrynDeposit (Flyover peg-in + Sovryn iRBTC deposit)
 *  • <YieldDeposit /> SDK widget
 */
export default function DepositPage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const injected = connectors.find((c) => c.type === "injected") ?? connectors[0];

  const [amountInput, setAmountInput] = useState("0.001");
  const minAmountWei = parseBtcToWei(MIN_AMOUNT);
  const maxAmountWei = parseBtcToWei(MAX_AMOUNT);
  const trimmedAmountInput = amountInput.trim();

  const { amountWei, amountError } = (() => {
    if (!trimmedAmountInput) {
      return { amountWei: 0n, amountError: "Enter a BTC amount." };
    }

    if (!/^\d+(\.\d+)?$/.test(trimmedAmountInput)) {
      return { amountWei: 0n, amountError: "Enter a valid numeric BTC amount." };
    }

    const parsedWei = parseBtcToWei(trimmedAmountInput);
    if (parsedWei <= 0n) {
      return { amountWei: 0n, amountError: "Enter a positive amount." };
    }

    if (parsedWei < minAmountWei) {
      return { amountWei: parsedWei, amountError: `Minimum is ${MIN_AMOUNT} BTC.` };
    }

    if (parsedWei > maxAmountWei) {
      return { amountWei: parsedWei, amountError: `Maximum is ${MAX_AMOUNT} BTC.` };
    }

    return { amountWei: parsedWei, amountError: null };
  })();

  // Fetch whitelisted protocols for Testnet
  const { getProtocol } = useYieldProtocols("Testnet");
  const sovrynProtocol = getProtocol(SOVRYN_PROTOCOL_ID);

  // All-in-one hook: Flyover peg-in → Sovryn deposit
  const {
    status,
    btcDepositAddress,
    isCreatingQuote,
    isPegInComplete,
    isPegInFailed,
    isDepositing,
    depositTxHash,
    depositError,
    error,
    retryDeposit,
    deliveredAmountWei,
  } = useSovrynDeposit({
    rskAddress: address,
    amountWei: amountWei > 0n ? amountWei : undefined,
    network: "Testnet",
  });

  const isFlowActive =
    !!btcDepositAddress || isCreatingQuote || isDepositing || status === "complete";

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAmountInput(e.target.value);
  }

  // ── Not connected ──────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <Layout>
        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-3xl dark:bg-amber-900/40">
                ₿
              </div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Bitcoin Savings Account
              </h1>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Deposit BTC and earn yield automatically via Sovryn on
                Rootstock Testnet.
              </p>
            </div>

            <button
              type="button"
              onClick={() => injected && connect({ connector: injected })}
              disabled={!injected || isConnecting}
              className="w-full rounded-xl bg-amber-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
            >
              {!injected
                ? "No browser wallet detected"
                : isConnecting
                ? "Connecting…"
                : "Connect Wallet"}
            </button>

            {!injected && (
              <p className="mt-3 text-center text-xs text-zinc-400">
                Install MetaMask or another injected wallet to continue.
              </p>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // ── Connected ──────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="mx-auto max-w-lg space-y-6">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Deposit BTC
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Bridge BTC to rBTC via Flyover, then auto-deposit into Sovryn
            iRBTC lending pool.
          </p>
        </div>

        {/* Amount input */}
        <div>
          <label
            htmlFor="btc-amount"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Amount (BTC)
          </label>
          <div className="relative">
            <input
              id="btc-amount"
              type="number"
              value={amountInput}
              onChange={handleAmountChange}
              step="0.0001"
              min={MIN_AMOUNT}
              max={MAX_AMOUNT}
              disabled={isFlowActive}
              placeholder="0.001"
              aria-invalid={!!amountError}
              aria-describedby={amountError ? "btc-amount-error btc-amount-help" : "btc-amount-help"}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 pr-14 text-sm text-zinc-900 outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-500 dark:focus:ring-amber-800"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-400">
              BTC
            </span>
          </div>
          {amountError && (
            <p id="btc-amount-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {amountError}
            </p>
          )}
          <p id="btc-amount-help" className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Min {MIN_AMOUNT} · Max {MAX_AMOUNT} · Testnet BTC only
          </p>
        </div>

        {/* Main YieldDeposit widget */}
        <YieldDeposit
          rskAddress={address}
          amountWei={amountWei > 0n ? amountWei : undefined}
          protocol={sovrynProtocol}
          network="Testnet"
          overrideStatus={status}
          isDepositing={isDepositing}
          depositTxHash={depositTxHash}
          depositError={depositError}
        />

        {/* Manual deposit button (visible after peg-in if deposit failed) */}
        {isPegInComplete && depositError && !isDepositing && (
          <button
            type="button"
            onClick={() =>
              retryDeposit(
                deliveredAmountWei != null
                  ? { amountWei: deliveredAmountWei }
                  : undefined
              )
            }
            className="w-full rounded-xl border border-amber-400 px-4 py-2.5 text-sm font-semibold text-amber-600 transition-colors hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-900/20"
          >
            Retry Sovryn Deposit
          </button>
        )}

        {/* Peg-in failure notice */}
        {isPegInFailed && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            <p className="font-semibold">Peg-in failed or expired</p>
            <p className="mt-1 text-xs opacity-80">
              The Flyover quote expired before a BTC deposit was detected.
              Reload the page to start again.
            </p>
          </div>
        )}

        {/* General error */}
        {error && !isPegInFailed && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
          >
            <p className="font-semibold">Error</p>
            <p className="mt-1 text-xs opacity-80">{error.message}</p>
          </div>
        )}

        {/* Testnet resource links */}
        <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Testnet Resources
          </p>
          <ul className="space-y-1">
            <li>
              <a
                href="https://coinfaucet.eu/en/btc-testnet/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-600 underline hover:text-amber-700 dark:text-amber-400"
              >
                Testnet BTC Faucet (Coinfaucet)
              </a>
            </li>
            <li>
              <a
                href="https://faucet.rootstock.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-600 underline hover:text-amber-700 dark:text-amber-400"
              >
                Rootstock tRBTC Faucet
              </a>
            </li>
            <li>
              <a
                href="https://testnet.rskscan.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-600 underline hover:text-amber-700 dark:text-amber-400"
              >
                Rootstock Testnet Explorer
              </a>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
