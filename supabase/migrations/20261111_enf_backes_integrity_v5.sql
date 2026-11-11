-- ENF@BACKES v5: integridade de vínculos e trilha de acompanhamento.
-- Adoção aditiva: não altera registros existentes nem cria usuários.
alter table public.encounters
 add constraint encounters_scope_identity unique(organization_id,health_unit_id,id);

alter table public.encounter_addenda
 add constraint addenda_encounter_same_unit
 foreign key(organization_id,health_unit_id,encounter_id)
 references public.encounters(organization_id,health_unit_id,id);

create function private.guard_program_immutable() returns trigger
language plpgsql set search_path='' as $$
begin
 if new.patient_id is distinct from old.patient_id
    or new.program_type is distinct from old.program_type
    or new.enrolled_at is distinct from old.enrolled_at
 then raise exception 'Paciente, linha de cuidado e inicio de acompanhamento sao imutaveis';
 end if;
 if old.status<>'active' and new.status is distinct from old.status
 then raise exception 'Programa encerrado nao pode ser reaberto; crie novo ciclo';
 end if;
 return new;
end;
$$;
revoke all on function private.guard_program_immutable() from public,anon,authenticated;
create trigger guard_program_immutable before update on public.care_programs
 for each row execute function private.guard_program_immutable();

-- Histórico imutável de adendos: nenhuma permissão UPDATE ou DELETE aos clientes.
revoke update,delete on public.encounter_addenda from authenticated;
-- Atribuição de data de conclusão pelo banco: registros operacionais vinculados a followups.
comment on table public.care_followups is
 'Acompanhamento de rotina com registro de data, estado e observações descritivas; não produz classificação clínica nem diagnóstico.';
