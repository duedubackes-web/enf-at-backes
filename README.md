# ENF@BACKES — Gestão Inteligente de Enfermagem

**Status:** MVP técnico em evolução, **não homologado** para uso clínico com dados reais.

A plataforma ENF@BACKES organiza trabalho assistencial e operacional de enfermagem. A versão em desenvolvimento inclui landing page responsiva com animações leves, acesso institucional por Supabase Auth, dashboard com indicadores exatos, pacientes, atendimentos, tarefas, visitas, linhas de cuidado (pré-natal, diabetes e hipertensão) e uma **Central de Agentes** com chat profissional privado e criação confirmada de tarefas.

## Tecnologia

- React + TypeScript + Vite
- Supabase Auth, PostgreSQL, Row Level Security (RLS)
- Interface visual em ciano, azul clínico e verde-água
- GitHub Actions para verificação de tipos e build
- Configuração compatível com deploy Vercel (`vercel.json`)

## Início rápido

1. Instale Node.js 22 ou outra versão compatível com o projeto.
2. Execute `npm ci` e `npm run dev`.
3. Crie um arquivo local `.env` tomando `.env.example` como referência:
   - `VITE_SUPABASE_URL=https://cbofgqeqdmscmhwfcikx.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY=<chave publicável ativa do projeto>`
4. Não inclua senhas de banco, `service_role`, secret keys nem dados reais de pacientes em arquivos de frontend.

A landing page funciona sem configuração de banco. Login e módulos internos dependem do projeto Supabase e de uma **conta vinculada por administração institucional**. A plataforma não concede papéis a quem faz login.

## Supabase — ambiente conectado

Projeto de referência: `cbofgqeqdmscmhwfcikx`.

Migrações já executadas no projeto remoto:

| Versão registrada | Migração |
|---|---|
| 20261111215048 | `enf_backes_foundation_v1` |
| 20261111215141 | `enf_backes_hardening_v2` |
| 20261111215501 | `enf_backes_least_privilege_v3` |
| 20261111222757 | `enf_backes_longitudinal_care_v4` |
| 20261111222850 | `enf_backes_integrity_v5` |
| 20261111223130 | `enf_backes_addenda_indexes_v6` |
| 20261111225509 | `enf_backes_private_agent_chat_v7` |
| 20261111225818 | `enf_backes_agent_rpc_hardening_v8` |
| 20261111230050 | `enf_backes_agent_indexes_v9` |
| 20261111230209 | `enf_backes_agent_confirmed_tasks_v10` |
| 20261111232558 | `enf_backes_shift_handover_v11` |
| 20261111234735 | `enf_backes_exact_operational_overview_v12` |
| 20261112001606 | `enf_backes_administrative_workflows_v13` |

**Migrações reconciliadas:** os arquivos v1–v13 foram recuperados do histórico de migrações do Supabase e versionados com os **mesmos nomes e timestamps** registrados no banco remoto. Nunca reaplique migrações já registradas; confira o destino com `supabase migration list` antes de um eventual `supabase db push`. Faça backup e teste em ambiente descartável antes de alterações de esquema.

## Módulos

- **Painel**: contagens completas e segregadas por unidade, calculadas no PostgreSQL (sem exposição de registros de pacientes), com alertas administrativos de prazo ultrapassado.
- **Pacientes**: cadastro institucional com escopo da unidade.
- **Atendimentos**: rascunhos com autoria e finalização imutável.
- **Tarefas**: atribuições e acompanhamento operacional.
- **Visitas**: programação e conclusão de visitas domiciliares.
- **Linhas de cuidado**: inscrição e agenda longitudinal de pré-natal, diabetes e hipertensão.
- **Adendos**: registrados no banco como inserções imutáveis para atendimentos finalizados; a interface dedicada ainda será homologada.
- **Central de agentes**: chat privado com cinco agentes operacionais, criação confirmada de tarefas e resumo administrativo de passagem de plantão.
- **Central de Trabalho**: fila de pendências, filtros, pesquisa e checklists administrativos supervisionados.

## Acesso e segurança

- RLS habilitado para todas as tabelas públicas de aplicação.
- Dados segregados por organização/unidade e papel profissional.
- Cadastros de usuários e perfis devem ser provisionados por uma autoridade confiável.
- Logs de alterações ficam em schema privado, sem acesso direto ao navegador.
- Não utilizar métricas de demonstração como indicadores reais; contagens da interface são limitadas.
- Não há triagem automatizada, diagnóstico ou prescrição por IA.

## Qualidade e operação

- `npm test` — testa priorização administrativa com dados fictícios.
- `npm run typecheck` — verifica tipos.
- `npm run build` — compila a aplicação.
- GitHub Actions: workflow `ENF@BACKES CI`.
- `ENF@BACKES/DEPLOY-CHECKLIST.md` — passos de implantação e homologação.
- `ENF@BACKES/SEGURANCA.md` — controles essenciais.
- `ENF@BACKES/LINHAS-DE-CUIDADO.md` — escopo do acompanhamento.

## Próximos marcos

1. Provisionamento institucional e teste ponta a ponta de autenticação.
2. Testes de RLS com usuários e unidades fictícias distintas.
3. Formulário de adendos e prontuário estruturado; validar migrações em ambiente limpo antes de automatizar deploy do banco.
4. Provisão da conta profissional de Fernanda e validação do chat com perfis de teste.
5. Testes de acessibilidade e experiência no celular.
6. Deploy de preview Vercel e revisão clínica/segurança antes de produção.

**Importante:** padrões OMS/OPAS são referências de governança e segurança, não uma alegação de certificação ou conformidade automática.

## Continuar no Codex

Abra [Codex](https://chatgpt.com/codex), selecione `duedubackes-web/enf-at-backes` e use a branch `main` após integrar o PR. Leia `AGENTS.md` e `CODEX_HANDOFF.md` antes de alterar o projeto. O projeto de Vercel existente já usa GitHub; a prontidão técnica do build não significa homologação para usar dados clínicos reais.
