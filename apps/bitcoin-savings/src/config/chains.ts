/**
 * Rootstock Testnet – demo is built for testnet.
 * Chain ID: 31
 * RPC: https://public-node.testnet.rsk.co
 */
import { defineChain } from "viem";

export const rootstockTestnet = defineChain({
  id: 31,
  name: "Rootstock Testnet",
  nativeCurrency: { name: "RBTC", symbol: "tRBTC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://public-node.testnet.rsk.co"] },
  },
  blockExplorers: {
    default: {
      name: "RSK Explorer",
      url: "https://explorer.testnet.rootstock.io",
    },
  },
});
