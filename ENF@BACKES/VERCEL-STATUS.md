# ENF@BACKES — estado verificado da integração Vercel

Data da verificação: 2026-11-11.

## Infraestrutura vinculada
- Equipe Vercel: `ebb10` (ID `team_POY6lEjpKc7hlbEOWSGmw7VO`).
- Projeto **existente e reutilizado**: `enf-at-backes` (ID `prj_vFPvhsO4SGPPW1zi91a81BizzzoH`).
- Repositório de origem: `duedubackes-web/enf-at-backes` (GitHub).
- Framework configurado: **Vite**, Node.js **22.x**, build `npm run build`, saída `dist`.
- Variáveis do frontend `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` aplicadas aos ambientes preview e production. A chave publicável não foi commitada.
- Prévia Vercel com autenticação de equipe configurada; não remover essa proteção sem revisão de segurança.

## Prévia validada
- Branch: `feat/enf-backes-core-v04`.
- Commit: `774ca3e1d683193edac7bdabba9ae6d03a95beec`.
- Deployment: `dpl_4atjU4FAdNaCLmk4ima15TEraFjU`.
- Estado confirmado: **READY**.
- URL: https://enf-at-backes-git-feat-enf-backes-core-v04-ebb10.vercel.app
- Vercel Inspector: https://vercel.com/ebb10/enf-at-backes/4atjU4FAdNaCLmk4ima15TEraFjU
- Build Vite e TypeScript concluídos, com saída em `/vercel/output`.
- Não foi realizada promoção dessa prévia para produção.

## Banco
- Supabase ref: `cbofgqeqdmscmhwfcikx`.
- Histórico de migrações aplicadas até `enf_backes_shift_handover_v11`.
- Agentes no chat: Operações, Visitas, Continuidade, Governança e Passagem de Plantão.
- Não criar chave `service_role` no frontend nem enviar credenciais por mensagens.

## Próximas validações obrigatórias
1. Provisionar usuários institucionais fictícios e vincular perfis no Supabase por operador autorizado.
2. Testar autenticação e consultas do chat por identidade/unidade; incluir testes negativos entre unidades.
3. Testar a criação confirmada de tarefas e o resumo gerencial de passagem de plantão.
4. Revisar LGPD, retenção de conversas, backups e política de auditoria.
5. Revisar qualidade, acessibilidade mobile e segurança antes de mesclar PR #1 ou publicar dados reais.

**Atenção:** Vercel READY significa build/deploy tecnicamente concluído. Não significa homologação de segurança ou disponibilização de uma conta operacional para Fernanda.
