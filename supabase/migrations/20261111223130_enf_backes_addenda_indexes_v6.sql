-- ENF@BACKES migration 20261111223130: enf_backes_addenda_indexes_v6
-- Verified export from the existing Supabase migration history.
-- Índices adicionais após verificação dos advisors Supabase.
create index encounter_addenda_author_idx on public.encounter_addenda(author_id);
create index encounter_addenda_encounter_idx on public.encounter_addenda(encounter_id);
-- Não remover índices ainda não utilizados: ambiente não possui volume clínico para comparação de planos.
