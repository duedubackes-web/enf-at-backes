-- ENF@BACKES migration 20261111215048: enf_backes_foundation_v1
-- Verified export from the existing Supabase migration history.
create schema if not exists private;

create table public.organizations (
 id uuid primary key default gen_random_uuid(),
 name text not null check (length(trim(name)) between 2 and 180),
 created_at timestamptz not null default now()
);
create table public.health_units (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id),
 name text not null check (length(trim(name)) between 2 and 180),
 code text not null,
 active boolean not null default true,
 created_at timestamptz not null default now(),
 unique(organization_id,id),unique(organization_id,code)
);
create table public.profiles (
 id uuid primary key references auth.users(id),
 organization_id uuid not null,
 health_unit_id uuid not null,
 full_name text not null check (length(trim(full_name)) >= 2),
 role text not null check (role in ('administrator','coordinator','nurse','technician','viewer')),
 active boolean not null default true,
 created_at timestamptz not null default now(),
 foreign key(organization_id,health_unit_id) references public.health_units(organization_id,id)
);
create table public.patients (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null,
 health_unit_id uuid not null,
 local_code text not null check (length(trim(local_code)) >= 2),
 full_name text not null check (length(trim(full_name)) >= 2),
 birth_date date,
 status text not null default 'active' check(status in ('active','inactive')),
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 foreign key(organization_id,health_unit_id) references public.health_units(organization_id,id),
 unique(organization_id,health_unit_id,id),
 unique(organization_id,health_unit_id,local_code)
);
create table public.encounters (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null,
 health_unit_id uuid not null,
 patient_id uuid not null,
 author_id uuid not null references auth.users(id),
 encounter_type text not null default 'nursing' check(encounter_type in ('nursing','follow_up','home_visit')),
 notes text not null default '',
 status text not null default 'draft' check(status in ('draft','finalized')),
 occurred_at timestamptz not null default now(),
 finalized_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 foreign key(organization_id,health_unit_id,patient_id) references public.patients(organization_id,health_unit_id,id),
 check ((status='draft' and finalized_at is null) or (status='finalized' and finalized_at is not null))
);
create table public.care_tasks (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null,
 health_unit_id uuid not null,
 patient_id uuid,
 title text not null check(length(trim(title))>=3),
 status text not null default 'pending' check(status in ('pending','in_progress','completed','cancelled')),
 due_at timestamptz,
 assigned_to uuid references public.profiles(id),
 created_by uuid not null references auth.users(id),
 completed_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 foreign key(organization_id,health_unit_id) references public.health_units(organization_id,id),
 foreign key(organization_id,health_unit_id,patient_id) references public.patients(organization_id,health_unit_id,id),
 check ((status='completed' and completed_at is not null) or (status<>'completed' and completed_at is null))
);
create table public.home_visits (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null,
 health_unit_id uuid not null,
 patient_id uuid not null,
 scheduled_at timestamptz not null,
 assigned_to uuid references public.profiles(id),
 created_by uuid not null references auth.users(id),
 status text not null default 'planned' check(status in ('planned','completed','cancelled')),
 notes text not null default '',
 completed_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 foreign key(organization_id,health_unit_id,patient_id) references public.patients(organization_id,health_unit_id,id)
);
create table private.audit_events(
 id bigint generated always as identity primary key,
 entity text not null,
 record_id uuid not null,
 operation text not null,
 actor_id uuid,
 happened_at timestamptz not null default now()
);
create index patients_scope_idx on public.patients(organization_id,health_unit_id,status);
create index tasks_scope_idx on public.care_tasks(organization_id,health_unit_id,status,due_at);
create index visits_scope_idx on public.home_visits(organization_id,health_unit_id,scheduled_at);
create index encounters_patient_idx on public.encounters(organization_id,health_unit_id,patient_id,occurred_at desc);

create function private.allowed(o uuid,u uuid,action text)
returns boolean language sql stable security definer set search_path=''
as $$
 select exists(
 select 1 from public.profiles p
 join public.health_units h on h.id=p.health_unit_id and h.organization_id=p.organization_id
 where p.id=(select auth.uid()) and p.organization_id=o and p.health_unit_id=u
 and p.active and h.active
 and (action='read' or (action='clinical' and p.role in ('coordinator','nurse'))
      or (action='task' and p.role in ('coordinator','nurse','technician')))
 )
$$;
create function private.guard_scope() returns trigger
language plpgsql set search_path='' as $$
begin
 if new.id is distinct from old.id or new.organization_id is distinct from old.organization_id
 or new.health_unit_id is distinct from old.health_unit_id then
 raise exception 'Escopo e identidade imutaveis';
 end if;
 return new;
