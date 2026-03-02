import type { IYieldAdapter } from "./types";
import { sovrynAdapter } from "./sovryn/sovryn.adapter";

const ADAPTERS: Map<string, IYieldAdapter> = new Map([
  ["sovryn", sovrynAdapter],
]);

/**
 * Get adapter by protocol ID.
 */
export function getAdapter(protocolId: string): IYieldAdapter | undefined {
  return ADAPTERS.get(protocolId);
}

/**
 * Register a custom adapter.
 */
export function registerAdapter(adapter: IYieldAdapter): void {
  ADAPTERS.set(adapter.protocolId, adapter);
}

/**
 * List all registered protocol IDs.
 */
export function getRegisteredProtocolIds(): string[] {
  return Array.from(ADAPTERS.keys());
}
