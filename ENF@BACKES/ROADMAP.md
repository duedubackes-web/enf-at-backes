# ENF@BACKES — roadmap técnico

## Núcleo inicial

- Supabase Auth: acesso profissional individual.
- PostgreSQL: organizações, unidades, perfis, pacientes, atendimentos, tarefas e visitas.
- Controle RLS por organização, unidade e função.
- Auditoria de alterações sem replicar dados clínicos.
- Interface responsiva com acesso institucional.

## Segurança clínica

- Sem cadastro público de profissionais ou autoatribuição de funções.
- Dados fictícios até a homologação e aprovação institucional.
- Registros finalizados imutáveis; adendos rastreáveis serão evoluídos.
- Indicadores são apoio operacional e não decisão clínica automatizada.

## Próximas validações

1. Build TypeScript e testes em CI.
2. Testes RLS entre duas unidades e perfis com autorização distinta.
3. Provisionamento institucional de perfis.
4. Segurança do paciente, pré-natal, diabetes e hipertensão após homologação clínica.
5. Integração com Vercel e verificação em ambiente de teste.
