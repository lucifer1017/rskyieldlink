# Yield-Link: Direct-to-DeFi Deposit Widget

One-click BTC → RBTC → Yield on Rootstock. Deposit native Bitcoin and earn yield on Sovryn.

## Demo (Testnet)

The **Bitcoin Savings Account** demo app runs on **Rootstock Testnet**:

- **Chain**: Rootstock Testnet (Chain ID 31)
- **Flyover**: Testnet LBC
- **Sovryn**: Testnet iRBTC lending

### Getting test funds

- **Test BTC**: [Coinfaucet](https://coinfaucet.eu/en/btc-testnet/)
- **Test RBTC (tRBTC)**: [Rootstock Faucet](https://faucet.rootstock.io/)

### Run the demo

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and go to **Deposit**.

## Packages

- `packages/yield-link` – SDK with Flyover integration and Sovryn adapter
- `apps/bitcoin-savings` – Demo Next.js app (Testnet)

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for folder structure and tech stack.
