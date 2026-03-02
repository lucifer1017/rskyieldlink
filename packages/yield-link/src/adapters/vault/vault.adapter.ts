import { encodeFunctionData } from "viem";
import type { DepositExecutor, DepositTxParams, IYieldAdapter } from "../types";
import type { YieldProtocol } from "../../types";
import { ERC4626_ABI } from "./abi";

/**
 * Generic ERC-4626 Tokenized Vault adapter for Yield-Link.
 *
 * Encodes the standard `deposit(uint256 assets, address receiver)` call for any
 * ERC-4626 compliant vault that accepts native rBTC deposits (payable).
 *
 * Usage:
 *   const adapter = new VaultAdapter("my-vault");
 *   registerAdapter(adapter);
 */
export class VaultAdapter implements IYieldAdapter {
  readonly protocolId: string;

  constructor(protocolId: string) {
    this.protocolId = protocolId;
  }

  async getDepositParams(
    amount: bigint,
    receiver: `0x${string}`,
    protocol: YieldProtocol
  ): Promise<DepositTxParams> {
    const data = encodeFunctionData({
      abi: ERC4626_ABI,
      functionName: "deposit",
      args: [amount, receiver],
    });

    return {
      to: protocol.contractAddress,
      data,
      value: amount,
    };
  }

  async deposit(
    amount: bigint,
    receiver: `0x${string}`,
    protocol: YieldProtocol,
    executor?: DepositExecutor
  ): Promise<`0x${string}`> {
    if (!executor) {
      throw new Error(
        `VaultAdapter(${this.protocolId}).deposit requires an executor. ` +
          "Use getDepositParams() and a wagmi walletClient to send the transaction."
      );
    }
    const params = await this.getDepositParams(amount, receiver, protocol);
    return executor(params);
  }
}
