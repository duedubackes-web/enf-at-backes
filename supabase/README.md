# Supabase — migration baseline synchronized for Codex

Project ref: `cbofgqeqdmscmhwfcikx`. **This is an existing remote project with 13 applied migrations**.

The migration files in `supabase/migrations` have been exported from the remote schema migration history with canonical names in the format `<version>_<name>.sql`. Each file maps one-to-one with the remote version/name, including foundation v1–v3.

Do **not** automatically run `supabase db push` or `supabase migration repair` on the connected environment. First confirm the correct Supabase project, compare `supabase migration list`, review all SQL, have a backup, and test fresh-environment migrations and RLS separately.

This migration baseline reflects DDL history, **not** patient records or secrets; no data export is included. Do not inject real health records into staging.
