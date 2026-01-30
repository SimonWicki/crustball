import { Keypair } from '@solana/web3.js';

function parseSecretKey(value: string): Uint8Array {
  // Accept JSON array or base58 secret key.
  if (value.trim().startsWith('[')) {
    const arr = JSON.parse(value) as number[];
    return Uint8Array.from(arr);
  }
  // Lazily import bs58 to avoid hard dep. Base58 secret keys are common in ops.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const bs58 = require('bs58') as { default: { decode: (s: string) => Uint8Array } };
  return bs58.default.decode(value.trim());
}

export function loadDistributorKeypair(): Keypair {
  const raw = process.env.DISTRIBUTOR_SECRET_KEY;
  if (!raw) throw new Error('DISTRIBUTOR_SECRET_KEY is required');
  const sk = parseSecretKey(raw);
  return Keypair.fromSecretKey(sk);
}
