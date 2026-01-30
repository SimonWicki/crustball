import { writeFileSync } from 'node:fs';
import { loadConfig } from '../config/load.js';
import { createConnection } from '../solana/connection.js';
import { discoverHoldersByTokenAccounts } from '../solana/holders.js';
import { toEligible } from '../core/eligibility.js';
import { createLogger } from '../util/logger.js';

async function main() {
  const logger = createLogger();
  const cfg = loadConfig(process.env.CONFIG_PATH || './config/crustball.yaml');
  const connection = createConnection(cfg);

  const holders = await discoverHoldersByTokenAccounts({
    connection,
    mint: cfg.tokens.crustballMint,
    maxAccounts: cfg.holderDiscovery.tokenProgramAccounts.maxAccounts,
    denylist: new Set(cfg.addressFilters.denylist),
    allowlist: cfg.addressFilters.allowlist.length ? new Set(cfg.addressFilters.allowlist) : null,
  });

  const eligible = toEligible(holders, BigInt(cfg.distribution.minEligibleBalanceRaw));
  writeFileSync('./tmp/eligible.json', JSON.stringify(eligible.map(e => ({ owner: e.owner, balanceRaw: e.balanceRaw.toString() })), null, 2));
  logger.info({ eligible: eligible.length }, 'exported eligible set to ./tmp/eligible.json');
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
