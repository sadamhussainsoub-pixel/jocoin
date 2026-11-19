/**
 * JOC token distribution — integration architecture (not active).
 *
 * The platform runs in "simulated" mode: balances live only in the internal ledger.
 * When a JOC smart contract is audited and compliance is complete, a real adapter
 * implementing `TokenDistributionAdapter` will run server-side only (never in the
 * browser), settle *approved* withdrawal_requests, and write tx_hash / chain_id back.
 * No token is deployed and no private keys exist in this codebase.
 */

export type DistributionMode = "simulated" | "testnet" | "mainnet";
export type SupportedNetwork = "bsc" | "ethereum" | "polygon";

export interface NetworkConfig {
  id: SupportedNetwork;
  label: string;
  chainId: number;
  /** Filled in only after the audited contract is deployed. */
  tokenContract: `0x${string}` | null;
  explorerTx: (hash: string) => string;
}

export const NETWORKS: Record<SupportedNetwork, NetworkConfig> = {
  bsc: {
    id: "bsc",
    label: "BNB Smart Chain",
    chainId: 56,
    tokenContract: null,
    explorerTx: (h) => `https://bscscan.com/tx/${h}`,
  },
  ethereum: {
    id: "ethereum",
    label: "Ethereum",
    chainId: 1,
    tokenContract: null,
    explorerTx: (h) => `https://etherscan.io/tx/${h}`,
  },
  polygon: {
    id: "polygon",
    label: "Polygon",
    chainId: 137,
    tokenContract: null,
    explorerTx: (h) => `https://polygonscan.com/tx/${h}`,
  },
};

export interface DistributionRequest {
  withdrawalId: string;
  network: SupportedNetwork;
  to: `0x${string}`;
  /** Decimal string, 8 dp, to avoid float rounding. */
  amount: string;
}

export interface DistributionResult {
  withdrawalId: string;
  status: "queued" | "submitted" | "confirmed" | "failed";
  txHash?: string;
  chainId?: number;
}

/** Contract every future distribution backend (testnet/mainnet) must implement. */
export interface TokenDistributionAdapter {
  readonly mode: DistributionMode;
  distribute(req: DistributionRequest): Promise<DistributionResult>;
}

/** Current adapter: records intent only. Never moves funds. */
export const simulatedAdapter: TokenDistributionAdapter = {
  mode: "simulated",
  async distribute(req) {
    return { withdrawalId: req.withdrawalId, status: "queued" };
  },
};

export const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
export const isEvmAddress = (s: string): s is `0x${string}` => EVM_ADDRESS_RE.test(s);
