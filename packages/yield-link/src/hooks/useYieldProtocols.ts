"use client";

import { useMemo } from "react";
import { WHITELISTED_PROTOCOLS } from "../config/protocols";
import type { YieldProtocol } from "../types";
import type { FlyoverNetwork } from "../flyover/types";

const CHAIN_ID_BY_NETWORK: Record<FlyoverNetwork, number> = {
  Mainnet: 30,
  Testnet: 31,
};

export interface UseYieldProtocolsResult {
  /** All whitelisted protocols for the active network */
  protocols: YieldProtocol[];
  /** Look up a single protocol by its ID */
  getProtocol: (id: string) => YieldProtocol | undefined;
}

/**
 * Returns the whitelisted yield protocols available for the given Flyover network.
 *
 * APY values are currently static. Extend this hook to fetch live APY from
 * Sovryn's API or another on-chain data source.
 *
 * @example
 * const { protocols, getProtocol } = useYieldProtocols("Testnet");
 * const sovryn = getProtocol("sovryn");
 */
export function useYieldProtocols(
  network: FlyoverNetwork = "Testnet"
): UseYieldProtocolsResult {
  const chainId = CHAIN_ID_BY_NETWORK[network];

  const protocols = useMemo(
    () => WHITELISTED_PROTOCOLS.filter((p) => p.chainId === chainId),
    [chainId]
  );

  const getProtocol = useMemo<(id: string) => YieldProtocol | undefined>(
    () => (id: string) => protocols.find((p) => p.id === id),
    [protocols]
  );

  return { protocols, getProtocol };
}
