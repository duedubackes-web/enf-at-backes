# ENF@BACKES — Agent instructions

Clinical safety: this is a non-homologated nursing management MVP. Use only fictitious data until security, LGPD and clinical review are completed.

## Repository workflow
- Work in a feature branch and use Pull Requests; never overwrite unrelated changes.
- Run `npm run typecheck`, `npm run build`, and `npm run check:deploy`.
- Supabase migrations v1–v6 were applied remotely. Do not run `supabase db push` without reconciling remote migrations v1–v3 with repository migration history.
- Never commit passwords, tokens, secret keys, `service_role`, `.env` files, backups or patient-identifiable data.
- Frontend may use only the Supabase publishable key, protected by RLS. Provision health-worker roles through trusted administration only.
- Do not make automatic diagnoses or clinical treatment recommendations.

## Vercel
Official setup: https://vercel.com/get-started.md
Use the existing team `ebb10` and existing project `enf-at-backes`, and inspect their configuration before changing it; do not create duplicates.
Keep `main` as intended production branch; use `feat/enf-backes-core-v04` for preview. Never publish production without explicit approval and verification.
In Codex CLI, inspect `codex mcp list`. If Vercel is missing, use `codex mcp add vercel --url https://mcp.vercel.com`; authenticate via `codex mcp login vercel`.
The Vercel MCP endpoint is https://mcp.vercel.com; require user consent for authentication and changes.
Do not place service keys, database passwords or PATs in a `VITE_` variable.

## Before a release
- Confirm Vercel project/team/repository/commit/target.
- Configure only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as client-side values.
- Review auth redirects, RLS between distinct fictitious units, accessibility and incident response.
- Link PR evidence to GitHub Actions checks and preview deployment; production needs clinical and legal approval.
