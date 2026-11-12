# ENF@BACKES — Central de Trabalho v1.0 beta

## Problema resolvido
Reduzir a repetição administrativa de registrar tarefas de rotina, encontrar pendências e organizar a conferência de plantões. Não automatiza atos clínicos, diagnósticos ou prescrições.

## Funcionalidades
- Interface **Central de Trabalho** no painel institucional.
- Fila de tarefas com busca e filtros: abertas, atrasadas, hoje, concluídas e todas.
- Organização por prazo administrativo, com ação de concluir/reabrir mediante permissão.
- Cadastro rápido de tarefa com prazo opcional.
- Exportação para área de transferência de resumo **sem nomes de pacientes** e explicitamente limitado à amostra.
- Três checklists predefinidos: passagem de plantão, reunião semanal e revisão documental. Cada um gera três tarefas genéricas.
- Antes da geração, o profissional confere todos os itens e precisa clicar **Confirmar e criar 3 tarefas**.
- Backend `public.create_admin_checklist(template,request_id)` valida sessão, vínculo e permissão de tarefas; usa implementação em schema privado e chave idempotente por requisição.

## Segurança
- Operação limitada a profissionais com papel nurse, coordinator ou technician.
- Nenhuma opção permite fornecer arbitrariamente tarefas via modelo: templates são codificados no banco.
- Nenhum checklist é criado automaticamente ao carregar a tela.
- Proteção idempotente evita duplicação com o mesmo request_id; limite de cinco operações por usuário/hora.
- A tabela de idempotência está no schema privado, com RLS e sem grants de leitura pública.
- Dados clínicos não são usados na criação de tarefas.
- A interface lista 200 tarefas recentes, rotuladas como amostra, e o Painel geral mostra indicadores integrais via RPC.

## Critérios de homologação
1. Testar execução e repetição do mesmo request_id usando uma conta de teste (esperado: um checklist sem duplicidade).
2. Testar que perfil viewer/administrator não tem permissão de criar tarefa.
3. Validar visualização apenas da unidade, sem acesso cruzado.
4. Revisar limites e eficiência das consultas com dados fictícios.
5. Revisar acessibilidade no celular e processos internos com a equipe de enfermagem.

## Banco
Migração v13 aplicada ao Supabase remoto. O SQL versionado serve à revisão e não deve ser reaplicado ao projeto já migrado.
