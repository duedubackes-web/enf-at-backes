# ENF@BACKES — Gestão Inteligente de Enfermagem

**Status:** MVP técnico em evolução, **não homologado** para uso clínico com dados reais.

A plataforma ENF@BACKES organiza trabalho assistencial e operacional de enfermagem. A versão em desenvolvimento inclui landing page responsiva com animações leves, acesso institucional por Supabase Auth, dashboard, pacientes, atendimentos, tarefas, visitas e linhas de cuidado (pré-natal, diabetes e hipertensão).

## Tecnologia

- React + TypeScript + Vite
- Supabase Auth, PostgreSQL, Row Level Security (RLS)
- Interface visual em ciano, azul clínico e verde-água
- GitHub Actions para verificação de tipos e build
- Configuração compatível com deploy Vercel (`vercel.json`)

## Início rápido

1. Instale Node.js 22 ou outra versão compatível com o projeto.
2. Execute `npm install` e `npm run dev`.
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

**Cuidado com migrações:** scripts de v4–v6 estão no repositório como registro do que foi aplicado; v1–v3 permanecem no histórico remoto e precisam ser exportados e reconciliados em um baseline antes de qualquer `supabase db push`. Não reexecute as migrations em um banco que já as recebeu.

## Módulos

- **Painel**: resumo amostral de pacientes, atendimentos, tarefas e visitas.
- **Pacientes**: cadastro institucional com escopo da unidade.
- **Atendimentos**: rascunhos com autoria e finalização imutável.
- **Tarefas**: atribuições e acompanhamento operacional.
- **Visitas**: programação e conclusão de visitas domiciliares.
- **Linhas de cuidado**: inscrição e agenda longitudinal de pré-natal, diabetes e hipertensão.
- **Adendos**: registrados no banco como inserções imutáveis para atendimentos finalizados; a interface dedicada ainda será homologada.

## Acesso e segurança

- RLS habilitado para todas as tabelas públicas de aplicação.
- Dados segregados por organização/unidade e papel profissional.
- Cadastros de usuários e perfis devem ser provisionados por uma autoridade confiável.
- Logs de alterações ficam em schema privado, sem acesso direto ao navegador.
- Não utilizar métricas de demonstração como indicadores reais; contagens da interface são limitadas.
- Não há triagem automatizada, diagnóstico ou prescrição por IA.

## Qualidade e operação

- `npm run typecheck` — verifica tipos.
- `npm run build` — compila a aplicação.
- GitHub Actions: workflow `ENF@BACKES CI`.
- `ENF@BACKES/DEPLOY-CHECKLIST.md` — passos de implantação e homologação.
- `ENF@BACKES/SEGURANCA.md` — controles essenciais.
- `ENF@BACKES/LINHAS-DE-CUIDADO.md` — escopo do acompanhamento.

## Próximos marcos

1. Provisionamento institucional e teste ponta a ponta de autenticação.
2. Testes de RLS com usuários e unidades fictícias distintas.
3. Formulário de adendos, prontuário estruturado e reconciliação das migrations.
4. Testes de acessibilidade e experiência no celular.
5. Deploy de preview Vercel e revisão clínica/segurança antes de produção.

**Importante:** padrões OMS/OPAS são referências de governança e segurança, não uma alegação de certificação ou conformidade automática.
