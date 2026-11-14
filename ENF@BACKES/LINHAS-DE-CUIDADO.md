# Linhas de cuidado — ENF@BACKES

## Recursos implantados

- Programas para pré-natal, diabetes e hipertensão, sem classificação de risco ou diagnóstico automático.
- Histórico de entrada, agenda e conclusão operacional de retornos.
- Vínculos por paciente, organização e unidade com RLS e FK compostas.
- Resumo amostral limitado a 200 registros, identificado na interface.
- Perfil de enfermeiro/coordenador como escritor de acompanhamento; demais perfis autorizados apenas leitura.
- Adendos imutáveis a atendimentos finalizados disponíveis no banco; UI de adendos depende de homologação do fluxo de prontuário.

## Próximas validações

1. Testes de isolamento com autenticação real e duas unidades fictícias.
2. Protocolos assistenciais revisados pela responsabilidade técnica de enfermagem.
3. Auditoria de leitura e trilha de acesso a dados sensíveis.
4. Contagens e paginação no servidor para indicadores operacionais de toda a unidade.
5. Homologação de fluxos de prontuário, consentimento e retenção.
