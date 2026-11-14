-- ENF@BACKES migration 20261111225509: enf_backes_private_agent_chat_v7
-- Verified export from the existing Supabase migration history.
-- ENF@BACKES: chat institucional determinístico, sem envio de dados a provedores externos.
create table public.assistant_threads(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null,
 health_unit_id uuid not null,
 owner_id uuid not null references auth.users(id),
 title text not null default 'Conversa de trabalho' check(length(title) between 3 and 120),
 created_at timestamptz not null default now(),
 unique(id,organization_id,health_unit_id,owner_id),
 foreign key(organization_id,health_unit_id)
  references public.health_units(organization_id,id)
);
create index assistant_threads_owner_idx on public.assistant_threads(owner_id,created_at desc);

create table public.assistant_messages(
 id uuid primary key default gen_random_uuid(),
 thread_id uuid not null,
 organization_id uuid not null,
 health_unit_id uuid not null,
 owner_id uuid not null,
 agent text not null check(agent in ('coordinator','visits','continuity','governance')),
 message_role text not null check(message_role in ('question','assistant')),
 body text not null check(length(body) between 1 and 1200),
 created_at timestamptz not null default now(),
 foreign key(thread_id,organization_id,health_unit_id,owner_id)
  references public.assistant_threads(id,organization_id,health_unit_id,owner_id)
);
create index assistant_messages_thread_idx on public.assistant_messages(thread_id,created_at,id);
create index assistant_messages_owner_time_idx on public.assistant_messages(owner_id,created_at desc);

alter table public.assistant_threads enable row level security;
alter table public.assistant_messages enable row level security;
revoke all on public.assistant_threads,public.assistant_messages from anon,authenticated;
grant select,insert on public.assistant_threads to authenticated;
grant select on public.assistant_messages to authenticated;

create policy assistant_threads_read on public.assistant_threads
 for select to authenticated
 using(owner_id=(select auth.uid()) and private.allowed(organization_id,health_unit_id,'read'));
create policy assistant_threads_insert on public.assistant_threads
 for insert to authenticated
 with check(owner_id=(select auth.uid()) and private.allowed(organization_id,health_unit_id,'read'));
create policy assistant_messages_read on public.assistant_messages
 for select to authenticated
 using(owner_id=(select auth.uid()) and private.allowed(organization_id,health_unit_id,'read'));

-- Create both question and answer only on trusted Postgres side.
-- No model access or third-party data sharing, no autonomous clinical decisions.
create function public.ask_nursing_agent(
 p_thread_id uuid,
 p_agent text,
 p_question text
) returns text language plpgsql security definer
set search_path=''
as $$
declare
 v_uid uuid := auth.uid();
 v_org uuid;
 v_unit uuid;
 v_answer text;
 v_count bigint;
 v_extra bigint;
 v_question text:=trim(p_question);
begin
 if v_uid is null then raise exception 'Sessão obrigatória'; end if;
 if p_agent not in ('coordinator','visits','continuity','governance') then
  raise exception 'Agente inválido';
 end if;
 if v_question is null or length(v_question) < 2 or length(v_question) > 600 then
  raise exception 'Escreva uma pergunta de 2 a 600 caracteres';
 end if;
 select t.organization_id,t.health_unit_id into v_org,v_unit
 from public.assistant_threads t
 where t.id=p_thread_id and t.owner_id=v_uid;
 if v_org is null or not private.allowed(v_org,v_unit,'read') then
  raise exception 'Conversa não autorizada';
 end if;
 -- 20 perguntas no período móvel de uma hora, por usuário.
 if (select count(*) from public.assistant_messages m
     where m.owner_id=v_uid and m.message_role='question'
       and m.created_at>now()-interval '1 hour') >= 20 then
  raise exception 'Limite de consultas por hora atingido';
 end if;
 if p_agent='coordinator' then
  select count(*) into v_count from public.care_tasks
   where organization_id=v_org and health_unit_id=v_unit
    and status in ('pending','in_progress');
  select count(*) into v_extra from public.care_tasks
   where organization_id=v_org and health_unit_id=v_unit
     and status in ('pending','in_progress') and due_at<now();
  v_answer:=format('Gestão da unidade: %s tarefas abertas, sendo %s com prazo ultrapassado. Confira o módulo Tarefas para distribuir e acompanhar o trabalho. Esta é uma contagem operacional, não uma recomendação clínica.',v_count,v_extra);
 elsif p_agent='visits' then
  select count(*) into v_count from public.home_visits
   where organization_id=v_org and health_unit_id=v_unit
     and status='planned';
  select count(*) into v_extra from public.home_visits
   where organization_id=v_org and health_unit_id=v_unit
     and status='planned' and scheduled_at<now();
  v_answer:=format('Visitas da unidade: %s previstas, das quais %s estão com horário ultrapassado. Consulte o módulo Visitas para conferência da agenda. Não existe classificação automática de prioridade clínica.',v_count,v_extra);
 elsif p_agent='continuity' then
  select count(*) into v_count from public.care_programs
   where organization_id=v_org and health_unit_id=v_unit and status='active';
  select count(*) into v_extra from public.care_followups
   where organization_id=v_org and health_unit_id=v_unit
    and status='planned' and scheduled_at<now();
  v_answer:=format('Continuidade do cuidado: %s acompanhamentos ativos (pré-natal, diabetes ou hipertensão) e %s retornos previstos com data ultrapassada. Revise Linhas de cuidado e valide os registros com a equipe. Sem diagnóstico ou orientação terapêutica automatizados.',v_count,v_extra);
 else
  select count(*) into v_count from public.encounters
   where organization_id=v_org and health_unit_id=v_unit and status='draft';
  select count(*) into v_extra from public.encounters
   where organization_id=v_org and health_unit_id=v_unit and status='finalized';
  v_answer:=format('Governança da unidade: %s atendimentos em rascunho e %s finalizados. Os registros finalizados exigem adendo rastreável. Revise pendências documentais e permissões institucionais; esta consulta não substitui auditoria formal.',v_count,v_extra);
 end if;
 insert into public.assistant_messages(thread_id,organization_id,health_unit_id,owner_id,agent,message_role,body)
 values (p_thread_id,v_org,v_unit,v_uid,p_agent,'question',v_question);
 insert into public.assistant_messages(thread_id,organization_id,health_unit_id,owner_id,agent,message_role,body)
 values (p_thread_id,v_org,v_unit,v_uid,p_agent,'assistant',v_answer);
 return v_answer;
end;
$$;
revoke all on function public.ask_nursing_agent(uuid,text,text) from public,anon,authenticated;
grant execute on function public.ask_nursing_agent(uuid,text,text) to authenticated;
comment on function public.ask_nursing_agent(uuid,text,text) is
 'Agentes operacionais determinísticos: contagens por unidade com acesso verificado. Não é integração com modelo generativo nem produz conteúdo clínico.';
comment on table public.assistant_messages is
 'Mensagens privadas por profissional e unidade; não incluir dados identificáveis desnecessários ou documentação clínica em prompts.';
