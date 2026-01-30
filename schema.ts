import { z } from 'zod';

export const ConfigSchema = z.object({
  network: z.object({
    commitment: z.enum(['processed', 'confirmed', 'finalized']).default('confirmed'),
    rpcTimeoutMs: z.number().int().positive().default(15000),
  }),
  tokens: z.object({
    crustballMint: z.string().min(20),
    bagsMint: z.string().min(20),
  }),
  distribution: z.object({
    intervalSeconds: z.number().int().positive().default(600),
    minEligibleBalanceRaw: z.number().int().nonnegative(),
    recipientsPerCycle: z.number().int().positive().max(500),
    amountPerRecipientRaw: z.number().int().nonnegative().nullable(),
    maxTotalPerCycleRaw: z.number().int().nonnegative(),
  }),
  randomness: z.object({
    seed: z.object({
      includeRecentBlockhash: z.boolean().default(true),
      includeSlot: z.boolean().default(true),
      includeCycleId: z.boolean().default(true),
      extraStaticSalt: z.string().default('crustball:v0'),
    }),
  }),
  holderDiscovery: z.object({
    strategy: z.enum(['tokenProgramAccounts', 'snapshotFile']).default('tokenProgramAccounts'),
    tokenProgramAccounts: z.object({
      batchSize: z.number().int().positive().default(250),
      concurrency: z.number().int().positive().max(32).default(6),
      maxAccounts: z.number().int().positive().default(200000),
      applyAddressFilters: z.boolean().default(true),
    }),
  }),
  addressFilters: z.object({
    denylist: z.array(z.string()).default([]),
    allowlist: z.array(z.string()).default([]),
  }),
  telemetry: z.object({
    enabled: z.boolean().default(true),
    jsonlLogPath: z.string().default('./tmp/cycles.jsonl'),
  }),
  safety: z.object({
    failClosedOnHolderErrors: z.boolean().default(true),
    minPoolBalanceRaw: z.number().int().nonnegative().default(0),
  }),
});

export type BagsBallConfig = z.infer<typeof ConfigSchema>;
