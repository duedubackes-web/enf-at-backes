-- ENF@BACKES v9: index assistant foreign keys for deletion checks and scope queries.
create index assistant_threads_scoped_unit_idx
 on public.assistant_threads(organization_id,health_unit_id);
create index assistant_messages_scoped_thread_idx
 on public.assistant_messages(thread_id,organization_id,health_unit_id,owner_id);
