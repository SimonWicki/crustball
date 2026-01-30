# Contributing

Thanks for contributing to BagsBall.

## Development workflow

1. Fork and clone the repo
2. Install dependencies
   - `pnpm i` (or `npm i`)
3. Copy `.env.example` to `.env` and configure
4. Run the checks
   - `pnpm test`
   - `pnpm lint`
   - `pnpm typecheck`

## Pull requests

- Keep changes focused and small
- Add tests for new behavior
- Avoid refactors mixed with feature changes
- Update docs in `docs/` when architecture changes

## Security

If you believe you have found a vulnerability, do not open a public issue.
Email the address in `SECURITY.md`.
