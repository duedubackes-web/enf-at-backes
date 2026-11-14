-- ENF@BACKES migration 20261111215501: enf_backes_least_privilege_v3
-- Verified export from the existing Supabase migration history.
-- Final least-privilege verification and composite FK performance.
revoke insert, update, delete, truncate, references, trigger on public.profiles from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on public.organizations from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on public.health_units from anon, authenticated;
revoke delete, truncate, references, trigger on public.patients,public.encounters,public.care_tasks,public.home_visits from anon,authenticated;
create index tasks_scoped_assignee_idx on public.care_tasks(organization_id,health_unit_id,assigned_to);
create index visits_scoped_assignee_idx on public.home_visits(organization_id,health_unit_id,assigned_to);
comment on table public.profiles is 'Atribuicao exclusiva via procedimento administrativo confiavel; nunca por autoatribuição de usuario.';
comment on table private.audit_events is 'Tabela privada propositalmente sem policies de leitura: default deny. Auditoria por consulta exige backend de leitura autenticada.';
