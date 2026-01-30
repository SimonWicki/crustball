import type { EligibleHolder, HolderBalance } from './types.js';

export function toEligible(
  holders: HolderBalance[],
  minBalanceRaw: bigint,
): EligibleHolder[] {
  // Collapse multiple token accounts per owner, sum balances, then filter.
  const map = new Map<string, bigint>();
  for (const h of holders) {
    const prev = map.get(h.owner) ?? 0n;
    map.set(h.owner, prev + h.balanceRaw);
  }

  const out: EligibleHolder[] = [];
  for (const [owner, bal] of map.entries()) {
    if (bal >= minBalanceRaw) out.push({ owner, balanceRaw: bal });
  }

  // Stable order helps replayability before selection shuffles.
  out.sort((a, b) => (a.owner < b.owner ? -1 : a.owner > b.owner ? 1 : 0));
  return out;
}
