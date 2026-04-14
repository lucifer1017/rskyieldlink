/**
 * Yield-Link utility helpers.
 * Pure functions – no side effects, no imports from the rest of the SDK.
 */

// ─── Amount formatting ────────────────────────────────────────────────────────

const WEI_PER_BTC = 10n ** 18n;

/**
 * Convert a wei bigint (18-decimal rBTC) to a readable BTC/rBTC string.
 * @example formatWeiAsBtc(1_000_000_000_000_000n) → "0.00100000"
 */
export function formatWeiAsBtc(wei: bigint, decimals = 8): string {
  if (wei <= 0n) return "0." + "0".repeat(decimals);
  const whole = wei / WEI_PER_BTC;
  const remainder = wei % WEI_PER_BTC;
  const fractional = remainder.toString().padStart(18, "0").slice(0, decimals);
  return `${whole}.${fractional}`;
}

/**
 * Parse a user-entered BTC amount string to wei bigint.
 * Returns 0n if the value is invalid.
 */
export function parseBtcToWei(btc: string): bigint {
  try {
    const trimmed = btc.trim();
    // BTC supports up to 8 decimal places (satoshis).
    if (!trimmed || !/^(?:\d+|\d*\.\d{1,8})$/.test(trimmed)) return 0n;
    const [whole = "0", frac = ""] = trimmed.split(".");
    const fracPadded = frac.slice(0, 18).padEnd(18, "0");
    return BigInt(whole) * WEI_PER_BTC + BigInt(fracPadded);
  } catch {
    return 0n;
  }
}

// ─── Address helpers ──────────────────────────────────────────────────────────

/**
 * Truncate a hex address for display.
 * @example truncateAddress("0x1234...abcd", 4) → "0x1234…abcd"
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

// ─── Explorer links ───────────────────────────────────────────────────────────

const EXPLORER_BASE = {
  Mainnet: "https://explorer.rsk.co",
  Testnet: "https://testnet.rskscan.com",
} as const;

/** RSK block explorer URL for a transaction hash. */
export function explorerTxUrl(
  hash: string,
  network: "Mainnet" | "Testnet" = "Testnet"
): string {
  return `${EXPLORER_BASE[network]}/tx/${hash}`;
}

/** RSK block explorer URL for an address. */
export function explorerAddressUrl(
  address: string,
  network: "Mainnet" | "Testnet" = "Testnet"
): string {
  return `${EXPLORER_BASE[network]}/address/${address}`;
}

// ─── Validation ───────────────────────────────────────────────────────────────

/** True if the string looks like a valid Ethereum/RSK hex address. */
export function isValidAddress(address: string): address is `0x${string}` {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

/** True if the wei amount is above zero. */
export function isPositiveAmount(wei: bigint | undefined): boolean {
  return !!wei && wei > 0n;
}
