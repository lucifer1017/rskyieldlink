import type { YieldProtocol } from "../types";

/** Parameters for a yield deposit transaction */
export interface DepositTxParams {
  to: `0x${string}`;
  data: `0x${string}`;
  value: bigint;
}

/** Executes a deposit transaction and returns the tx hash */
export type DepositExecutor = (params: DepositTxParams) => Promise<`0x${string}`>;

export interface IYieldAdapter {
  readonly protocolId: string;
  /**
   * Encodes deposit transaction. Use with getDepositParams + executor for execution.
   */
  getDepositParams(
    amount: bigint,
    receiver: `0x${string}`,
    protocol: YieldProtocol
  ): Promise<DepositTxParams>;
  /**
   * Executes deposit if executor is provided. Otherwise throws.
   */
  deposit(
    amount: bigint,
    receiver: `0x${string}`,
    protocol: YieldProtocol,
    executor?: DepositExecutor
  ): Promise<`0x${string}`>;
}
