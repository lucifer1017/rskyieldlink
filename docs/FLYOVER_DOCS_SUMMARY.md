# Flyover SDK & Protocol – Documentation Summary

Comprehensive extraction from Rootstock Flyover docs + SDK source for Yield-Link implementation.

---

## 1. Peg-In Flow (BTC → rBTC)

```
1. Get LPs          → flyover.getLiquidityProviders()
2. Select LP        → flyover.useLiquidityProvider(provider)
3. Get quotes       → flyover.getQuotes(peginQuoteRequest)
4. Accept quote     → flyover.acceptQuote(quotes[0])
5. User sends BTC   → to depositAddress from accepted quote status
6. Poll status      → flyover.getPeginStatus(quoteHash)
7. On CallForUserSucceeded → rBTC delivered to callEoaOrContractAddress
```

---

## 2. SDK Initialization

### FlyoverConfig (required fields)

```typescript
interface FlyoverConfig {
  network: 'Mainnet' | 'Testnet' | 'Regtest' | 'Alphanet' | 'Development';
  captchaTokenResolver: () => Promise<string>;  // MANDATORY – some LPs require human-only quotes
  rskConnection?: Connection;                    // For signing/broadcasting (depositPegout, registerPegin, etc.)
  allowInsecureConnections?: boolean;           // Default false
  customLbcAddress?: string;                    // For Regtest
  disableChecksum?: boolean;                    // Default false
}
```

### RSK Connection

```typescript
// With wallet (MetaMask, etc.)
const rsk = await BlockchainConnection.createUsingStandard(window.ethereum);
await flyover.connectToRsk(rsk);

// Read-only (no signing)
const rsk = await BlockchainReadOnlyConnection.createUsingRpc(rpcUrl);
```

### CaptchaTokenResolver

- Some LPs use invisible reCAPTCHA v2 for human-only quotes.
- Signature: `() => Promise<string>`
- Return the token from a successful captcha challenge.
- For LPs that don’t require it, can return `Promise.resolve('')` or a placeholder.

---

## 3. PeginQuoteRequest

```typescript
interface PeginQuoteRequest {
  rskRefundAddress: string;           // User RSK address – rBTC destination (or refund if fail)
  callEoaOrContractAddress: string;  // Where to send rBTC / execute call
  callContractArguments: string;     // Data for contract call (hex, "0x" if EOA)
  valueToTransfer: bigint;           // Amount in wei (rBTC)
}
```

For Yield-Link:

- `rskRefundAddress` = user’s Rootstock address (refund if LP fails).
- `callEoaOrContractAddress` = user’s address (rBTC goes here, then user signs deposit).
- `callContractArguments` = `"0x"` (no contract call, just transfer).
- `valueToTransfer` = amount in wei (e.g. from `estimateRecommendedPegin`).

---

## 4. Quote & Accept Flow

### Get quotes

```typescript
flyover.useLiquidityProvider(providers[0]);
const quotes = await flyover.getQuotes(peginQuoteRequest);
```

### Accept quote

```typescript
const acceptedQuote = await flyover.acceptQuote(quotes[0]);
// Returns: { bitcoinDepositAddressHash, signature }
```

### Get deposit address & status

```typescript
const status = await flyover.getPeginStatus(quoteHash);
// status.status.depositAddress  → BTC address user sends to
// status.status.state           → WaitingForDeposit | WaitingForDepositConfirmations | CallForUserSucceeded | etc.
```

---

## 5. Quote States (RetainedPeginQuoteDTO.state)

| State                      | Meaning                                      |
|----------------------------|----------------------------------------------|
| WaitingForDeposit          | User has not sent BTC yet                    |
| WaitingForDepositConfirmations | BTC sent, waiting for confirmations     |
| TimeForDepositElapsed      | User did not deposit in time                 |
| CallForUserSucceeded       | LP delivered rBTC to user                    |
| CallForUserFailed          | LP call failed                               |
| RegisterPegInSucceeded     | Peg-in fully registered                      |
| RegisterPegInFailed        | Registration failed                          |

For Yield-Link: trigger deposit when `state === 'CallForUserSucceeded'`.

---

## 6. Peg-In Completion Detection

