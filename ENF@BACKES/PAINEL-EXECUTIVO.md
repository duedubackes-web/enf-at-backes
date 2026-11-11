# ENF@BACKES v0.9 — painel executivo com indicadores integrais

## Entrega
O painel deixou de usar o comprimento dos arrays limitados a 200 registros como indicador. Agora chama a RPC `public.nursing_operational_overview()`, que retorna somente contagens operacionais calculadas diretamente no PostgreSQL e filtradas pela **unidade ativa do usuário autenticado**.

Indicadores: pacientes ativos; tarefas abertas e com prazo ultrapassado; visitas previstas e com horário ultrapassado; programas de cuidado ativos; retornos previstos e com data ultrapassada; atendimentos em rascunho e finalizados.

## Segurança
- Sem argumentos de unidade fornecidos pelo cliente: a função identifica vínculo por `auth.uid()` e confere autorização com `private.allowed(...,'read')`.
- Implementação privilegiada está no schema `private`; a RPC em `public` é `SECURITY INVOKER`.
- Nenhum nome, identificador ou documento de paciente é retornado.
- Sem inferência de risco clínico: atrasos são somente alertas administrativos.
- A UI apresenta erro em falha de autorização ou RPC em vez de números fictícios.

## Testes necessários antes do piloto
1. Criar duas unidades fictícias com profissionais de teste por operador institucional confiável.
2. Inserir dados fictícios distintos e provar que os totais da unidade A não incluem a unidade B.
3. Verificar que usuário anônimo e usuário sem perfil ativo não executam RPC.
4. Verificar tempos de resposta com volume representativo e adicionar índices/particionamento se indicado por `EXPLAIN`.
5. Homologar semântica dos indicadores com a responsabilidade técnica antes de utilizar dados reais.

## Banco
Migração v12 já aplicada ao Supabase remoto e versionada neste repositório; **não reaplicar** no mesmo ambiente.
