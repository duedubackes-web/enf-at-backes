-- ENF@BACKES v13: administrative checklists with explicit confirmation and idempotency.
-- No automated clinical directives; no patient identifiers in the generated tasks.
create table private.admin_checklist_runs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null,
  actor_id uuid not null references auth.users(id),
  organization_id uuid not null,
  health_unit_id uuid not null,
  template_code text not null,
  tasks_created integer not null default 0,
  created_at timestamptz not null default now(),
  unique(actor_id,request_id)
);
alter table private.admin_checklist_runs enable row level security;
revoke all on table private.admin_checklist_runs from public,anon,authenticated;
create index admin_checklist_runs_actor_time on private.admin_checklist_runs(actor_id,created_at desc);

create function private.create_admin_checklist(
 p_template text, p_request_id uuid
) returns jsonb
language plpgsql security definer set search_path=''
as $$
declare
  v_actor uuid:=auth.uid();
  v_org uuid;
  v_unit uuid;
  v_run uuid;
  v_count int;
  v_code text:=trim(p_template);
  v_titles text[];
  v_title text;
begin
  if v_actor is null then raise exception 'Autenticação obrigatória'; end if;
  if p_request_id is null then raise exception 'Identificador da solicitação obrigatório'; end if;

  select p.organization_id,p.health_unit_id
    into v_org,v_unit from public.profiles p
    where p.id=v_actor and p.active;
  if v_org is null or not private.allowed(v_org,v_unit,'task') then
    raise exception 'Sem permissão para criar tarefas nesta unidade';
  end if;

  if v_code='shift_handover' then
    v_titles:=array[
     'Conferir pendências administrativas do turno',
     'Verificar agenda operacional de visitas e retornos',
     'Revisar tarefas abertas antes da passagem de plantão'
    ];
  elsif v_code='weekly_coordination' then
    v_titles:=array[
     'Revisar distribuição das tarefas da equipe',
     'Conferir agendas e pendências da semana',
     'Consolidar pontos administrativos da reunião de equipe'
    ];
  elsif v_code='documentation_review' then
    v_titles:=array[
     'Conferir registros em rascunho pendentes de revisão',
     'Verificar completude administrativa dos atendimentos',
     'Registrar encaminhamentos para revisão documental'
    ];
  else
    raise exception 'Modelo administrativo inválido';
  end if;

  -- At most 5 checklist creations per hour; repeated request_id is idempotent.
  select tasks_created into v_count from private.admin_checklist_runs
   where actor_id=v_actor and request_id=p_request_id;
  if found then
    return jsonb_build_object('created',false,'task_count',v_count,'template',v_code);
  end if;
  if (select count(*) from private.admin_checklist_runs
      where actor_id=v_actor and created_at>now()-interval '1 hour')>=5 then
    raise exception 'Limite de checklists por hora atingido';
  end if;
  insert into private.admin_checklist_runs
    (request_id,actor_id,organization_id,health_unit_id,template_code)
  values(p_request_id,v_actor,v_org,v_unit,v_code)
  on conflict(actor_id,request_id) do nothing returning id into v_run;

  if v_run is null then
    select tasks_created into v_count from private.admin_checklist_runs
    where actor_id=v_actor and request_id=p_request_id;
    return jsonb_build_object('created',false,'task_count',v_count,'template',v_code);
  end if;

  foreach v_title in array v_titles loop
    insert into public.care_tasks(
      organization_id,health_unit_id,title,created_by,status
    ) values(v_org,v_unit,v_title,v_actor,'pending');
  end loop;
  v_count:=cardinality(v_titles);
  update private.admin_checklist_runs set tasks_created=v_count where id=v_run;
  return jsonb_build_object('created',true,'task_count',v_count,'template',v_code);
end;
$$;
revoke all on function private.create_admin_checklist(text,uuid) from public,anon,authenticated;
grant execute on function private.create_admin_checklist(text,uuid) to authenticated;

create function public.create_admin_checklist(p_template text,p_request_id uuid)
returns jsonb language sql security invoker set search_path=''
as $$select private.create_admin_checklist(p_template,p_request_id)$$;
revoke all on function public.create_admin_checklist(text,uuid) from public,anon,authenticated;
grant execute on function public.create_admin_checklist(text,uuid) to authenticated;

comment on function public.create_admin_checklist(text,uuid) is
'Creates only preapproved administrative tasks after explicit UI confirmation, scoped to the authenticated users health unit, idempotent by request UUID.';

