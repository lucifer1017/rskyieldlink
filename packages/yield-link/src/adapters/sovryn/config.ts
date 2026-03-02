/**
 * Sovryn protocol contract addresses on Rootstock.
 *
 * RBTC lending: deposit rBTC → receive iRBTC (interest-bearing loan token).
 *
 * ⚠️  VERIFY ADDRESSES before use:
 *   - Mainnet: https://github.com/DistributedCollective/Sovryn-smart-contracts/blob/development/deployment/deployments.json
 *   - Testnet: https://github.com/DistributedCollective/Sovryn-smart-contracts/blob/development/deployment/testnet_deployments.json
 *   - Explorer: https://explorer.rsk.co (mainnet) | https://testnet.rskscan.com (testnet)
 *
 * Lookup: search for "iRBTC" or "LoanToken" in the deployment files.
 */

import { ROOTSTOCK_MAINNET_CHAIN_ID, ROOTSTOCK_TESTNET_CHAIN_ID } from "../../config/networks";

/**
 * Sovryn iRBTC LoanToken – RSK Mainnet (Chain ID 30).
 * The LoanToken.mint() function accepts rBTC deposits and returns interest-bearing iRBTC.
 *
 * ⚠️  MUST VERIFY: Confirm at https://explorer.rsk.co before mainnet use.
 */
export const SOVRYN_RBTC_LENDING_MAINNET =
  "0xa9DcC8C8Bf1E03e7a5Eed3D7C3E5D9E6dF7Fdb2" as const;

/**
 * Sovryn iRBTC LoanToken – RSK Testnet (Chain ID 31).
 * The LoanToken.mint() function accepts tRBTC deposits on testnet.
 *
 * ⚠️  MUST VERIFY: Confirm at https://testnet.rskscan.com before use.
 *   - If you get a "transaction reverted" error, this address needs updating.
 *   - Find it in Sovryn's testnet deployment JSON on GitHub (link above).
 */
export const SOVRYN_RBTC_LENDING_TESTNET =
  "0xe67Fe227e0504e8e96A34C3594795756dC26e14d" as const;

export const SOVRYN_CONTRACTS = {
  [ROOTSTOCK_MAINNET_CHAIN_ID]: SOVRYN_RBTC_LENDING_MAINNET,
  [ROOTSTOCK_TESTNET_CHAIN_ID]: SOVRYN_RBTC_LENDING_TESTNET,
} as const;
