# Operations

## Running locally

- Install dependencies: `npm i`
- Create `.env` from `.env.example`
- Edit `config/crustball.yaml`
- Run a dry cycle:
  - `npm run dev -- run --once --dry-run`

## Monitoring

- Emit structured logs to stdout (pino)
- Optional JSONL cycle audit log to `tmp/cycles.jsonl`
- Suggested alerts:
  - holder discovery duration > interval
  - pool balance below threshold for > N cycles
  - repeated RPC timeouts
  - transaction failure rate > 0

## Key management

The distributor key should be treated as a hot key:
- minimal funding
- rotate regularly
- restrict on-chain permissions
- avoid reusing for unrelated activity
