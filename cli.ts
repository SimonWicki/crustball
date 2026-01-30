import { Command } from 'commander';
import { loadConfig } from './config/load.js';
import { createLogger } from './util/logger.js';
import { createConnection } from './solana/connection.js';
import { loadDistributorKeypair } from './solana/keypair.js';
import { runScheduler } from './core/scheduler.js';
import { VERSION } from './version.js';

const program = new Command();

program
  .name('crustball')
  .description('BagsBall stateless distribution worker')
  .version(VERSION);

program
  .command('run')
  .description('Run the distribution scheduler')
  .option('--once', 'run a single cycle then exit', false)
  .option('--dry-run', 'compute winners but do not send transfers', false)
  .option('--config <path>', 'path to YAML config', process.env.CONFIG_PATH || './config/crustball.yaml')
  .action(async (opts) => {
    const logger = createLogger();
    const cfg = loadConfig(opts.config);
    const connection = createConnection(cfg);
    const payer = loadDistributorKeypair();

    logger.info({ version: VERSION }, 'crustball.start');
    await runScheduler({ cfg, connection, payer, logger, once: !!opts.once, dryRun: !!opts.dryRun });
  });

program
  .command('verify')
  .description('Verify a selection by replaying PRNG against logged seed and eligible set')
  .option('--eligible-json <path>', 'path to eligible set JSON file', './tmp/eligible.json')
  .option('--cycle-id <id>', 'cycle id')
  .option('--slot <slot>', 'slot number')
  .option('--blockhash <hash>', 'recent blockhash')
  .option('--salt <salt>', 'static salt', 'crustball:v0')
  .option('--winners <n>', 'winners count', '50')
  .action(async (opts) => {
    const { readFileSync } = await import('node:fs');
    const eligible = JSON.parse(readFileSync(opts.eligibleJson, 'utf-8')) as { owner: string; balanceRaw: string }[];
    const { toEligible } = await import('./core/eligibility.js');
    const { selectWinners } = await import('./core/selection.js');

    const normalized = toEligible(
      eligible.map((e) => ({ owner: e.owner, tokenAccount: e.owner, balanceRaw: BigInt(e.balanceRaw) })),
      0n,
    );

    const result = selectWinners({
      cycleId: opts.cycleId,
      eligible: normalized,
      winnersCount: Number(opts.winners),
      seedInputs: {
        cycleId: opts.cycleId,
        slot: opts.slot ? Number(opts.slot) : undefined,
        recentBlockhash: opts.blockhash || undefined,
        staticSalt: opts.salt,
      },
    });

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  });

program.parseAsync(process.argv).catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
