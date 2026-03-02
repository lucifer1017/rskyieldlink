export type YieldProtocolId = string;

export interface YieldProtocol {
  id: YieldProtocolId;
  name: string;
  apy?: number;
  contractAddress: `0x${string}`;
  chainId: number;
}
