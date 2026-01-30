import { Connection } from '@solana/web3.js';
import type { BagsBallConfig } from '../config/schema.js';

export function createConnection(cfg: BagsBallConfig) {
  const url = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
  const commitment = cfg.network.commitment;
  const connection = new Connection(url, { commitment, confirmTransactionInitialTimeout: cfg.network.rpcTimeoutMs });
  return connection;
}
