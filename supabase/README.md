# Supabase ENF@BACKES
Projeto remoto: `cbofgqeqdmscmhwfcikx`.
Migrações já aplicadas remotamente (ainda não exportadas como arquivos SQL versionados):
- `20261111215048_enf_backes_foundation_v1`
- `20261111215141_enf_backes_hardening_v2`
- `20261111215501_enf_backes_least_privilege_v3`

Tabelas: organizations, health_units, profiles, patients, encounters, care_tasks, home_visits.
Auditoria privada: private.audit_events.

**Atenção:** não reexecute scripts de criação no projeto existente.
Sincronizar o histórico remoto com migrações locais verificadas antes de usar `supabase db push`.
O primeiro usuário profissional deve ser provisionado por administrador confiável, sem inscrição aberta nem privilégios concedidos no frontend.
