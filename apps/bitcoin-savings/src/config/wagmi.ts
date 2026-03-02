import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { rootstockTestnet } from "./chains";

/**
 * Wagmi config for Bitcoin Savings demo – Rootstock Testnet only.
 */
export const wagmiConfig = createConfig({
  chains: [rootstockTestnet],
  connectors: [injected()],
  transports: {
    [rootstockTestnet.id]: http(),
  },
});
