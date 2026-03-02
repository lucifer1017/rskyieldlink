"use client";

import Link from "next/link";
import { useAccount, useConnect, useDisconnect } from "wagmi";

/**
 * Global app header with wallet connection status.
 */
export function Header() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const injected = connectors.find((c) => c.type === "injected") ?? connectors[0];

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        {/* Logo / Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
        >
          <span className="text-lg">₿</span>
          <span>Bitcoin Savings</span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            Testnet
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-6 text-sm sm:flex">
          <Link
            href="/"
            className="text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Home
          </Link>
          <Link
            href="/deposit"
            className="text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Deposit
          </Link>
        </nav>

        {/* Wallet */}
        <div className="flex items-center gap-2">
          {isConnected && address ? (
            <>
              <span className="hidden rounded-lg border border-zinc-200 px-3 py-1.5 font-mono text-xs text-zinc-600 sm:block dark:border-zinc-700 dark:text-zinc-400">
                {address.slice(0, 6)}…{address.slice(-4)}
              </span>
              <button
                type="button"
                onClick={() => disconnect()}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => injected && connect({ connector: injected })}
              disabled={!injected || isPending}
              className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50 dark:hover:bg-amber-400"
            >
              {!injected ? "No wallet" : isPending ? "Connecting…" : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
