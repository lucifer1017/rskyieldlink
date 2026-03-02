/**
 * Standard ERC-4626 Tokenized Vault ABI.
 * Works with any ERC-4626 compliant vault that accepts native tokens (rBTC).
 *
 * EIP-4626: https://eips.ethereum.org/EIPS/eip-4626
 */
export const ERC4626_ABI = [
  // Write: deposit assets, mint shares to receiver
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
  // Write: mint exact shares, deposit assets from caller
  {
    inputs: [
      { name: "shares", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    name: "mint",
    outputs: [{ name: "assets", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  // Read: address of the underlying asset
  {
    inputs: [],
    name: "asset",
    outputs: [{ name: "assetTokenAddress", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  // Read: share balance of an account
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Read: preview deposit — how many shares for a given asset amount
  {
    inputs: [{ name: "assets", type: "uint256" }],
    name: "previewDeposit",
    outputs: [{ name: "shares", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Read: total assets managed by the vault
  {
    inputs: [],
    name: "totalAssets",
    outputs: [{ name: "totalManagedAssets", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
