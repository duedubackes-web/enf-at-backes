# ENF@BACKES — instructions for Codex and other coding agents

## Product and status
ENF@BACKES is a Portuguese (Brazil) nursing operations platform. Stack: React + TypeScript + Vite, Supabase Auth/PostgreSQL/RLS, Vercel. The repository contains a **technical beta** and must not process real identifiable patient data until institutional clinical, security, and LGPD approval.

## Work on the same repository
- GitHub: https://github.com/duedubackes-web/enf-at-backes
- Default branch: `main` (consolidated working code); create a new feature branch for every task and open a PR. Do not overwrite others' work.
- Vercel existing team/project: `ebb10/enf-at-backes`. Keep preview deployments for feature branches. Inspect before changing production configuration.
- Supabase existing project: `cbofgqeqdmscmhwfcikx`. This is a connected remote database, not a sandbox.
- Read `CODEX_HANDOFF.md` and `supabase/README.md` first.

## Commands (Node.js 22)
```bash
npm ci
npm test
npm run typecheck
npm run build
npm run check:deploy
```

## Security and compliance non-negotiables
- Only fictitious data for development/tests. No patient names, CPF, medical records, tokens, service_role keys, or database passwords in commits, chat prompts, logs, or frontend configuration.
- The frontend may use **only** `VITE_SUPABASE_URL` and the Supabase **publishable** key; never expose privileged keys as VITE_*.
- Never self-provision professional roles or weaken RLS. Profile assignment is a trusted administrative process. Do not create accounts for named people without verified authorized information.
- Do not autonomously diagnose, prescribe, triage, or classify clinical risks. AI features must be operational and respect explicit user confirmations.
- Preserve immutable finalized records and audit history. Do not delete/rewrite clinical data.
- Run negative RLS tests across two fictional units and different roles before enabling use with real records.
- The 13 SQL migrations have been exported from the existing Supabase project using their **canonical versioned filenames**. They are already applied remotely. Check `supabase migration list` and connected project before any schema push; never replay them on the same database. For new databases, test sequential migration apply on disposable infrastructure first.
- Vercel production may deploy automatically when merging to `main`; review the deployment target and Vercel controls. Production deployment is not clinical authorization.

## Current modules
Public landing, auth, unit-level management dashboard, patients, nursing encounters and immutable addenda backend, tasks, home visits, prenatal/diabetes/hypertension follow-up, nursing operational agents/chat, shift handover, supervised administrative checklists, and basic prioritization tests.

## Vercel / Codex MCP
Official: https://vercel.com/get-started.md
If using Codex CLI: check `codex mcp list`; add Vercel only if missing with `codex mcp add vercel --url https://mcp.vercel.com`, then `codex mcp login vercel` if required. Never commit tokens.

## Next engineering priorities
1. Provision only fictitious institutional test accounts; verify RLS by tenant and role.
2. End-to-end tests for login, task completion, agent chat, handover and idempotent checklists.
3. Accessibility and mobile UX (WCAG 2.2 AA), authentication redirects and error states.
4. Privacy retention/deletion for chat, audit of reads, backups and restore drills.
5. Clinical governance with responsible nursing leadership; no real patient data before approval.
