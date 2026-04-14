"use client";

import { useState } from "react";
import { truncateAddress } from "../utils";

export interface PegInQRCodeProps {
  /** BTC address to send funds to */
  btcDepositAddress: string;
  /** Data URL (base64) returned by Flyover SDK */
  qrCodeDataUrl: string | null;
  /** Human-readable BTC amount (e.g. "0.001") */
  amountBtc?: string;
  /** Optional network label shown below address */
  network?: "Mainnet" | "Testnet";
}

/**
 * Displays the BTC deposit address + QR code with a copy-to-clipboard button.
 */
export function PegInQRCode({
  btcDepositAddress,
  qrCodeDataUrl,
  amountBtc,
  network = "Testnet",
}: PegInQRCodeProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  async function handleCopy() {
    setCopyError(null);

    try {
      await navigator.clipboard.writeText(btcDepositAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    } catch {}

    // Fallback for browsers/contexts where Clipboard API is unavailable.
    const textArea = document.createElement("textarea");
    textArea.value = btcDepositAddress;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "absolute";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();

    try {
      const success = document.execCommand("copy");
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        setCopyError("Copy failed. Please copy the address manually.");
      }
    } catch {
      setCopyError("Copy failed. Please copy the address manually.");
    } finally {
      document.body.removeChild(textArea);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Network badge */}
      {network === "Testnet" && (
        <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          Testnet — use test BTC only
        </span>
      )}

      {/* QR Code */}
      {qrCodeDataUrl ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <img
            src={qrCodeDataUrl}
            alt={`QR code for BTC deposit address ${btcDepositAddress}`}
            width={180}
            height={180}
            className="rounded-lg"
          />
        </div>
      ) : (
        <div className="flex h-[206px] w-[206px] items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
        </div>
      )}

      {/* Amount instruction */}
      {amountBtc && (
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Send exactly{" "}
          <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
            {amountBtc} {network === "Testnet" ? "tBTC" : "BTC"}
          </span>
        </p>
      )}

      {/* Address + Copy */}
      <div className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
        <span
          title={btcDepositAddress}
          className="flex-1 truncate font-mono text-xs text-zinc-700 dark:text-zinc-300"
        >
          {truncateAddress(btcDepositAddress, 8)}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy BTC deposit address"
          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      {copyError && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {copyError}
        </p>
      )}

      {/* Helper tip */}
      <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
        Flyover bridges BTC → rBTC in ~20 min. Keep this page open.
      </p>
    </div>
  );
}
