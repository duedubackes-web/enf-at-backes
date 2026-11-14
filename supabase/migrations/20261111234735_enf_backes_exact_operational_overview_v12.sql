-- ENF@BACKES migration 20261111234735: enf_backes_exact_operational_overview_v12
-- Verified export from the existing Supabase migration history.
-- ENF@BACKES v12: exact unit-level management indicators; never expose clinical row details.
create function private.nursing_operational_overview()
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_org uuid;
  v_unit uuid;
  v_result jsonb;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;
  select p.organization_id,p.health_unit_id
    into v_org,v_unit
    from public.profiles p
    where p.id=v_uid and p.active;
  if v_org is null or not private.allowed(v_org,v_unit,'read') then
    raise exception 'Not authorized for a health unit';
  end if;

  select jsonb_build_object(
    'patients', (select count(*) from public.patients
       where organization_id=v_org and health_unit_id=v_unit and status='active'),
    'encounters_draft', (select count(*) from public.encounters
       where organization_id=v_org and health_unit_id=v_unit and status='draft'),
    'encounters_finalized', (select count(*) from public.encounters
       where organization_id=v_org and health_unit_id=v_unit and status='finalized'),
    'tasks_open', (select count(*) from public.care_tasks
       where organization_id=v_org and health_unit_id=v_unit and status in ('pending','in_progress')),
    'tasks_overdue', (select count(*) from public.care_tasks
       where organization_id=v_org and health_unit_id=v_unit
         and status in ('pending','in_progress') and due_at < now()),
    'visits_planned', (select count(*) from public.home_visits
       where organization_id=v_org and health_unit_id=v_unit and status='planned'),
    'visits_overdue', (select count(*) from public.home_visits
       where organization_id=v_org and health_unit_id=v_unit
         and status='planned' and scheduled_at < now()),
    'programs_active', (select count(*) from public.care_programs
       where organization_id=v_org and health_unit_id=v_unit and status='active'),
    'followups_planned', (select count(*) from public.care_followups
       where organization_id=v_org and health_unit_id=v_unit and status='planned'),
    'followups_overdue', (select count(*) from public.care_followups
       where organization_id=v_org and health_unit_id=v_unit
         and status='planned' and scheduled_at < now()),
    'generated_at', now()
  ) into v_result;
  return v_result;
end;
$$;

revoke all on function private.nursing_operational_overview() from public,anon,authenticated;
grant execute on function private.nursing_operational_overview() to authenticated;

create function public.nursing_operational_overview()
returns jsonb
language sql stable security invoker
set search_path=''
as $$
  select private.nursing_operational_overview();
$$;
revoke all on function public.nursing_operational_overview() from public,anon,authenticated;
grant execute on function public.nursing_operational_overview() to authenticated;

comment on function public.nursing_operational_overview() is
'Exact counts scoped to caller active health unit. No row/patient data is returned. Authorizing SECURITY DEFINER implementation remains in private schema.';
