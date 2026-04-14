import { Layout } from "../../components/Layout";

export default function DepositLoading() {
  return (
    <Layout>
      <div className="mx-auto max-w-lg space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-24 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-72 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </Layout>
  );
}
