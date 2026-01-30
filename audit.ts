import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export interface CycleAuditLog {
  ts: string;
  cycleId: string;
  slot?: number;
  recentBlockhash?: string;
  seedHash: string;
  eligibleCount: number;
  winnersCount: number;
  winners: string[];
  amountPerRecipientRaw: string;
  totalDistributedRaw: string;
  txSignatures: string[];
  notes?: string;
}

export function writeAudit(path: string, entry: CycleAuditLog) {
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(path, JSON.stringify(entry) + '\n', 'utf-8');
}
