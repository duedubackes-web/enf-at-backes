-- ENF@BACKES: controlled command action with explicit frontend confirmation.
create function private.agent_create_task(p_thread_id uuid,p_title text)
returns text language plpgsql security definer set search_path='' as $$
declare
 v_uid uuid:=auth.uid();
 v_org uuid;
 v_unit uuid;
 v_title text:=trim(p_title);
 v_id uuid;
 v_answer text;
begin
 if v_uid is null then raise exception 'Sessão obrigatória'; end if;
 if v_title is null or length(v_title)<3 or length(v_title)>200 then
  raise exception 'Título de tarefa entre 3 e 200 caracteres';
 end if;
 select organization_id,health_unit_id into v_org,v_unit
 from public.assistant_threads
 where id=p_thread_id and owner_id=v_uid;
 if v_org is null or not private.allowed(v_org,v_unit,'task') then
  raise exception 'Sem permissão para cadastrar tarefas';
 end if;
 if (select count(*) from public.assistant_messages
     where owner_id=v_uid and message_role='question'
       and created_at>now()-interval '1 hour')>=20 then
  raise exception 'Limite de operações por hora atingido';
 end if;
 insert into public.care_tasks(organization_id,health_unit_id,title,created_by)
 values(v_org,v_unit,v_title,v_uid) returning id into v_id;
 v_answer:='Tarefa registrada com status pendente. Código interno: '||v_id::text||
 '. Confira o módulo Tarefas antes de atribuir ou concluir.';
 insert into public.assistant_messages(thread_id,organization_id,health_unit_id,owner_id,agent,message_role,body)
 values (p_thread_id,v_org,v_unit,v_uid,'coordinator','question','Criar tarefa confirmada: '||v_title);
 insert into public.assistant_messages(thread_id,organization_id,health_unit_id,owner_id,agent,message_role,body)
 values (p_thread_id,v_org,v_unit,v_uid,'coordinator','assistant',v_answer);
 return v_answer;
end;
$$;
revoke all on function private.agent_create_task(uuid,text) from public,anon,authenticated;
grant execute on function private.agent_create_task(uuid,text) to authenticated;
create function public.agent_create_task(p_thread_id uuid,p_title text)
returns text language sql security invoker set search_path='' as $$
 select private.agent_create_task(p_thread_id,p_title);
$$;
revoke all on function public.agent_create_task(uuid,text) from public,anon,authenticated;
grant execute on function public.agent_create_task(uuid,text) to authenticated;
comment on function public.agent_create_task(uuid,text) is
 'Comando administrativo iniciado por ação explícita no frontend; RLS da unidade e autoria validadas no banco.';

