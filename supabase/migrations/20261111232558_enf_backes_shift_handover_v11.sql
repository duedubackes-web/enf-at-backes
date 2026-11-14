-- ENF@BACKES migration 20261111232558: enf_backes_shift_handover_v11
-- Verified export from the existing Supabase migration history.
-- ENF@BACKES v11: passagem de plantão gerencial, sem identificação de pacientes.
alter table public.assistant_messages drop constraint assistant_messages_agent_check;
alter table public.assistant_messages add constraint assistant_messages_agent_check
 check(agent in ('coordinator','visits','continuity','governance','handover'));

create function private.agent_shift_handover(p_thread_id uuid)
returns text language plpgsql security definer set search_path=''
as $$
declare
 v_uid uuid := auth.uid();
 v_org uuid;
 v_unit uuid;
 v_tasks bigint;
 v_visits bigint;
 v_followups bigint;
 v_drafts bigint;
 v_answer text;
begin
 if v_uid is null then raise exception 'Sessão obrigatória'; end if;
 select t.organization_id,t.health_unit_id into v_org,v_unit
 from public.assistant_threads t
 where t.id=p_thread_id and t.owner_id=v_uid;
 if v_org is null or not private.allowed(v_org,v_unit,'read') then
  raise exception 'Conversa não autorizada';
 end if;
 if (select count(*) from public.assistant_messages m
      where m.owner_id=v_uid and m.message_role='question'
      and m.created_at>now()-interval '1 hour')>=20 then
  raise exception 'Limite de consultas por hora atingido';
 end if;
 select count(*) into v_tasks from public.care_tasks
 where organization_id=v_org and health_unit_id=v_unit
 and status in ('pending','in_progress');
 select count(*) into v_visits from public.home_visits
 where organization_id=v_org and health_unit_id=v_unit
 and status='planned';
 select count(*) into v_followups from public.care_followups
 where organization_id=v_org and health_unit_id=v_unit
 and status='planned';
 select count(*) into v_drafts from public.encounters
 where organization_id=v_org and health_unit_id=v_unit
 and status='draft';
 v_answer:=format(
 'PASSAGEM DE PLANTÃO — RESUMO GERENCIAL (gerado em %s)'||E'\n'||
 '• %s tarefa(s) abertas.'||E'\n'||
 '• %s visita(s) domiciliares previstas.'||E'\n'||
 '• %s retorno(s) de acompanhamento previstos.'||E'\n'||
 '• %s atendimento(s) em rascunho.'||E'\n\n'||
 'Orientação administrativa: confira os módulos de cada área e valide as informações diretamente com a equipe antes de repassar o plantão. Não é relatório clínico nem substitui a passagem de plantão assistencial.',
 to_char(now() at time zone 'America/Sao_Paulo','DD/MM/YYYY HH24:MI'),
 v_tasks,v_visits,v_followups,v_drafts);
 insert into public.assistant_messages(thread_id,organization_id,health_unit_id,owner_id,agent,message_role,body)
 values(p_thread_id,v_org,v_unit,v_uid,'handover','question','Gerar resumo gerencial de passagem de plantão');
 insert into public.assistant_messages(thread_id,organization_id,health_unit_id,owner_id,agent,message_role,body)
 values(p_thread_id,v_org,v_unit,v_uid,'handover','assistant',v_answer);
 return v_answer;
end; $$;
revoke all on function private.agent_shift_handover(uuid) from public,anon,authenticated;
grant execute on function private.agent_shift_handover(uuid) to authenticated;
create function public.agent_shift_handover(p_thread_id uuid)
returns text language sql security invoker set search_path=''
as $$ select private.agent_shift_handover(p_thread_id); $$;
revoke all on function public.agent_shift_handover(uuid) from public,anon,authenticated;
grant execute on function public.agent_shift_handover(uuid) to authenticated;
comment on function public.agent_shift_handover(uuid) is 'Resumo operacional, sem dados identificáveis e sem aconselhamento clínico; isolamento e limite aplicados no schema privado.';
