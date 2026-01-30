import { PublicKey, type Connection } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { HolderBalance } from '../core/types.js';

export async function discoverHoldersByTokenAccounts(params: {
  connection: Connection;
  mint: string;
  maxAccounts: number;
  denylist: Set<string>;
  allowlist?: Set<string> | null;
}): Promise<HolderBalance[]> {
  const { connection, mint, maxAccounts, denylist, allowlist } = params;
  const mintPk = new PublicKey(mint);

  // Use getProgramAccounts to enumerate token accounts for mint.
  // This is expensive and RPC-provider dependent. In production, many teams use a dedicated indexer.
  const accounts = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: [
      { dataSize: 165 }, // SPL token account size
      { memcmp: { offset: 0, bytes: mintPk.toBase58() } }, // mint at offset 0
    ],
  });

  const out: HolderBalance[] = [];
  for (const a of accounts.slice(0, maxAccounts)) {
    const owner = new PublicKey(a.account.data.slice(32, 64)).toBase58(); // owner at offset 32
    const amount = a.account.data.readBigUInt64LE(64); // amount at offset 64 (little endian u64)
    if (denylist.has(owner)) continue;
    if (allowlist && allowlist.size > 0 && !allowlist.has(owner)) continue;
    out.push({
      owner,
      tokenAccount: a.pubkey.toBase58(),
      balanceRaw: BigInt(amount),
    });
  }

  return out;
}
