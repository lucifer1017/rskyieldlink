/** Peg-in quote result for Yield-Link */
export interface PegInQuoteResult {
  /** BTC address user sends to */
  btcDepositAddress: string;
  /** Quote hash for status polling */
  quoteHash: string;
  /** Amount in wei (rBTC) */
  valueWei: bigint;
  /** QR code data URL (base64) */
  qrCodeDataUrl: string;
  /** LP provider signature */
  providerSignature: string;
}

/** Peg-in status for UI */
export type PegInState =
  | "WaitingForDeposit"
  | "WaitingForDepositConfirmations"
  | "TimeForDepositElapsed"
  | "CallForUserSucceeded"
  | "CallForUserFailed"
  | "RegisterPegInSucceeded"
  | "RegisterPegInFailed";

export interface PegInStatusResult {
  state: PegInState;
  depositAddress: string;
  quoteHash: string;
  /** True when rBTC has been delivered to user (CallForUserSucceeded / RegisterPegInSucceeded) */
  isComplete: boolean;
  /** True when the peg-in has permanently failed (CallForUserFailed / RegisterPegInFailed) */
  isFailed: boolean;
}

/** Flyover network */
export type FlyoverNetwork = "Mainnet" | "Testnet";
