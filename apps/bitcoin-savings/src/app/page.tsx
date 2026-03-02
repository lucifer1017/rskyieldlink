import Link from "next/link";
import { Layout } from "../components/Layout";

const FEATURES = [
  {
    icon: "⚡",
    title: "Fast BTC Bridge",
    description:
      "Flyover protocol bridges native BTC to rBTC in ~20 minutes — no custodians, no wrapping.",
  },
  {
    icon: "📈",
    title: "Auto Yield",
    description:
      "Once bridged, rBTC is automatically deposited into Sovryn's iRBTC lending pool to earn yield.",
  },
  {
    icon: "🔐",
    title: "Non-Custodial",
    description:
      "You hold your private keys at all times. The widget never takes custody of your funds.",
  },
  {
    icon: "🌐",
    title: "Bitcoin-Secured",
    description:
      "Rootstock is merge-mined with Bitcoin, inheriting its proof-of-work security.",
  },
];

const STEPS = [
  { step: "1", title: "Connect Wallet", description: "Connect your MetaMask or compatible wallet to Rootstock Testnet." },
  { step: "2", title: "Enter Amount", description: "Choose how much test BTC you want to deposit." },
  { step: "3", title: "Send BTC", description: "Scan the QR code and send test BTC from your testnet wallet." },
  { step: "4", title: "Earn Yield", description: "Flyover bridges and Sovryn starts accruing interest — automatically." },
];

export default function HomePage() {
  return (
    <Layout>
      <div className="space-y-20">
        {/* Hero */}
        <section className="py-10 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            Rootstock Testnet — demo only
          </div>

          <h1 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Bitcoin Savings Account
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-zinc-500 dark:text-zinc-400">
            Deposit native BTC and earn DeFi yield on Rootstock — in one step.
            No manual bridging, no protocol-hopping.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/deposit"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 dark:hover:bg-amber-400"
            >
              Start Saving
              <span aria-hidden>→</span>
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              View on GitHub
            </a>
          </div>
        </section>

        {/* How it works */}
        <section>
          <h2 className="mb-8 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            How it works
          </h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ step, title, description }) => (
              <li
                key={step}
                className="relative rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                  {step}
                </span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Features */}
        <section>
          <h2 className="mb-8 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Why Yield-Link?
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map(({ icon, title, description }) => (
              <div
                key={title}
                className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <section className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-center text-sm text-amber-700 dark:text-amber-300">
            <strong>Testnet demo only.</strong> Never use real BTC or mainnet
            funds. Obtain test BTC from{" "}
            <a
              href="https://coinfaucet.eu/en/btc-testnet/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              Coinfaucet
            </a>{" "}
            and tRBTC from{" "}
            <a
              href="https://faucet.rootstock.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              Rootstock Faucet
            </a>
            .
          </p>
        </section>
      </div>
    </Layout>
  );
}
