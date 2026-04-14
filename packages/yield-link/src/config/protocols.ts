import type { YieldProtocol } from "../types";
import {
  ROOTSTOCK_MAINNET_CHAIN_ID,
  ROOTSTOCK_TESTNET_CHAIN_ID,
} from "./networks";
import {
  SOVRYN_RBTC_LENDING_MAINNET,
  SOVRYN_RBTC_LENDING_TESTNET,
} from "../adapters/sovryn/config";

export const SOVRYN_PROTOCOL_ID = "sovryn";

export const WHITELISTED_PROTOCOLS: YieldProtocol[] = [
  {
    id: SOVRYN_PROTOCOL_ID,
    name: "Sovryn",
    apy: undefined,
    contractAddress: SOVRYN_RBTC_LENDING_MAINNET,
    chainId: ROOTSTOCK_MAINNET_CHAIN_ID,
  },
  {
    id: SOVRYN_PROTOCOL_ID,
    name: "Sovryn (Testnet)",
    apy: undefined,
    contractAddress: SOVRYN_RBTC_LENDING_TESTNET,
    chainId: ROOTSTOCK_TESTNET_CHAIN_ID,
  },
];
