-- ENF@BACKES: institutional technical calculation requests.
-- No patient-specific measurements or identifiable data should be stored.
create table public.technical_calculation_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  health_unit_id uuid not null,
  requester_id uuid not null references auth.users(id),
  category text not null check (category in ('staffing','workload','capacity','quality','other')),
  title text not null check (length(trim(title)) between 5 and 120),
  description text not null check (length(trim(description)) between 10 and 1000),
  status text not null default 'submitted' check(status in ('submitted','under_review','answered','closed')),
  created_at timestamptz not null default now(),
  unique(organization_id,health_unit_id,id),
  foreign key(organization_id,health_unit_id)
    references public.health_units(organization_id,id)
);
create index technical_requests_owner_idx
  on public.technical_calculation_requests(requester_id,created_at desc);
create index technical_requests_unit_idx
  on public.technical_calculation_requests(organization_id,health_unit_id,status,created_at desc);
alter table public.technical_calculation_requests enable row level security;
revoke all on public.technical_calculation_requests from anon,authenticated;
grant select,insert on public.technical_calculation_requests to authenticated;
create policy technical_requests_read_own on public.technical_calculation_requests
 for select to authenticated
 using(requester_id=(select auth.uid()) and private.allowed(organization_id,health_unit_id,'read'));
create policy technical_requests_insert_own on public.technical_calculation_requests
 for insert to authenticated
 with check(requester_id=(select auth.uid())
 and status='submitted'
 and private.allowed(organization_id,health_unit_id,'read'));
create trigger audit_technical_requests
 after insert or update or delete on public.technical_calculation_requests
 for each row execute function private.audit();
comment on table public.technical_calculation_requests is
 'Administrative technical requests only. No personal health information permitted; status updated by trusted backend following manual review.';
