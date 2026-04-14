"use client";

import { Layout } from "../../components/Layout";

interface DepositErrorProps {
  error: Error;
  reset: () => void;
}

function toUserErrorMessage(error: Error): string {
  const message = error.message.toLowerCase();
  if (message.includes("network") || message.includes("chain")) {
    return "Network issue detected while loading the deposit page.";
  }
  return "The deposit page hit an unexpected error. Please try again.";
}

export default function DepositError({ error, reset }: DepositErrorProps) {
  return (
    <Layout>
      <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
        <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">
          Deposit page failed to load
        </h2>
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {toUserErrorMessage(error)}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    </Layout>
  );
}
