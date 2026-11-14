# Biblioteca Técnica e Calculadoras — ENF@BACKES

Implementação inicial (novembro de 2026) com **catálogo de referências externas verificadas**, e não cópias de todo o acervo da OMS. Os documentos permanecem hospedados nos sites oficiais; novas entradas exigem revisão técnica, licença e revisão periódica.

## Referências principais
- Plano Global de Segurança do Paciente OMS 2021–2030.
- Estado da Enfermagem no Mundo OMS 2025 e extensão das diretrizes de enfermagem até 2030.
- WISN OMS manual 2023 e software 2025.
- Prevenção e Controle de Infecções OMS.
- Princípios OPAS de saúde digital.
- Parecer Cofen 1/2024 e Resolução Cofen 743/2024 (a 543/2017 foi revogada).
- Anvisa — planos de prevenção e segurança do paciente 2026–2030.
- Programa Nacional de Segurança do Paciente do Ministério da Saúde.

Os links, categorias, resumos e anos estão versionados em `src/reference-library.ts`. Cada fonte deve ser lida integralmente antes de transformar recomendações em regras de software.

## Cálculos
`src/technical-calculations.ts` implementa simulações puramente administrativas: taxa de ocupação, horas brutas de equipe, estimativa simplificada de equivalentes por carga e execução de plano.

**Importante:** a estimativa simplificada NÃO implementa o WISN completo e não substitui parâmetros do Parecer Normativo Cofen 1/2024. Nenhum resultado valida escalas, adequação de pessoal, doses, infusão ou risco clínico. A metodologia, tempos, ausências e contexto devem ser avaliados pelo Enfermeiro Responsável Técnico.

## Solicitações
`public.technical_calculation_requests` com RLS por profissional e unidade. A interface permite registrar e consultar pedidos, mas ainda não oferece fila de atendimento ou aprovação por coordenador. Não solicitar dados identificáveis nem históricos clínicos. O processo institucional de resposta depende de desenho posterior.

## Marca OMS
Conforme https://www.who.int/about/policies/publishing/logo, o logotipo e emblema **não podem ser usados sem autorização expressa por escrito**. A landing contém referência textual e link para a fonte, com aviso explícito de ausência de associação ou endosso. Não adicionar logo ou selo OMS sem documentação válida.

## Próximas etapas
- Revisão por responsável técnico das fórmulas e requisitos de dimensionamento.
- Fluxo de análise das solicitações com papéis, auditoria e controle de prazo.
- Curadoria editorial: responsável, revisão, substituição de documentos e versões.
- Testes de autenticação/RLS em duas unidades fictícias.
