import { describe, expect, test } from 'vitest';
import { selectWinners } from '../src/core/selection.js';

describe('selectWinners', () => {
  test('is deterministic for same seed', () => {
    const eligible = Array.from({ length: 100 }, (_, i) => ({ owner: `W${i}`, balanceRaw: 100n }));
    const a = selectWinners({
      cycleId: 'c1',
      eligible,
      winnersCount: 10,
      seedInputs: { cycleId: 'c1', slot: 123, recentBlockhash: 'abc', staticSalt: 'crustball:v0' },
    });
    const b = selectWinners({
      cycleId: 'c1',
      eligible,
      winnersCount: 10,
      seedInputs: { cycleId: 'c1', slot: 123, recentBlockhash: 'abc', staticSalt: 'crustball:v0' },
    });
    expect(a.winners).toEqual(b.winners);
    expect(a.seedHash).toEqual(b.seedHash);
  });

  test('returns unique winners', () => {
    const eligible = Array.from({ length: 20 }, (_, i) => ({ owner: `W${i}`, balanceRaw: 100n }));
    const r = selectWinners({
      cycleId: 'c2',
      eligible,
      winnersCount: 15,
      seedInputs: { cycleId: 'c2', slot: 1, recentBlockhash: 'xyz', staticSalt: 'crustball:v0' },
    });
    const set = new Set(r.winners);
    expect(set.size).toBe(r.winners.length);
  });
});
