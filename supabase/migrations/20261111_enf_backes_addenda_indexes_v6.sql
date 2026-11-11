-- Índices adicionais após verificação dos advisors Supabase.
create index encounter_addenda_author_idx on public.encounter_addenda(author_id);
create index encounter_addenda_encounter_idx on public.encounter_addenda(encounter_id);
-- Não remover índices ainda não utilizados: ambiente não possui volume clínico para comparação de planos.
