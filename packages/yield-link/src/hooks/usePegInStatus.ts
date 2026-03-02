"use client";

import { useQuery } from "@tanstack/react-query";
import type { PegInStatusResult } from "../flyover/types";

const PEGIN_STATUS_QUERY_KEY = ["pegin-status"] as const;

export interface UsePegInStatusOptions {
  /** Quote hash to poll */
  quoteHash: string | null;
  /** Flyover getStatus function from useFlyover */
  getStatus: (quoteHash: string) => Promise<PegInStatusResult>;
  /** Poll interval in milliseconds. Default 10 000. Set to 0 to disable. */
  pollIntervalMs?: number;
  /** Automatically stop polling when peg-in succeeds or fails */
  stopWhenComplete?: boolean;
}

/**
 * Polls the Flyover SDK for peg-in status every `pollIntervalMs` milliseconds.
 * Polling stops automatically when the quote completes or fails (if `stopWhenComplete` is true).
 */
export function usePegInStatus({
  quoteHash,
  getStatus,
  pollIntervalMs = 10_000,
  stopWhenComplete = true,
}: UsePegInStatusOptions) {
  const query = useQuery({
    queryKey: [...PEGIN_STATUS_QUERY_KEY, quoteHash],
    queryFn: () => getStatus(quoteHash!),
    enabled: !!quoteHash,
    refetchInterval: (q) => {
      if (!quoteHash || pollIntervalMs <= 0) return false;
      const data = q.state.data as PegInStatusResult | undefined;
      if (stopWhenComplete && (data?.isComplete || data?.isFailed)) return false;
      return pollIntervalMs;
    },
  });

  const isComplete = query.data?.isComplete ?? false;
  const isFailed = query.data?.isFailed ?? false;

  return {
    /** Full PegInStatusResult (or null before first fetch) */
    status: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    /** True once Flyover confirms rBTC delivery */
    isComplete,
    /** True when the peg-in quote expired or LP failed to deliver */
    isFailed,
  };
}
