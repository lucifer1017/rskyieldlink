"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import type { Flyover } from "@rsksmart/flyover-sdk";
import {
  createFlyoverClient,
  type CreateFlyoverClientOptions,
} from "../flyover/flyover-client";
import {
  createAndAcceptPegInQuote,
  getPegInStatus,
} from "../flyover/peg-in-service";
import type { PegInQuoteResult, PegInStatusResult } from "../flyover/types";

const FLYOVER_QUERY_KEY = ["flyover-client"] as const;
const PEGIN_STATUS_QUERY_KEY = ["pegin-status"] as const;

export interface UseFlyoverOptions extends CreateFlyoverClientOptions {
  /** Poll interval for peg-in status (ms). Default 10_000 */
  pollIntervalMs?: number;
}

export interface UseFlyoverResult {
  /** Flyover client (null until initialized) */
  flyover: Flyover | null;
  /** Whether Flyover is initializing */
  isInitializing: boolean;
  /** Error during initialization */
  initError: Error | null;
  /** Create peg-in quote and accept it */
  createQuote: (rskAddress: `0x${string}`, amountWei: bigint) => Promise<PegInQuoteResult>;
  /** Whether quote creation is in progress */
  isCreatingQuote: boolean;
  /** Last created quote result */
  quoteResult: PegInQuoteResult | null;
  /** Poll peg-in status by quote hash */
  getStatus: (quoteHash: string) => Promise<PegInStatusResult>;
  /** Refetch peg-in status (for polling) */
  refetchPegInStatus: (quoteHash: string) => Promise<PegInStatusResult | undefined>;
}

/**
 * Hook for Flyover peg-in operations.
 * Creates a Flyover client on mount and provides quote creation + status polling.
 */
export function useFlyover(options: UseFlyoverOptions): UseFlyoverResult {
  const {
    network,
    captchaTokenResolver,
    pollIntervalMs = 10_000,
  } = options;

  const queryClient = useQueryClient();
  const [quoteResult, setQuoteResult] = useState<PegInQuoteResult | null>(null);

  const {
    data: flyover,
    isLoading: isInitializing,
    error: initError,
  } = useQuery({
    queryKey: [...FLYOVER_QUERY_KEY, network],
    queryFn: () => createFlyoverClient({ network, captchaTokenResolver }),
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
  });

  const createQuoteMutation = useMutation({
    mutationFn: async ({
      rskAddress,
      amountWei,
    }: {
      rskAddress: `0x${string}`;
      amountWei: bigint;
    }) => {
      if (!flyover) throw new Error("Flyover not initialized");
      return createAndAcceptPegInQuote(flyover, rskAddress, amountWei);
    },
    onSuccess: (data) => {
      setQuoteResult(data);
    },
  });

  const createQuote = useCallback(
    async (rskAddress: `0x${string}`, amountWei: bigint) => {
      const result = await createQuoteMutation.mutateAsync({
        rskAddress,
        amountWei,
      });
      return result;
    },
    [createQuoteMutation]
  );

  const getStatus = useCallback(
    async (quoteHash: string): Promise<PegInStatusResult> => {
      if (!flyover) throw new Error("Flyover not initialized");
      return getPegInStatus(flyover, quoteHash);
    },
    [flyover]
  );

  const refetchPegInStatus = useCallback(
    async (quoteHash: string) => {
      if (!flyover) return undefined;
      const status = await getPegInStatus(flyover, quoteHash);
      queryClient.setQueryData(
        [...PEGIN_STATUS_QUERY_KEY, quoteHash],
        status
      );
      return status;
    },
    [flyover, queryClient]
  );

  return useMemo(
    () => ({
      flyover: flyover ?? null,
      isInitializing,
      initError: initError as Error | null,
      createQuote,
      isCreatingQuote: createQuoteMutation.isPending,
      quoteResult,
      getStatus,
      refetchPegInStatus,
    }),
    [
      flyover,
      isInitializing,
      initError,
      createQuote,
      createQuoteMutation.isPending,
      quoteResult,
      getStatus,
      refetchPegInStatus,
    ]
  );
}
