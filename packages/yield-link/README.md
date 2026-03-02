# @rootstock-kits/yield-link

One-Click Savings widget: Deposit native BTC → Flyover bridge → Yield protocol on Rootstock.

## Installation

```bash
npm install @rootstock-kits/yield-link
```

## Usage

### Generic Yield Deposit

```tsx
import { YieldDeposit } from "@rootstock-kits/yield-link/components";
import { useYieldDeposit } from "@rootstock-kits/yield-link/hooks";
```

### Sovryn (recommended)

```tsx
import { useSovrynDeposit } from "@rootstock-kits/yield-link/hooks";

// Flyover peg-in + automatic Sovryn deposit on completion
const { createQuote, btcDepositAddress, qrCodeDataUrl, isPegInComplete } =
  useSovrynDeposit({ rskAddress, amountWei, network: "Testnet" });
```

## Peer Dependencies

- react ^18 || ^19
- react-dom ^18 || ^19
- wagmi
- viem
- @tanstack/react-query

Ensure your app has these installed.
