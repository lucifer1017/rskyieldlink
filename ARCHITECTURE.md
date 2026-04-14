# Yield-Link Architecture

Yield-Link is a monorepo containing:

- `@rootstock-kits/yield-link` (SDK/widget package)
- `bitcoin-savings` (Next.js demo dApp)

The product chains BTC bridge + yield deposit into one user flow:

1. User creates a Flyover peg-in quote.
2. User sends BTC to the generated address.
3. Flyover delivers rBTC on Rootstock.
4. SDK automatically executes deposit into a whitelisted yield protocol.

## Workspace Layout

```text
rskyieldlink/
├── package.json                   # npm workspaces root
├── tsconfig.base.json             # shared TS defaults
├── ARCHITECTURE.md
├── docs/
│   ├── FLYOVER_DOCS_SUMMARY.md
│   └── SOVRYN_ADAPTER.md
├── packages/
│   └── yield-link/
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsup.config.ts
│       └── src/
│           ├── adapters/          # protocol adapters + registry
│           ├── components/        # YieldDeposit, APYDisplay, stepper, QR
│           ├── config/            # chain/protocol constants
│           ├── flyover/           # SDK client + peg-in services
│           ├── hooks/             # useFlyover/useYieldDeposit/useSovrynDeposit
│           ├── chain/             # shared flow types re-export
│           ├── types/
│           ├── utils/
│           └── index.ts
└── apps/
    └── bitcoin-savings/
        ├── package.json
        ├── next.config.ts
        ├── tsconfig.json
        └── src/
            ├── app/
            │   ├── layout.tsx
            │   ├── page.tsx
            │   ├── providers.tsx
            │   └── deposit/
            │       ├── page.tsx
            │       ├── loading.tsx
            │       └── error.tsx
            ├── components/
            └── config/
```

## Runtime Flow

### 1) UI and wallet

- App uses `wagmi` + `@tanstack/react-query` providers in `apps/bitcoin-savings/src/app/providers.tsx`.
- Wallet connection UI is in `apps/bitcoin-savings/src/components/Header.tsx`.

### 2) Peg-in quote creation

- `useYieldDeposit` calls `useFlyover.createQuote`.
- Flyover service logic is implemented in:
  - `packages/yield-link/src/flyover/flyover-client.ts`
  - `packages/yield-link/src/flyover/peg-in-service.ts`

### 3) Peg-in monitoring

- `usePegInStatus` polls quote state with React Query.
- `useYieldDeposit` maps bridge status to widget flow states.

### 4) Auto protocol deposit

- `useSovrynDeposit` wraps `useYieldDeposit`.
- On peg-in completion, it executes adapter transaction via wallet client.
- Sovryn adapter implementation:
  - `packages/yield-link/src/adapters/sovryn/sovryn.adapter.ts`

## Key Architectural Decisions

- **Hooks-first orchestration:** SDK exposes composable hooks for bridge + deposit stages.
- **Adapter pattern:** each protocol implements `IYieldAdapter` and is registered in adapter registry.
- **Non-custodial execution:** end-user wallet signs protocol deposit transaction.
- **Shared widget UI:** `<YieldDeposit />` can be reused across apps.

## Current Stack (Actual)

- Monorepo: npm workspaces
- App: Next.js 16, React 19, Tailwind 4
- SDK: TypeScript + tsup (ESM + d.ts)
- Web3: wagmi 3 + viem 2
- Bridge: `@rsksmart/flyover-sdk`
- State/query: `@tanstack/react-query`

## Current Constraints

- Demo targets Rootstock Testnet by default.
- Protocol whitelist currently includes Sovryn entries (mainnet + testnet configs).
- Sovryn APY is fetched live on-chain from `supplyInterestRate()` with fallback handling.
- No backend service exists in this repo; all flow logic is frontend/SDK based.
