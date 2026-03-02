/**
 * Sovryn LoanToken / iRBTC deposit interface.
 * Sovryn Zero lending: deposit rBTC → receive iRBTC (interest-bearing).
 *
 * Supports:
 * - ERC-4626: deposit(uint256 assets, address receiver)
 * - Sovryn LoanToken: mint(address receiver, uint256 depositAmount)
 *
 * Verify addresses at: https://github.com/DistributedCollective/Sovryn-smart-contracts
 * or https://sovryn.app
 */

export const SOVRYN_LOAN_TOKEN_ABI = [
  {
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    name: "deposit",
    outputs: [{ name: "shares", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "_receiver", type: "address" },
      { name: "_depositAmount", type: "uint256" },
    ],
    name: "mint",
    outputs: [{ name: "mintedAmount", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
] as const;
