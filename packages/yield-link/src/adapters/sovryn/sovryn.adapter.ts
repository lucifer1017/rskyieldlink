import { encodeFunctionData } from "viem";
import type { DepositExecutor, DepositTxParams, IYieldAdapter } from "../types";
import type { YieldProtocol } from "../../types";
import { SOVRYN_LOAN_TOKEN_ABI } from "./abi";
import { SOVRYN_CONTRACTS } from "./config";

export type SovrynDepositMethod = "deposit" | "mint";

/**
 * Sovryn protocol adapter for Yield-Link.
 *
 * Deposits rBTC into Sovryn's lending protocol (iRBTC LoanToken).
 * Supports ERC-4626 deposit() and Sovryn's mint() interface.
 */
export class SovrynAdapter implements IYieldAdapter {
  readonly protocolId = "sovryn";

  constructor(
    private readonly depositMethod: SovrynDepositMethod = "deposit"
  ) {}

  async getDepositParams(
    amount: bigint,
    receiver: `0x${string}`,
    protocol: YieldProtocol
  ): Promise<DepositTxParams> {
    const contractAddress =
      SOVRYN_CONTRACTS[protocol.chainId as keyof typeof SOVRYN_CONTRACTS] ??
      protocol.contractAddress;

    const data =
      this.depositMethod === "deposit"
        ? encodeFunctionData({
            abi: SOVRYN_LOAN_TOKEN_ABI,
            functionName: "deposit",
            args: [amount, receiver],
          })
        : encodeFunctionData({
            abi: SOVRYN_LOAN_TOKEN_ABI,
            functionName: "mint",
            args: [receiver, amount],
          });

    return {
      to: contractAddress as `0x${string}`,
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
    const params = await this.getDepositParams(amount, receiver, protocol);
    if (!executor) {
      throw new Error(
        "SovrynAdapter.deposit requires an executor. Use getDepositParams and wagmi writeContract."
      );
    }
    return executor(params);
  }
}

/**
 * Default Sovryn adapter instance.
 * Uses "mint" because Sovryn's iRBTC LoanToken exposes:
 *   mint(address _receiver, uint256 _depositAmount) payable
 * NOT the ERC-4626 deposit() interface.
 */
export const sovrynAdapter = new SovrynAdapter("mint");
