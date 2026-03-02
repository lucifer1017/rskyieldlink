# Yield-Link: Folder Structure & Tech Stack

## Demo: Rootstock Testnet

The Bitcoin Savings demo is built for **Rootstock Testnet** (Chain ID 31):

- Wagmi config: Rootstock Testnet only
- Flyover: `network: "Testnet"`
- Sovryn: Testnet contract addresses
- Test funds: [Coinfaucet](https://coinfaucet.eu/en/btc-testnet/) (BTC), [Rootstock Faucet](https://faucet.rootstock.io/) (tRBTC)

## Folder Structure

```
rskyieldlink/
├── packages/
│   └── yield-link/                    # @rootstock-kits/yield-link
│       ├── src/
│       │   ├── adapters/               # Protocol adapters (standard ABI interfaces)
│       │   │   ├── index.ts
│       │   │   ├── types.ts            # IYieldAdapter interface
│       │   │   ├── sovryn.adapter.ts
│       │   │   ├── vault.adapter.ts    # ERC-4626 vault adapter
│       │   │   └── registry.ts         # Whitelist / adapter registry
│       │   ├── flyover/                # Flyover hook integration
│       │   │   ├── index.ts
│       │   │   ├── flyover-hook.ts     # PegIn lifecycle, LP selection
│       │   │   ├── peg-in-listener.ts  # Event detection / polling
│       │   │   └── types.ts
│       │   ├── chain/                  # Execution chaining
│       │   │   ├── index.ts
│       │   │   ├── execution-chain.ts  # PegIn → deposit orchestration
│       │   │   └── types.ts
│       │   ├── components/             # UI components
│       │   │   ├── index.ts
│       │   │   ├── YieldDeposit.tsx    # Main card component
│       │   │   ├── PegInQRCode.tsx     # BTC deposit QR
│       │   │   ├── APYDisplay.tsx
│       │   │   └── StatusStepper.tsx   # Flow status (peg-in → deposit → done)
│       │   ├── hooks/
│       │   │   ├── index.ts
│       │   │   ├── useFlyover.ts       # Flyover SDK wrapper
│       │   │   ├── usePegInStatus.ts   # Poll/listen PegIn completion
│       │   │   ├── useYieldDeposit.ts  # Combined flow hook
│       │   │   └── useYieldProtocols.ts # Fetch whitelisted protocols + APY
│       │   ├── config/
│       │   │   ├── index.ts
│       │   │   ├── networks.ts         # Rootstock mainnet/testnet
│       │   │   ├── protocols.ts        # Whitelisted yield protocols
│       │   │   └── constants.ts
│       │   ├── types/
│       │   │   └── index.ts
│       │   ├── utils/
│       │   │   └── index.ts
│       │   └── index.ts                # Public exports
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsup.config.ts
│       └── README.md
│
├── apps/
│   └── bitcoin-savings/               # "Bitcoin Savings Account" demo dApp
│       ├── src/
│       │   ├── pages/
│       │   │   ├── index.tsx           # Landing
│       │   │   ├── deposit.tsx         # Deposit flow (uses YieldDeposit)
│       │   │   └── dashboard.tsx       # Portfolio / positions
│       │   ├── components/
│       │   │   ├── Header.tsx
│       │   │   ├── WalletConnect.tsx
│       │   │   └── Layout.tsx
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── public/
│       ├── .env.example
│       ├── package.json
│       ├── tsconfig.json
│       └── next.config.ts
│
├── package.json                       # Root workspace (npm workspaces)
├── tsconfig.base.json
├── .gitignore
├── .env.example
│
├── ARCHITECTURE.md                     # This file
└── README.md
```

---

## Tech Stack

### Core

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Language** | TypeScript 5.x | Type safety across SDK and app |
| **Package Manager** | npm | Workspace support |
| **Monorepo** | npm workspaces | Single repo for SDK + demo app |

### Yield-Link Package

| Dependency | Version | Purpose |
|------------|---------|---------|
| **@rsksmart/flyover-sdk** | ^1.8.0 | BTC→RBTC peg-in, LP selection, quotes |
| **viem** | ^2.x | Contract calls, Rootstock RPC, wallet |
| **wagmi** | ^2.x | React hooks for wallet, chain, config |
| **@tanstack/react-query** | ^5.x | PegIn status polling, quote caching |
| **React** | ^18.x | Peer – UI components |
| **zustand** | ^4.x | Lightweight state (optional, for flow state) |

### Demo App

| Dependency | Version | Purpose |
|------------|---------|---------|
| **@rootstock-kits/yield-link** | workspace:* | The SDK package |
| **React** | ^18.x | UI |
| **Next.js** | ^16.x | Build tool |
| **wagmi** | ^2.x | Wallet config |
| **viem** | ^2.x | Chain config |
| **@tanstack/react-query** | ^5.x | Data fetching |
| **TailwindCSS** | ^4 | Styling |
| **wagmi** | ^3.x | Wallet connection (no RainbowKit) |

### Build & Tooling

| Tool | Purpose |
|------|---------|
| **tsup** | Bundle SDK (ESM + CJS, tree-shakeable) |
| **Vite** | Dev server + build for demo app |
| **Vitest** | Unit tests |
| **ESLint** | Linting |
| **Prettier** | Formatting |

---

## Dependency Summary

### Root `package.json` scripts

```json
{
  "scripts": {
    "build": "npm run build --workspaces --if-present",
    "dev": "npm run dev --workspace=bitcoin-savings",
    "dev:sdk": "npm run dev --workspace=@rootstock-kits/yield-link",
    "lint": "npm run lint --workspaces --if-present"
  }
}
```

### Yield-Link Package Dependencies

```json
{
  "dependencies": {
    "@rsksmart/flyover-sdk": "^1.8.0",
    "viem": "^2.x",
    "wagmi": "^2.x",
    "@tanstack/react-query": "^5.x",
    "zustand": "^4.x"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "tsup": "^8.x",
    "react": "^18.x",
    "react-dom": "^18.x"
  }
}
```

### Demo App Dependencies

```json
{
  "dependencies": {
    "@rootstock-kits/yield-link": "*",
    "react": "^19.x",
    "react-dom": "^19.x",
    "wagmi": "^3.x",
    "viem": "^2.x",
    "@tanstack/react-query": "^5.x",
    "next": "^16.x",
    "tailwindcss": "^4"
  },
  "devDependencies": {
    "typescript": "^5.x"
  }
}
```

---

## Rootstock Chain Config

| Network | Chain ID | RPC URL |
|---------|----------|---------|
| Rootstock Mainnet | 30 | https://public-node.rsk.co |
| Rootstock Testnet | 31 | https://public-node.testnet.rsk.co |

---

## Design Decisions

1. **viem over ethers.js** – wagmi v2 uses viem; keeps stack consistent.
2. **tsup for SDK** – simple library bundling with ESM/CJS.
3. **npm workspaces** – monorepo.
4. **Adapter pattern** – `IYieldAdapter` for Sovryn, vaults, future protocols.
5. **Hooks-first API** – `useYieldDeposit`, `useFlyover` for composability.
6. **TailwindCSS** – no extra styling deps for the SDK; demo app styles the widget.

---

## Next Steps

1. Scaffold root + workspace config.
2. Create `packages/yield-link` with base structure.
3. Create `apps/bitcoin-savings` with Next.js + React.
4. Implement core Flyover hook.
5. Implement protocol adapters.
6. Implement execution chaining.
7. Build `<YieldDeposit />` component.
8. Integrate in demo app.
