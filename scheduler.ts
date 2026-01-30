import type { Connection, Keypair } from '@solana/web3.js';
import type { BagsBallConfig } from '../config/schema.js';
import type { Logger } from 'pino';
import { runCycle } from './cycle.js';

export async function runScheduler(params: {
  cfg: BagsBallConfig;
  connection: Connection;
  payer: Keypair;
  logger: Logger;
  once?: boolean;
  dryRun?: boolean;
}): Promise<void> {
  const { cfg, connection, payer, logger, once, dryRun } = params;

  let running = false;

  async function tick() {
    if (running) return;
    running = true;
    try {
      await runCycle({ cfg, connection, payer, logger, dryRun });
    } catch (e) {
      logger.error({ err: e }, 'cycle.error');
      if (cfg.safety.failClosedOnHolderErrors) {
        // fail closed: exit so an orchestrator restarts with backoff.
        process.exitCode = 1;
        process.exit(1);
      }
    } finally {
      running = false;
    }
  }

  await tick();
  if (once) return;

  const intervalMs = cfg.distribution.intervalSeconds * 1000;
  setInterval(() => void tick(), intervalMs);
}
