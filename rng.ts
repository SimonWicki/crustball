import { createHash } from 'node:crypto';
import type { CycleSeedInputs } from './types.js';

export function hashSeed(inputs: CycleSeedInputs): string {
  const h = createHash('sha256');
  h.update(inputs.staticSalt);
  h.update('|');
  h.update(inputs.cycleId);
  h.update('|');
  if (inputs.slot !== undefined) h.update(String(inputs.slot));
  h.update('|');
  if (inputs.recentBlockhash) h.update(inputs.recentBlockhash);
  return h.digest('hex');
}

// xoshiro256** implementation for reproducible PRNG
// Not cryptographic. Used only after seed material is committed to logs.
export class Xoshiro256 {
  private s: bigint[];

  constructor(seedHex: string) {
    // Expand 32 bytes into 4x 64-bit state
    const bytes = Buffer.from(seedHex, 'hex');
    if (bytes.length < 32) throw new Error('seed must be >= 32 bytes');
    this.s = [
      bytes.readBigUInt64BE(0),
      bytes.readBigUInt64BE(8),
      bytes.readBigUInt64BE(16),
      bytes.readBigUInt64BE(24),
    ];
    if (this.s.every((x) => x === 0n)) this.s[0] = 1n;
  }

  private rotl(x: bigint, k: bigint) {
    return ((x << k) | (x >> (64n - k))) & ((1n << 64n) - 1n);
  }

  nextU64(): bigint {
    const s0 = this.s[0], s1 = this.s[1], s2 = this.s[2], s3 = this.s[3];
    const result = this.rotl(s1 * 5n, 7n) * 9n;

    const t = (s1 << 17n) & ((1n << 64n) - 1n);

    this.s[2] = (s2 ^ s0) & ((1n << 64n) - 1n);
    this.s[3] = (s3 ^ s1) & ((1n << 64n) - 1n);
    this.s[1] = (s1 ^ this.s[2]) & ((1n << 64n) - 1n);
    this.s[0] = (s0 ^ this.s[3]) & ((1n << 64n) - 1n);

    this.s[2] = (this.s[2] ^ t) & ((1n << 64n) - 1n);
    this.s[3] = this.rotl(this.s[3], 45n);

    return result & ((1n << 64n) - 1n);
  }

  nextFloat(): number {
    // Map to [0,1)
    const v = this.nextU64() >> 11n; // 53 bits
    return Number(v) / Number(1n << 53n);
  }

  nextInt(maxExclusive: number): number {
    if (maxExclusive <= 0) throw new Error('maxExclusive must be > 0');
    // Rejection sampling to reduce modulo bias.
    const max = BigInt(maxExclusive);
    const limit = ((1n << 64n) / max) * max;
    while (true) {
      const x = this.nextU64();
      if (x < limit) return Number(x % max);
    }
  }
}
