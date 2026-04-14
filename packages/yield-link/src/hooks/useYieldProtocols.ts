"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { createPublicClient, http } from "viem";
import { WHITELISTED_PROTOCOLS } from "../config/protocols";
import type { YieldProtocol } from "../types";
import type { FlyoverNetwork } from "../flyover/types";
import { ROOTSTOCK_MAINNET_RPC, ROOTSTOCK_TESTNET_RPC } from "../config/networks";
import { SOVRYN_PROTOCOL_ID } from "../config/protocols";

const CHAIN_ID_BY_NETWORK: Record<FlyoverNetwork, number> = {
  Mainnet: 30,
  Testnet: 31,
};

const RPC_BY_NETWORK: Record<FlyoverNetwork, string> = {
  Mainnet: ROOTSTOCK_MAINNET_RPC,
  Testnet: ROOTSTOCK_TESTNET_RPC,
};

const RATE_SCALE = 10n ** 18n;
const BPS_SCALE = 10_000n;
const APY_QUERY_KEY = ["yield-protocol-apy"] as const;

const SOVRYN_LENDING_RATE_ABI = [
  {
    name: "supplyInterestRate",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

const publicClients: Partial<Record<FlyoverNetwork, ReturnType<typeof createPublicClient>>> = {};

function getPublicClient(network: FlyoverNetwork) {
  const existing = publicClients[network];
  if (existing) return existing;

  const client = createPublicClient({
    transport: http(RPC_BY_NETWORK[network]),
  });
  publicClients[network] = client;
  return client;
}

function rateWeiToPercent(rateWei: bigint): number {
  // Keep precision in bigint first, then convert the reduced basis-points number.
  const basisPoints = (rateWei * BPS_SCALE) / RATE_SCALE;
  return Number(basisPoints) / 100;
}

async function fetchProtocolApy(
  protocol: YieldProtocol,
  network: FlyoverNetwork
): Promise<number | undefined> {
  if (protocol.id !== SOVRYN_PROTOCOL_ID) {
    return protocol.apy;
  }

  const client = getPublicClient(network);
  const rateWei = await client.readContract({
    address: protocol.contractAddress,
    abi: SOVRYN_LENDING_RATE_ABI,
    functionName: "supplyInterestRate",
  });

  return rateWeiToPercent(rateWei);
}

export interface UseYieldProtocolsResult {
  /** All whitelisted protocols for the active network */
  protocols: YieldProtocol[];
  /** Look up a single protocol by its ID */
  getProtocol: (id: string) => YieldProtocol | undefined;
  /** True while APY values are being fetched */
  isApyLoading: boolean;
  /** True when one or more APY sources failed and fallback values are used */
  isApyDegraded: boolean;
  /** Query-level APY fetch error */
  apyError: Error | null;
  /** Last successful APY refresh time */
  apyLastUpdatedAt: Date | null;
}

/**
 * Returns the whitelisted yield protocols available for the given Flyover network.
 *
 * For Sovryn protocols, APY is fetched live from the LoanToken contract via
 * `supplyInterestRate()` on the selected network RPC.
 *
 * @example
 * const { protocols, getProtocol, isApyLoading } = useYieldProtocols("Testnet");
 * const sovryn = getProtocol("sovryn");
 */
export function useYieldProtocols(
  network: FlyoverNetwork = "Testnet"
): UseYieldProtocolsResult {
  const chainId = CHAIN_ID_BY_NETWORK[network];

  const baseProtocols = useMemo(
    () => WHITELISTED_PROTOCOLS.filter((p) => p.chainId === chainId),
    [chainId]
  );

  const apyQuery = useQuery({
    queryKey: [...APY_QUERY_KEY, network],
    queryFn: async () => {
      const results = await Promise.all(
        baseProtocols.map(async (protocol) => {
          try {
            const liveApy = await fetchProtocolApy(protocol, network);
            return { protocol: { ...protocol, apy: liveApy }, failed: false };
          } catch {
            // Fallback to static APY/undefined if live source fails.
            return { protocol, failed: true };
          }
        })
      );

      return {
        protocols: results.map((result) => result.protocol),
        hadFailures: results.some((result) => result.failed),
      };
    },
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchInterval: 2 * 60_000,
    retry: 2,
  });

  const protocols = apyQuery.data?.protocols ?? baseProtocols;

  const getProtocol = useCallback(
    (id: string) => protocols.find((p) => p.id === id),
    [protocols]
  );

  return {
    protocols,
    getProtocol,
    isApyLoading: apyQuery.isPending,
    isApyDegraded: apyQuery.data?.hadFailures ?? false,
    apyError: (apyQuery.error as Error | null) ?? null,
    apyLastUpdatedAt:
      apyQuery.dataUpdatedAt > 0 ? new Date(apyQuery.dataUpdatedAt) : null,
  };
}