1. Poll: `flyover.getPeginStatus(quoteHash)` until `state === 'CallForUserSucceeded'`.
2. `getSimpleQuoteStatus(status)` → `'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED'`.
3. `isQuotePaid(quoteHash, 'pegin')` → `{ isPaid: boolean }`.

---

## 7. QR Code

```typescript
flyover.generateQrCode(address: string, amount: string, blockchain: string): Promise<string>
// blockchain: "Bitcoin" | "RSK"
// Returns base64 or data URL for QR image
```

---

## 8. LBC Addresses (FlyoverNetworks)

| Network    | LBC Address                                   | Chain ID |
|------------|-----------------------------------------------|----------|
| Mainnet    | 0xAA9cAf1e3967600578727F975F283446A3Da6612   | 30       |
| Testnet    | 0xc2A630c053D12D63d32b025082f6Ba268db18300   | 31       |
| Development| 0x18D8212bC00106b93070123f325021C723D503a3   | 31       |
| Regtest    | 0x03f23ae1917722d5a27a2ea0bcc98725a2a2a49a   | 33       |

---

## 9. Fee Estimation

```typescript
const recommended = await flyover.estimateRecommendedPegin(
  amountWei,
  { data: '0x', destinationAddress: userRskAddress }
);
// recommended.recommendedQuoteValue  → use as valueToTransfer in PeginQuoteRequest
// recommended.estimatedCallFee, estimatedGasFee, estimatedProductFee
```

---

## 10. Bitcoin Data Source (optional)

For refund checks and validation:

```typescript
// Mempool.space (public)
const mempool = new Mempool('mainnet' | 'testnet');
flyover.connectToBitcoin(mempool);
```

---

## 11. Refund

```typescript
const refundable = await flyover.isPeginRefundable({
  quote,
  providerSignature: acceptedQuote.signature,
  btcTransactionHash: userBtcTxHash
});
// If refundable.isRefundable → user can get refund via registerPegin or LP flow
```

---

## 12. Yield-Link Implementation Checklist

| Step | SDK Method / Data                         |
|------|-------------------------------------------|
| Init | `new Flyover({ network, captchaTokenResolver, rskConnection? })` |
| Connect RSK | `connectToRsk(BlockchainConnection)` or pass in config |
| Get LPs | `getLiquidityProviders()`                 |
| Select LP | `useLiquidityProvider(provider)`          |
| Estimate | `estimateRecommendedPegin(amount, { data, destinationAddress })` |
| Quote request | `PeginQuoteRequest` with rskRefundAddress, callEoaOrContractAddress, valueToTransfer |
| Get quotes | `getQuotes(peginQuoteRequest)`             |
| Accept | `acceptQuote(quotes[0])`                   |
| Get BTC address | `getPeginStatus(quoteHash)` → `status.status.depositAddress` |
| QR code | `generateQrCode(depositAddress, amountBtc, 'Bitcoin')` |
| Poll completion | `getPeginStatus(quoteHash)` until `CallForUserSucceeded` |
| Trigger deposit | When CallForUserSucceeded → user signs deposit() to yield contract |

---

## 13. Exports from @rsksmart/flyover-sdk

```typescript
import {
  Flyover,
  FlyoverNetworks,
  FlyoverUtils,
  FlyoverError,
  Mempool,
  type PeginQuoteRequest,
  type GetPeginQuoteResponse as Quote,
  type PeginQuoteStatusDTO as PeginQuoteStatus,
  type AcceptPeginRespose as AcceptedQuote,
  type LiquidityProvider,
} from '@rsksmart/flyover-sdk';
```

From `@rsksmart/bridges-core-sdk`:

```typescript
import {
  BlockchainConnection,
  BlockchainReadOnlyConnection,
  type FlyoverConfig,
  type Network,
} from '@rsksmart/bridges-core-sdk';
```

---

## 14. LP Design – Workflow Notes

- LP can call `registerPegin` on behalf of the user.
- If LP call fails: LP keeps call fee; rest refunded to `rskRefundAddress`.
- If LP fails to deliver: LBC slashes LP collateral; user refunded to `rskRefundAddress`.
- No third party ever holds custody of funds.
