# Organização das entregas

Conferência em 14/11/2026. Este arquivo descreve a sequência de revisão; não afirma que os PRs estejam integrados ou publicados.

## Entregas encadeadas

| Etapa | Branch | Base | Revisão |
| --- | --- | --- | --- |
| PWA | `feat/cross-platform-pwa-v12` | Conferir PR original | Base indicada para esta sequência |
| Agenda do dia | `feat/daily-nursing-agenda` | PWA | [PR #9](https://github.com/duedubackes-web/enf-at-backes/pull/9), aberto na conferência |
| Organização de visitas | `feat/home-visits-worklist` | Agenda | [PR #10](https://github.com/duedubackes-web/enf-at-backes/pull/10), aberto na conferência |
| Abertura do registro e estados de consulta | `feat/agenda-record-navigation` | Visitas | [PR #11](https://github.com/duedubackes-web/enf-at-backes/pull/11), aberto na conferência |
| Organização de tarefas e estilos compartilhados | `feat/organized-task-worklist` | Navegação da agenda | Entrega desta branch |

Revisar a partir da base. Antes de integrar cada PR, conferir o destino e o diff: os PRs dependem uns dos outros. Se a base for integrada e removida, atualizar o destino do próximo PR e confirmar que o diff contém apenas a entrega correspondente. Não executar merge automático nem alterar produção como parte desta sequência.

## Mapa de manutenção

- `src/main.tsx`: composição dos módulos, consultas existentes e callbacks de gravação.
- `src/DailyAgenda.tsx` + `src/daily-agenda.ts`: agenda do dia e seleção cronológica.
- `src/TasksList.tsx` + `src/task-priority.ts`: fila de tarefas, busca, prazos e resumo administrativo. A Central de Trabalho reutiliza as regras de prioridade.
- `src/VisitsList.tsx` + `src/visit-planning.ts`: fila de visitas e busca por cadastros carregados.
- `src/worklist.css`: estilos comuns das filas de tarefas e visitas. Manter os componentes com a mesma linguagem visual.
- `src/RecordFocus.tsx`: foco de teclado e destaque do registro aberto pela agenda.
- `tests/agenda-flow.browser.cjs`: navegação completa com Supabase simulado.
- `tests/worklists.browser.cjs`: filtros e ações de tarefas com dados fictícios, sem conexão com Supabase.

## Verificação reproduzível

1. `npm ci`
2. `npm test`
3. `npm run typecheck`
4. `npm run build`
5. `npm run check:deploy`
6. `npx playwright install chromium`
7. Em um terminal: `npm run dev`. Em outro: `npm run test:browser`.

Os testes de navegador consideram 390 e 1280 px. Testes simulados verificam a interface e os callbacks, sem comprovar persistência no banco, políticas RLS, autenticação real ou instalação em aparelhos físicos.

## Próximas prioridades

| Prioridade | Entrega | Evidência necessária |
| --- | --- | --- |
| 1 | Revisar e consolidar esta sequência | PRs com destino correto, CI e revisão do diff |
| 2 | Validar autenticação e permissões | Contas fictícias institucionais de duas unidades, testes negativos de RLS e gravação autorizada |
| 3 | Superar o limite de amostragem | Paginação e consultas de período com isolamento por unidade, sem apresentar amostra como total |
| 4 | Validar uso em dispositivos reais | Instalação, teclado, menu, safe areas e saída em Android, iPhone e desktop |

A agenda e as listas usam os registros já carregados, limitados a 200 por módulo. Permanecem pendentes a homologação institucional, a revisão clínica, a governança LGPD e os testes de recuperação. Não inserir dados reais antes dessas aprovações.
