# Vercel integration for ENF@BACKES

Source: https://vercel.com/get-started.md

## Target
- GitHub: `duedubackes-web/enf-at-backes`
- Existing intended Vercel team slug: `ebb10`
- Intended project: `enf-at-backes`
- Git main: production only after review
- Preview branch: `feat/enf-backes-core-v04`
- Framework: Vite, root directory `/`, build command `npm run build`, output `dist`
- Supabase URL: `https://cbofgqeqdmscmhwfcikx.supabase.co`

## Actual verification
At the time of this commit the Vercel MCP returned HTTP 403 for team `ebb10` and requires user authorization. No project creation, env setting, deploy or production release is asserted.

## Once the account authorizes access
1. Read teams and project `enf-at-backes` in team `ebb10` and inspect its existing Git repository link.
2. If the project is already linked, reuse it; do not create another project.
3. Confirm `vercel.json`, Vite build, output folder and preview configuration.
4. Configure environment variables in Vercel Dashboard or via an authorized API call:
   - `VITE_SUPABASE_URL` — `https://cbofgqeqdmscmhwfcikx.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` — active public key retrieved securely by authorized account.
5. **Never** store a PostgreSQL password, secret/service key or other confidential token in a browser-bundled `VITE_` variable.
6. Configure allowed redirect URLs in Supabase Auth for approved preview and production domains.
7. Inspect preview deployment for the feature branch; test SPA routes, responsive pages and sign-in with fictitious accounts.
8. Ensure GitHub CI succeeds, verify RLS for multiple fictional units and complete technical/clinical review before merging to `main`.

## For a local Codex CLI setup
Check `codex mcp list`; add with `codex mcp add vercel --url https://mcp.vercel.com` if missing; log in using `codex mcp login vercel` if authorization is needed.
Do not overwrite existing MCP configuration; merge the new entry and preserve other tools.

## Reliability
The CI pipeline verifies types, build and Vercel configuration via `npm run check:deploy`. These checks do not prove real deployment or production readiness.
