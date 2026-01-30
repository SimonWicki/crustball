import { nanoid } from 'nanoid';
import type { Connection } from '@solana/web3.js';
import type { Keypair } from '@solana/web3.js';
import type { BagsBallConfig } from '../config/schema.js';
import { discoverHoldersByTokenAccounts } from '../solana/holders.js';
import { toEligible } from './eligibility.js';
import { selectWinners } from './selection.js';
import { getTokenAccountBalanceRaw, transferSpl } from '../solana/token.js';
import { writeAudit } from './audit.js';
import type { Logger } from 'pino';

export async function runCycle(params: {
  cfg: BagsBallConfig;
  connection: Connection;
  payer: Keypair;
  logger: Logger;
  once?: boolean;
  dryRun?: boolean;
}): Promise<void> {
  const { cfg, connection, payer, logger, dryRun } = params;

  const cycleId = nanoid();
  const slot = await connection.getSlot(cfg.network.commitment);
  const latest = await connection.getLatestBlockhash(cfg.network.commitment);
  const recentBlockhash = latest.blockhash;

  const denylist = new Set(cfg.addressFilters.denylist);
  const allowlist = cfg.addressFilters.allowlist.length ? new Set(cfg.addressFilters.allowlist) : null;

  logger.info({ cycleId, slot }, 'cycle.start');

  const holders = await discoverHoldersByTokenAccounts({
    connection,
    mint: cfg.tokens.crustballMint,
    maxAccounts: cfg.holderDiscovery.tokenProgramAccounts.maxAccounts,
    denylist,
    allowlist,
  });

  const eligible = toEligible(holders, BigInt(cfg.distribution.minEligibleBalanceRaw));

  logger.info({ cycleId, holders: holders.length, eligible: eligible.length }, 'cycle.eligibility');

  const selection = selectWinners({
    cycleId,
    eligible,
    winnersCount: cfg.distribution.recipientsPerCycle,
    seedInputs: {
      cycleId: cfg.randomness.seed.includeCycleId ? cycleId : '0',
      slot: cfg.randomness.seed.includeSlot ? slot : undefined,
      recentBlockhash: cfg.randomness.seed.includeRecentBlockhash ? recentBlockhash : undefined,
      staticSalt: cfg.randomness.seed.extraStaticSalt,
    },
  });

  if (selection.winners.length === 0) {
    logger.warn({ cycleId }, 'cycle.no_winners');
    return;
  }

  const poolAccount = process.env.CRUSTBALL_POOL_TOKEN_ACCOUNT;
  if (!poolAccount) throw new Error('CRUSTBALL_POOL_TOKEN_ACCOUNT is required');

  const poolBal = await getTokenAccountBalanceRaw(connection, poolAccount);
  if (poolBal < BigInt(cfg.safety.minPoolBalanceRaw)) {
    logger.warn({ cycleId, poolBal: poolBal.toString() }, 'cycle.pool_below_min');
    return;
  }

  let amountPer = cfg.distribution.amountPerRecipientRaw
    ? BigInt(cfg.distribution.amountPerRecipientRaw)
    : 0n;

  if (amountPer === 0n) {
    const maxTotal = BigInt(cfg.distribution.maxTotalPerCycleRaw);
    const capped = poolBal < maxTotal ? poolBal : maxTotal;
    amountPer = capped / BigInt(selection.winners.length);
  }

  const total = amountPer * BigInt(selection.winners.length);

  logger.info(
    { cycleId, winners: selection.winners.length, amountPer: amountPer.toString(), total: total.toString() },
    'cycle.distribution_plan',
  );

  const signatures: string[] = [];
  if (!dryRun) {
    for (const w of selection.winners) {
      const sig = await transferSpl({
        connection,
        payer,
        sourceTokenAccount: poolAccount,
        destinationOwner: w,
        mint: cfg.tokens.crustballMint,
        amountRaw: amountPer,
      });
      signatures.push(sig);
    }
  } else {
    logger.info({ cycleId }, 'cycle.dry_run_no_transfers');
  }

  if (cfg.telemetry.enabled) {
    writeAudit(cfg.telemetry.jsonlLogPath, {
      ts: new Date().toISOString(),
      cycleId,
      slot,
      recentBlockhash,
      seedHash: selection.seedHash,
      eligibleCount: selection.eligibleCount,
      winnersCount: selection.winners.length,
      winners: selection.winners,
      amountPerRecipientRaw: amountPer.toString(),
      totalDistributedRaw: total.toString(),
      txSignatures: signatures,
      notes: dryRun ? 'dry-run' : undefined,
    });
  }

  logger.info({ cycleId, signatures: signatures.length }, 'cycle.end');
}
