"use client";

import type { YieldProtocol } from "../types";

export interface APYDisplayProps {
  protocol: YieldProtocol;
  /** Show a loading skeleton instead of the APY value */
  isLoading?: boolean;
  /** Last refresh time for live APY */
  updatedAt?: Date | null;
  /** True when fallback APY state is being used */
  isDegraded?: boolean;
}

/**
 * Displays the yield protocol name, type, and current APY.
 * Renders a loading skeleton when `isLoading` is true.
 */
export function APYDisplay({
  protocol,
  isLoading = false,
  updatedAt,
  isDegraded = false,
}: APYDisplayProps) {
  const updatedLabel = updatedAt
    ? updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/60">
      {/* Protocol info */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-lg dark:bg-amber-900/40">
          ₿
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {protocol.name}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            rBTC Lending Pool
          </p>
        </div>
      </div>

      {/* APY badge */}
      <div className="text-right">
        {isLoading ? (
          <div role="status" aria-live="polite" className="flex flex-col items-end gap-1">
            <span className="sr-only">Loading live APY</span>
            <div aria-hidden="true" className="h-6 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
            <div aria-hidden="true" className="h-3 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
        ) : protocol.apy != null ? (
          <>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {protocol.apy.toFixed(2)}%
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Live APY{updatedLabel ? ` · ${updatedLabel}` : ""}
            </p>
          </>
        ) : (
          <>
            <p className="text-xl font-bold text-zinc-400 dark:text-zinc-500">—%</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isDegraded ? "APY unavailable (fallback)" : "APY (live)"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
