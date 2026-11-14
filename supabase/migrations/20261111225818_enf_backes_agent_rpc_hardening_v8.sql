-- ENF@BACKES migration 20261111225818: enf_backes_agent_rpc_hardening_v8
-- Verified export from the existing Supabase migration history.
-- Supabase chat RPC: unprivileged public entrypoint; privileged logic stays in private schema.
alter function public.ask_nursing_agent(uuid,text,text) set schema private;
revoke all on function private.ask_nursing_agent(uuid,text,text) from public,anon,authenticated;
grant execute on function private.ask_nursing_agent(uuid,text,text) to authenticated;
create function public.ask_nursing_agent(p_thread_id uuid,p_agent text,p_question text)
 returns text language sql security invoker set search_path='' as $$
 select private.ask_nursing_agent(p_thread_id,p_agent,p_question);
$$;
revoke all on function public.ask_nursing_agent(uuid,text,text) from public,anon,authenticated;
grant execute on function public.ask_nursing_agent(uuid,text,text) to authenticated;
comment on function public.ask_nursing_agent(uuid,text,text) is
 'SECURITY INVOKER wrapper, checks performed in private schema; no external AI access.';
