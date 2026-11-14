# Checklist de deploy Vercel e homologação — ENF@BACKES

## 1. Acesso e permissões
- [ ] Autorizar à integração Vercel acesso à equipe `ebb10`.
- [ ] Confirmar que o projeto Vercel `enf-at-backes` aponta para `duedubackes-web/enf-at-backes`.
- [ ] Manter a produção vinculada à branch `main`, após aprovação do Pull Request.
- [ ] Utilizar Deployments de *preview* para a branch `feat/enf-backes-core-v04`; não conectar dados clínicos reais no preview.

## 2. Variáveis da aplicação
- [ ] `VITE_SUPABASE_URL`: URL do projeto fornecida pelo gestor.
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY`: chave publicável ativa para o ambiente.
- [ ] **Nunca** colocar a senha do PostgreSQL nem `service_role` em `VITE_*`.
- [ ] Revisar separação Preview/Production e URLs permitidas no Supabase Auth.

## 3. Segurança
- [ ] Garantir que não existe acesso por autoatribuição de papel no frontend.
- [ ] Provisionar usuários fictícios para testar funções e duas unidades isoladas.
- [ ] Testar que uma unidade não lê nem altera pacientes de outra.
- [ ] Validar logs de alterações, auditoria de leitura e retenção com LGPD.
- [ ] Reconciliar migrations v1–v3 com a base remota antes de aplicar migrações por CI.

## 4. Qualidade
- [ ] Aguardar sucesso de TypeScript e build no GitHub Actions.
- [ ] Inspecionar a landing em celular e desktop; testar navegação e modal de login.
- [ ] Revisar acessibilidade WCAG 2.2 AA, especialmente diálogo e foco.
- [ ] Testar adendos, finalização, recuperação e falhas de rede.
- [ ] Não afirmar certificação de segurança ou aderência à OMS sem auditoria verificável.

## 5. Ativação
- [ ] Aprovação formal do responsável técnico de enfermagem.
- [ ] Autorizações institucionais e análise LGPD realizadas.
- [ ] Teste de recuperação de backup e plano de resposta a incidentes.
- [ ] Só após isso admitir dados identificáveis de pacientes.
