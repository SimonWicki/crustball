import { describe, expect, test } from 'vitest';
import { toEligible } from '../src/core/eligibility.js';

describe('toEligible', () => {
  test('collapses multiple token accounts and applies threshold', () => {
    const holders = [
      { owner: 'A', tokenAccount: 't1', balanceRaw: 50n },
      { owner: 'A', tokenAccount: 't2', balanceRaw: 60n },
      { owner: 'B', tokenAccount: 't3', balanceRaw: 99n },
    ];
    const eligible = toEligible(holders as any, 100n);
    expect(eligible.map((e) => e.owner)).toEqual(['A']);
    expect(eligible[0].balanceRaw).toBe(110n);
  });
});
