export type PubkeyString = string;

export interface HolderBalance {
  owner: PubkeyString;
  tokenAccount: PubkeyString;
  balanceRaw: bigint;
}

export interface EligibleHolder {
  owner: PubkeyString;
  balanceRaw: bigint;
}

export interface CycleSeedInputs {
  cycleId: string;
  slot?: number;
  recentBlockhash?: string;
  staticSalt: string;
}

export interface SelectionResult {
  cycleId: string;
  eligibleCount: number;
  winners: PubkeyString[];
  seedHash: string;
}
