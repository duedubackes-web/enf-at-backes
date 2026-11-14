# ENF@BACKES — handoff for Codex

## Where to work
- Repository: https://github.com/duedubackes-web/enf-at-backes
- Canonical source: GitHub `main` after PR #1 is merged; use new feature branches for Codex changes.
- Project name: **ENF@BACKES — Gestão Inteligente de Enfermagem**
- Language: Brazilian Portuguese
- Version: **1.0.0-beta.1** (technical beta, not clinically homologated)
- Vercel: existing team `ebb10`, project `enf-at-backes`.
- Supabase: existing project `cbofgqeqdmscmhwfcikx`, URL `https://cbofgqeqdmscmhwfcikx.supabase.co`.
- GitHub Actions: `npm ci`, `npm test`, `npm run typecheck`, `npm run build`, `npm run check:deploy`.

## Code map
- `src/main.tsx`: app routes/menu, auth and basic workflows.
- `src/Landing.tsx` / `src/landing.css`: public animated landing.
- `src/OperationalOverview.tsx`: exact management indicators via a scoped Postgres RPC.
- `src/NursingCommand.tsx`: five deterministic operational agents, private chat and confirmed task creation.
- `src/TaskOffice.tsx`: administrative checklists, due dates, filters, tasks.
- `src/CarePrograms.tsx`: prenatal, diabetes and hypertension operational follow-up.
- `src/supabase.ts`: publishable Supabase client and data types.
- `src/task-priority.ts`, `tests/`: administrative prioritization logic and tests.
- `supabase/migrations/`: all **13 canonical SQL migrations recovered from remote**; inspect before running on any database.
- `ENF@BACKES/`: runbooks, design, security, workflows, deployment checks.

## Operational integration
The Vercel team and project have already been connected to this repository. Preview builds have been verified READY in earlier sessions. Vercel environment configuration uses `VITE_SUPABASE_URL` plus a public Supabase key; do not print or commit its value. Never create duplicate Vercel/Supabase projects.

## Critical unfinished work
- **No institutional profile for Fernanda has been provisioned or verified.** The app cannot be called ready for her login.
- **No production-quality integration test suite for real Supabase Auth/RLS yet.** Add tests with fictitious users across two units, negative cross-unit checks, permissions and idempotency.
- Clinical workflow approval, LGPD/privacy program, backups, retention, and read-access auditing still require work.
- Review issues and the open PR for backlog; do not infer an issue is done from a green build.
- New AI features must not send patient data to external services or make independent clinical decisions.
- Do not use real patient data until formal institutional clearance.

## First Codex task suggestion
"Inspect the entire repository and AGENTS.md. Run npm ci, npm test, npm run typecheck, npm run build and npm run check:deploy. Then implement an automated integration-test harness for RLS with two fictional units and distinct roles; keep production Supabase unchanged, and submit a PR with reproducible tests and evidence. Do not deploy to production without reviewing GitHub/Vercel integration."

## Migration history
All 13 versions in `supabase/migrations/` were taken from the remote `supabase_migrations.schema_migrations` table and filenames now match each recorded version and name. They are **already applied** to the connected project; use migrations only for new disposable testing environments after verification.
