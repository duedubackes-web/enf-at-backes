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

## Atualização automática dos prazos
- A fila, o filtro Hoje e os contadores de atraso são recalculados a cada 30 segundos e ao retornar o foco ou a visibilidade da aba, usando o calendário local do navegador.
- O resumo copiado recalcula atrasos no momento da exportação. A amostra continua limitada às 200 tarefas carregadas; alterações de outros profissionais exigem Atualizar.
- Concluídas e canceladas nunca geram alerta de atraso. Datas ausentes ou inválidas não geram alertas e ficam ao final da ordenação.
- `npm test` cobre vencimento, virada do dia local, estados, busca e ordenação com dados fictícios. O CI instala pelo lockfile e executa os testes antes das verificações de build.

## Arquitetura preservada nesta evolução
React/TypeScript com Vite mantém o estado e a navegação no cliente. A Central de Trabalho consulta `care_tasks` com filtros explícitos de organização/unidade; a autorização efetiva permanece nas políticas RLS do Supabase. Checklists continuam na RPC `create_admin_checklist`, com confirmação e idempotência existentes. O novo cálculo de prazos é uma função pura e não realiza consultas nem gravações.

Vercel mantém o projeto existente `enf-at-backes` na equipe `ebb10`, Node 22, build Vite e fallback SPA. Nenhuma migração, permissão, configuração de autenticação ou variável remota foi alterada. Testes locais não substituem a homologação de RLS, idempotência e acesso entre contas fictícias.

### Evidência desta alteração
- Instalação limpa com `npm ci`, seis testes `npm test`, `npm run typecheck`, `npm run build` e `npm run check:deploy`: aprovados localmente.
- Chromium/Playwright local: landing renderizada; tarefa fictícia recebida por resposta simulada aparece no filtro Atrasadas após avanço do relógio em 30 segundos; perfil viewer não recebe botão Concluir; nenhum erro JavaScript no fluxo.
- A fonte externa Google Fonts apresentou erro de certificado no navegador deste ambiente; o conteúdo carregou com fonte alternativa.
- Não executados: autenticação institucional real, RLS entre unidades, escrita de checklists no Supabase e homologação clínica. A simulação do navegador não valida autorização no servidor.
