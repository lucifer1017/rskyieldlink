"use client";

import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Root page layout: sticky header + main content area.
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
