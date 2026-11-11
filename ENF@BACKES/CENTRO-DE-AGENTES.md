# Centro de Comando de Enfermagem — Agentes v0.7

## Uso da enfermeira Fernanda
Após provisionamento institucional em Supabase Auth + public.profiles, a profissional autenticada abre o menu **Central de agentes**. Não há autoatribuição de perfis, e não foi criada conta em nome de Fernanda.

## Quatro agentes disponíveis
- Gestão operacional: consulta contagens de tarefas abertas e prazos vencidos.
- Visitas domiciliares: consulta visitas previstas e datas ultrapassadas.
- Continuidade do cuidado: consulta programas ativos e retornos agendados ultrapassados.
- Qualidade e governança: consulta registros de atendimento em rascunho/finalizados.

Os agentes de consulta são **regras determinísticas SQL**, não LLMs generativos. As perguntas podem ser livres, mas a resposta corresponde ao tema do agente selecionado. O agente de Gestão operacional também reconhece **Criar tarefa: descrição**, prepara uma confirmação e só grava após o profissional clicar em **Confirmar e registrar**. A autorização, autoria e histórico são conferidos novamente no banco. Nenhum agente faz diagnósticos, prescrição ou classificação clínica.

## Segurança
- Chat acessível somente a usuários autenticados e com perfil institucional ativo na unidade.
- Conversas privadas por proprietário; RLS em threads e messages.
- RPC pública SECURITY INVOKER delega cálculos à função privada com verificação de auth.uid e unidade.
- Escrita de respostas no banco controlada pelo servidor.
- Limite de 20 consultas/hora por usuário; perguntas de 2 a 600 caracteres.
- As mensagens são armazenadas no banco: **não incluir nomes, CPF ou dados sensíveis de pacientes**.
- Nenhum conteúdo do chat é enviado a fornecedores externos de IA.

## Próximas etapas
Homologar permissões com contas fictícias, criar governança de retenção/exclusão de mensagens, testar acessibilidade e considerar backend de IA generativa com controle de contexto e LGPD após aprovação institucional.

## Migrações
A v7 e v8 já estão aplicadas no Supabase remoto. Os scripts abaixo são registros para controle de versão; não reaplicar no ambiente já migrado.
