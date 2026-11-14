-- ENF@BACKES migration 20261111215141: enf_backes_hardening_v2
-- Verified export from the existing Supabase migration history.
-- V2 hardening: immutable provenance, scoped assignments, and FK indexes
alter table public.profiles add constraint profiles_scoped_identity unique (organization_id,health_unit_id,id);

alter table public.care_tasks
  add constraint tasks_assignee_same_unit
  foreign key (organization_id,health_unit_id,assigned_to)
  references public.profiles(organization_id,health_unit_id,id);
alter table public.home_visits
  add constraint visits_assignee_same_unit
  foreign key (organization_id,health_unit_id,assigned_to)
  references public.profiles(organization_id,health_unit_id,id);

create function private.guard_provenance() returns trigger
language plpgsql set search_path='' as $$
begin
  if new.created_by is distinct from old.created_by or new.created_at is distinct from old.created_at then
    raise exception 'Autoria e data de criacao imutaveis';
  end if;
  return new;
end; $$;
create function private.guard_encounter_provenance() returns trigger
language plpgsql set search_path='' as $$
begin
  if new.author_id is distinct from old.author_id
   or new.created_at is distinct from old.created_at
   or new.occurred_at is distinct from old.occurred_at
   or new.patient_id is distinct from old.patient_id
   or new.finalized_at is distinct from old.finalized_at and old.status='finalized'
  then raise exception 'Autoria e origem de atendimento sao imutaveis'; end if;
  return new;
end; $$;
create trigger patients_provenance before update on public.patients for each row execute function private.guard_provenance();
create trigger tasks_provenance before update on public.care_tasks for each row execute function private.guard_provenance();
create trigger visits_provenance before update on public.home_visits for each row execute function private.guard_provenance();
create trigger encounters_provenance before update on public.encounters for each row execute function private.guard_encounter_provenance();

create index profiles_scoped_unit_idx on public.profiles(organization_id,health_unit_id);
create index patients_created_by_idx on public.patients(created_by);
create index encounters_author_idx on public.encounters(author_id);
create index tasks_assignee_idx on public.care_tasks(assigned_to);
create index tasks_created_by_idx on public.care_tasks(created_by);
create index tasks_patient_idx on public.care_tasks(organization_id,health_unit_id,patient_id);
create index visits_assignee_idx on public.home_visits(assigned_to);
create index visits_created_by_idx on public.home_visits(created_by);
create index visits_patient_idx on public.home_visits(organization_id,health_unit_id,patient_id);

-- Protect finalization time against arbitrary client-supplied timestamps.
create function private.set_encounter_finalization_time() returns trigger
language plpgsql set search_path='' as $$
begin
 if tg_op='INSERT' then
   if new.status='finalized' then raise exception 'Atendimento deve iniciar como rascunho'; end if;
   if new.finalized_at is not null then raise exception 'Data de finalizacao nao permitida no rascunho'; end if;
 else
   if old.status='finalized' then raise exception 'Atendimento finalizado imutavel'; end if;
   if old.status='draft' and new.status='finalized' then new.finalized_at=now(); end if;
   if new.status='draft' and new.finalized_at is not null then raise exception 'Rascunho nao pode ter data de finalizacao'; end if;
 end if;
 return new;
end;$$;
drop trigger finalize_encounter on public.encounters;
create trigger finalize_encounter before insert or update on public.encounters
 for each row execute function private.set_encounter_finalization_time();

revoke all on function private.guard_provenance() from public,anon,authenticated;
revoke all on function private.guard_encounter_provenance() from public,anon,authenticated;
revoke all on function private.set_encounter_finalization_time() from public,anon,authenticated;