end; $$;
create function private.guard_finalization() returns trigger
language plpgsql set search_path='' as $$
begin
 if tg_op='UPDATE' and old.status='finalized' then
 raise exception 'Atendimento finalizado e imutavel; registre novo atendimento/adendo';
 end if;
 if new.status='finalized' and new.finalized_at is null then
 new.finalized_at=now();
 end if;
 return new;
end; $$;
create function private.stamp() returns trigger language plpgsql set search_path=''
as $$begin new.updated_at=now(); return new; end;$$;
create function private.audit() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 insert into private.audit_events(entity,record_id,operation,actor_id)
 values (tg_table_name,case when tg_op='DELETE' then old.id else new.id end,tg_op,auth.uid());
 return case when tg_op='DELETE' then old else new end;
end; $$;

create trigger guard_patient before update on public.patients for each row execute function private.guard_scope();
create trigger guard_encounter before update on public.encounters for each row execute function private.guard_scope();
create trigger guard_task before update on public.care_tasks for each row execute function private.guard_scope();
create trigger guard_visit before update on public.home_visits for each row execute function private.guard_scope();
create trigger finalize_encounter before insert or update on public.encounters for each row execute function private.guard_finalization();
create trigger stamp_patient before update on public.patients for each row execute function private.stamp();
create trigger stamp_encounter before update on public.encounters for each row execute function private.stamp();
create trigger stamp_task before update on public.care_tasks for each row execute function private.stamp();
create trigger stamp_visit before update on public.home_visits for each row execute function private.stamp();
create trigger audit_patient after insert or update or delete on public.patients for each row execute function private.audit();
create trigger audit_encounter after insert or update or delete on public.encounters for each row execute function private.audit();
create trigger audit_task after insert or update or delete on public.care_tasks for each row execute function private.audit();
create trigger audit_visit after insert or update or delete on public.home_visits for each row execute function private.audit();

alter table public.organizations enable row level security;
alter table public.health_units enable row level security;
alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.encounters enable row level security;
alter table public.care_tasks enable row level security;
alter table public.home_visits enable row level security;
alter table private.audit_events enable row level security;
revoke all on schema private from public,anon,authenticated;
revoke all on all functions in schema private from public,anon,authenticated;
revoke all on all tables in schema private from public,anon,authenticated;
grant usage on schema private to authenticated;
grant execute on function private.allowed(uuid,uuid,text) to authenticated;
revoke all on public.organizations,public.health_units,public.profiles,public.patients,public.encounters,public.care_tasks,public.home_visits from anon;
grant select on public.organizations,public.health_units,public.profiles to authenticated;
grant select,insert,update on public.patients,public.encounters,public.care_tasks,public.home_visits to authenticated;

create policy organizations_read on public.organizations for select to authenticated
using (exists(select 1 from public.profiles p where p.organization_id=organizations.id
and p.id=(select auth.uid()) and private.allowed(p.organization_id,p.health_unit_id,'read')));
create policy units_read on public.health_units for select to authenticated
using(private.allowed(organization_id,id,'read'));
create policy profiles_read on public.profiles for select to authenticated
using(id=(select auth.uid()) and active);
create policy patients_read on public.patients for select to authenticated
using(private.allowed(organization_id,health_unit_id,'read'));
create policy patients_insert on public.patients for insert to authenticated
with check(created_by=(select auth.uid()) and private.allowed(organization_id,health_unit_id,'clinical'));
create policy patients_update on public.patients for update to authenticated
using(private.allowed(organization_id,health_unit_id,'clinical'))
with check(private.allowed(organization_id,health_unit_id,'clinical'));
create policy encounters_read on public.encounters for select to authenticated
using(private.allowed(organization_id,health_unit_id,'read'));
create policy encounters_insert on public.encounters for insert to authenticated
with check(author_id=(select auth.uid()) and private.allowed(organization_id,health_unit_id,'clinical'));
create policy encounters_update on public.encounters for update to authenticated
using(private.allowed(organization_id,health_unit_id,'clinical'))
with check(private.allowed(organization_id,health_unit_id,'clinical'));
create policy tasks_read on public.care_tasks for select to authenticated
using(private.allowed(organization_id,health_unit_id,'read'));
create policy tasks_insert on public.care_tasks for insert to authenticated
with check(created_by=(select auth.uid()) and private.allowed(organization_id,health_unit_id,'task'));
create policy tasks_update on public.care_tasks for update to authenticated
using(private.allowed(organization_id,health_unit_id,'task'))
with check(private.allowed(organization_id,health_unit_id,'task'));
create policy visits_read on public.home_visits for select to authenticated
using(private.allowed(organization_id,health_unit_id,'read'));
create policy visits_insert on public.home_visits for insert to authenticated
with check(created_by=(select auth.uid()) and private.allowed(organization_id,health_unit_id,'task'));
create policy visits_update on public.home_visits for update to authenticated
using(private.allowed(organization_id,health_unit_id,'task'))
with check(private.allowed(organization_id,health_unit_id,'task'));
