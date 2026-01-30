import type { EligibleHolder, SelectionResult } from './types.js';
import { Xoshiro256, hashSeed } from './rng.js';

export function selectWinners(params: {
  cycleId: string;
  eligible: EligibleHolder[];
  winnersCount: number;
  seedInputs: { cycleId: string; slot?: number; recentBlockhash?: string; staticSalt: string };
}): SelectionResult {
  const { cycleId, eligible, winnersCount, seedInputs } = params;
  if (winnersCount <= 0) throw new Error('winnersCount must be > 0');
  if (eligible.length === 0) {
    return { cycleId, eligibleCount: 0, winners: [], seedHash: hashSeed(seedInputs) };
  }

  const seedHash = hashSeed(seedInputs);
  const rng = new Xoshiro256(seedHash);

  // Floyd's algorithm for sampling k unique indices from [0..n)
  const n = eligible.length;
  const k = Math.min(winnersCount, n);
  const selected = new Map<number, number>();

  for (let j = n - k; j < n; j++) {
    const t = rng.nextInt(j + 1);
    const x = selected.get(t) ?? t;
    const y = selected.get(j) ?? j;
    selected.set(t, y);
    selected.set(j, x);
  }

  const indices = [];
  for (let j = n - k; j < n; j++) indices.push(selected.get(j) ?? j);
  indices.sort((a, b) => a - b);

  const winners = indices.map((i) => eligible[i]!.owner);
  return { cycleId, eligibleCount: eligible.length, winners, seedHash };
}
