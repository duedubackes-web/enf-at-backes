-- ENF@BACKES: acompanhamento longitudinal e adendos (v4).
-- Apenas registros organizacionais; sem regras diagnósticas automáticas.
create table public.care_programs (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null,
 health_unit_id uuid not null,
 patient_id uuid not null,
 program_type text not null check(program_type in ('prenatal','diabetes','hypertension')),
 status text not null default 'active' check(status in ('active','completed','cancelled')),
 enrolled_at timestamptz not null default now(),
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique (organization_id,health_unit_id,id),
 foreign key (organization_id,health_unit_id,patient_id)
 references public.patients(organization_id,health_unit_id,id)
);
create unique index care_program_one_active
 on public.care_programs(organization_id,health_unit_id,patient_id,program_type)
 where status='active';
create index care_program_patient_idx on public.care_programs(organization_id,health_unit_id,patient_id);
create index care_program_creator_idx on public.care_programs(created_by);

create table public.care_followups (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null,
 health_unit_id uuid not null,
 program_id uuid not null,
 scheduled_at timestamptz not null,
 status text not null default 'planned' check(status in ('planned','completed','cancelled')),
 note text not null default '' check(length(note)<=5000),
 created_by uuid not null references auth.users(id),
 completed_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 foreign key (organization_id,health_unit_id,program_id)
 references public.care_programs(organization_id,health_unit_id,id),
 constraint care_followup_completion check (
 (status='completed' and completed_at is not null)
 or (status<>'completed' and completed_at is null))
);
create index followups_due_idx on public.care_followups(organization_id,health_unit_id,status,scheduled_at);
create index followups_program_idx on public.care_followups(organization_id,health_unit_id,program_id);
create index followups_creator_idx on public.care_followups(created_by);

create table public.encounter_addenda (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null,
 health_unit_id uuid not null,
 encounter_id uuid not null references public.encounters(id),
 author_id uuid not null references auth.users(id),
 reason text not null check(length(trim(reason)) between 5 and 400),
 body text not null check(length(trim(body)) between 5 and 5000),
 created_at timestamptz not null default now()
);
-- Registrar adendos apenas em atendimentos FINALIZADOS da própria unidade.
create function private.valid_addendum_scope(o uuid,u uuid,e uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.encounters x
 where x.id=e and x.organization_id=o and x.health_unit_id=u and x.status='finalized')
$$;
revoke all on function private.valid_addendum_scope(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function private.valid_addendum_scope(uuid,uuid,uuid) to authenticated;
create index addenda_encounter_idx on public.encounter_addenda(organization_id,health_unit_id,encounter_id,created_at);

create trigger programs_scope before update on public.care_programs for each row execute function private.guard_scope();
create trigger followups_scope before update on public.care_followups for each row execute function private.guard_scope();
create trigger programs_provenance before update on public.care_programs for each row execute function private.guard_provenance();
create trigger followups_provenance before update on public.care_followups for each row execute function private.guard_provenance();
create trigger programs_stamp before update on public.care_programs for each row execute function private.stamp();
create trigger followups_stamp before update on public.care_followups for each row execute function private.stamp();

-- Controle de transição: concluído não pode voltar ao planejamento, conclusão recebe data do servidor.
create function private.guard_followup_status() returns trigger
language plpgsql set search_path='' as $$
begin
 if tg_op='INSERT' then
  if new.status<>'planned' or new.completed_at is not null then
   raise exception 'Acompanhamento deve ser criado como planejado';
  end if;
 else
  if new.program_id is distinct from old.program_id or new.scheduled_at is distinct from old.scheduled_at then
   raise exception 'Programa e data original são imutáveis; reagende em novo registro';
  end if;
  if old.status<>'planned' then raise exception 'Acompanhamento concluído ou cancelado é imutável'; end if;
  if new.status='completed' then new.completed_at=now(); else new.completed_at=null; end if;
 end if;
 return new;
end; $$;
revoke all on function private.guard_followup_status() from public,anon,authenticated;
create trigger guard_followup_status before insert or update on public.care_followups
 for each row execute function private.guard_followup_status();

create trigger audit_programs after insert or update or delete on public.care_programs
 for each row execute function private.audit();
create trigger audit_followups after insert or update or delete on public.care_followups
 for each row execute function private.audit();
create trigger audit_addenda after insert or update or delete on public.encounter_addenda
 for each row execute function private.audit();

alter table public.care_programs enable row level security;
alter table public.care_followups enable row level security;
alter table public.encounter_addenda enable row level security;
revoke all on public.care_programs,public.care_followups,public.encounter_addenda from anon;
revoke all on public.care_programs,public.care_followups,public.encounter_addenda from authenticated;
grant select,insert,update on public.care_programs,public.care_followups to authenticated;
grant select,insert on public.encounter_addenda to authenticated;

create policy program_read on public.care_programs for select to authenticated
 using(private.allowed(organization_id,health_unit_id,'read'));
create policy program_insert on public.care_programs for insert to authenticated
 with check(created_by=(select auth.uid()) and private.allowed(organization_id,health_unit_id,'clinical'));
create policy program_update on public.care_programs for update to authenticated
 using(private.allowed(organization_id,health_unit_id,'clinical'))
 with check(private.allowed(organization_id,health_unit_id,'clinical'));

create policy followup_read on public.care_followups for select to authenticated
 using(private.allowed(organization_id,health_unit_id,'read'));
create policy followup_insert on public.care_followups for insert to authenticated
 with check(created_by=(select auth.uid()) and private.allowed(organization_id,health_unit_id,'clinical'));
create policy followup_update on public.care_followups for update to authenticated
 using(private.allowed(organization_id,health_unit_id,'clinical'))
 with check(private.allowed(organization_id,health_unit_id,'clinical'));

create policy addendum_read on public.encounter_addenda for select to authenticated
 using(private.allowed(organization_id,health_unit_id,'read'));
create policy addendum_insert on public.encounter_addenda for insert to authenticated
 with check(author_id=(select auth.uid()) and private.allowed(organization_id,health_unit_id,'clinical')
 and private.valid_addendum_scope(organization_id,health_unit_id,encounter_id));

-- Apenas o autor poderá alterar seus próprios rascunhos de atendimento.
drop policy encounters_update on public.encounters;
create policy encounters_update on public.encounters for update to authenticated
 using(author_id=(select auth.uid()) and private.allowed(organization_id,health_unit_id,'clinical'))
 with check(author_id=(select auth.uid()) and private.allowed(organization_id,health_unit_id,'clinical'));

comment on table public.care_programs is 'Acompanhamento operacional de linhas de cuidado; não representa diagnóstico automático';
comment on table public.care_followups is 'Agenda e registro de acompanhamento; sem recomendações clínicas automáticas';
comment on table public.encounter_addenda is 'Adendos imutáveis associados a atendimentos finalizados';
