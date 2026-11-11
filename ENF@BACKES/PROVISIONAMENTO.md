# Operação segura de usuários e unidades — ENF@BACKES

## Política de provisionamento
Não há inscrição pública de profissionais. A autenticação usa Supabase Auth, mas a autorização ocorre somente após um administrador confiável atribuir `organization_id`, `health_unit_id` e `role` em `public.profiles`.

A aplicação **não** deve disponibilizar formulário de autopromoção de papéis. O primeiro administrador deve ser criado por operador autorizado no painel ou SQL administrativo, com mudança registrada em trilha institucional.

## Roteiro de homologação
1. Criar duas organizações/unidades **fictícias** em ambiente controlado.
2. Criar usuários de teste usando mecanismos de administração do Supabase Auth (sem senha em código).
3. Atribuir perfis no banco por operador confiável.
4. Confirmar: usuário de uma unidade não visualiza pacientes nem acompanhamentos de outra.
5. Confirmar: perfil `viewer` não insere/edita registros assistenciais.
6. Confirmar: perfil `technician` não modifica documentos de acompanhamento longitudinal.
7. Confirmar: enfermeiro/coordenador consegue operar apenas sobre sua unidade.
8. Confirmar: atendimentos finalizados e adendos permanecem imutáveis.
9. Validar processos de revogação de acesso, sessões e auditoria.

## Segurança do ambiente
- Não executar cargas de demonstração em produção real.
- Não expor tabelas do schema `private` à Data API.
- Não embutir senha do Postgres nem secret key em aplicações web.
- Produção requer responsabilidade técnica, políticas de backup, auditoria de consultas, termos de uso e avaliação de riscos.
