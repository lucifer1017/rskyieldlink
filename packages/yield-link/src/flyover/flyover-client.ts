import {
  Flyover,
  FlyoverUtils,
  type LiquidityProvider,
  type PeginQuoteRequest,
  type Quote,
} from "@rsksmart/flyover-sdk";
import { BlockchainReadOnlyConnection } from "@rsksmart/bridges-core-sdk";
import type { FlyoverNetwork } from "./types";
import {
  ROOTSTOCK_MAINNET_RPC,
  ROOTSTOCK_TESTNET_RPC,
} from "../config/networks";

const RPC_BY_NETWORK: Record<FlyoverNetwork, string> = {
  Mainnet: ROOTSTOCK_MAINNET_RPC,
  Testnet: ROOTSTOCK_TESTNET_RPC,
};

/** Default captcha resolver – returns empty string for LPs that don't require it */
const DEFAULT_CAPTCHA_RESOLVER = () => Promise.resolve("");

export interface CreateFlyoverClientOptions {
  network: FlyoverNetwork;
  captchaTokenResolver?: () => Promise<string>;
}

/**
 * Creates and initializes a Flyover client with read-only RSK connection.
 * Uses public RPC – no wallet required for quote/accept flow.
 */
export async function createFlyoverClient(
  options: CreateFlyoverClientOptions
): Promise<Flyover> {
  const { network, captchaTokenResolver = DEFAULT_CAPTCHA_RESOLVER } = options;

  const rskConnection = await BlockchainReadOnlyConnection.createUsingRpc(
    RPC_BY_NETWORK[network]
  );

  const flyover = new Flyover({
    network,
    captchaTokenResolver,
    rskConnection,
  });

  return flyover;
}

/**
 * Fetches LPs and selects the first available one.
 */
export async function selectFirstLiquidityProvider(
  flyover: Flyover
): Promise<LiquidityProvider | null> {
  const providers = await flyover.getLiquidityProviders();
  const available = providers.filter((p) => p.status);
  if (available.length === 0) return null;
  flyover.useLiquidityProvider(available[0]);
  return available[0];
}

/**
 * Builds PeginQuoteRequest for Yield-Link (simple transfer to user address).
 */
export function buildPeginQuoteRequest(
  rskRefundAddress: `0x${string}`,
  amountWei: bigint
): PeginQuoteRequest {
  return {
    rskRefundAddress,
    callEoaOrContractAddress: rskRefundAddress,
    callContractArguments: "0x",
    valueToTransfer: amountWei,
  };
}

/**
 * Gets recommended quote value for a target amount (accounts for fees).
 */
export async function getRecommendedPeginValue(
  flyover: Flyover,
  amountWei: bigint,
  destinationAddress: `0x${string}`
): Promise<bigint> {
  const recommended = await flyover.estimateRecommendedPegin(amountWei, {
    data: "0x",
    destinationAddress,
  });
  return recommended.recommendedQuoteValue;
}

export { FlyoverUtils };
export type { Quote };
