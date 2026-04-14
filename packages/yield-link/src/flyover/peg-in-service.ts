import type { Flyover } from "@rsksmart/flyover-sdk";
import type { PegInQuoteResult, PegInStatusResult } from "./types";
import {
  selectFirstLiquidityProvider,
  buildPeginQuoteRequest,
  getRecommendedPeginValue,
  FlyoverUtils,
} from "./flyover-client";
import { formatWeiAsBtc } from "../utils";

const WEI_PER_SATOSHI = 10n ** 10n;

function ceilWeiToSatoshi(wei: bigint): bigint {
  if (wei <= 0n) return 0n;
  return ((wei + WEI_PER_SATOSHI - 1n) / WEI_PER_SATOSHI) * WEI_PER_SATOSHI;
}

/**
 * Uses the SDK's own FlyoverUtils.getSimpleQuoteStatus to determine completion.
 * Returns 'SUCCESS' for CallForUserSucceeded / RegisterPegInSucceeded.
 * Returns 'FAILED' for CallForUserFailed / RegisterPegInFailed.
 * Returns 'EXPIRED' for TimeForDepositElapsed.
 * Returns 'PENDING' for all other in-progress states.
 */
function isPeginComplete(state: string): boolean {
  return FlyoverUtils.getSimpleQuoteStatus(state) === "SUCCESS";
}

function isPeginFailed(state: string): boolean {
  return FlyoverUtils.getSimpleQuoteStatus(state) === "FAILED";
}

/**
 * Creates a peg-in quote, accepts it, and returns deposit details + QR code.
 */
export async function createAndAcceptPegInQuote(
  flyover: Flyover,
  rskAddress: `0x${string}`,
  amountWei: bigint
): Promise<PegInQuoteResult> {
  const provider = await selectFirstLiquidityProvider(flyover);
  if (!provider) {
    throw new Error("No liquidity providers available");
  }

  const recommendedValue = await getRecommendedPeginValue(
    flyover,
    amountWei,
    rskAddress
  );
  const quoteRequest = buildPeginQuoteRequest(rskAddress, recommendedValue);

  const quotes = await flyover.getQuotes(quoteRequest);
  if (!quotes.length) {
    throw new Error("No quotes available from liquidity provider");
  }

  const acceptedQuote = await flyover.acceptQuote(quotes[0]);

  // getPeginStatus returns PeginQuoteStatusDTO where .status is RetainedPeginQuoteDTO (required)
  const statusDto = await flyover.getPeginStatus(quotes[0].quoteHash);
  const depositAddress = statusDto.status.depositAddress;
  if (!depositAddress) {
    throw new Error("Could not get BTC deposit address from quote status");
  }

  const valueWei = FlyoverUtils.getQuoteTotal(quotes[0]);
  // BTC transfers are satoshi-based (8 decimals). Round up to avoid underpaying.
  const qrAmountWei = ceilWeiToSatoshi(valueWei);
  const amountBtc = formatWeiAsBtc(qrAmountWei, 8);
  const qrCodeDataUrl = await flyover.generateQrCode(
    depositAddress,
    amountBtc,
    "Bitcoin"
  );

  return {
    btcDepositAddress: depositAddress,
    quoteHash: quotes[0].quoteHash,
    valueWei,
    qrCodeDataUrl,
    providerSignature: acceptedQuote.signature,
  };
}

/**
 * Fetches current peg-in status.
 * Uses FlyoverUtils.getSimpleQuoteStatus for robust completion/failure detection.
 */
export async function getPegInStatus(
  flyover: Flyover,
  quoteHash: string
): Promise<PegInStatusResult> {
  const statusDto = await flyover.getPeginStatus(quoteHash);
  // .status is required per PeginQuoteStatusDTO, but guard defensively for runtime safety
  const retained = statusDto.status;
  const state = (retained?.state ?? "WaitingForDeposit") as PegInStatusResult["state"];
  const depositAddress = retained?.depositAddress ?? "";

  return {
    state,
    depositAddress,
    quoteHash,
    isComplete: isPeginComplete(state),
    isFailed: isPeginFailed(state),
  };
}
