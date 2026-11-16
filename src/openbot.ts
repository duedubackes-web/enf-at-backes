export type OpenBotDestination='overview'|'tasks'|'visits'|'patients'|'office'|'assistant'|'knowledge';
export type OpenBotAction={destination:OpenBotDestination;label:string};
export type OpenBotSnapshot={openTasks:number;overdueTasks:number;plannedVisits:number;overdueVisits:number};
export type OpenBotReply={text:string;actions:OpenBotAction[]};
export const openBotActions:OpenBotAction[]=[{destination:'overview',label:'Painel do dia'},{destination:'tasks',label:'Tarefas'},{destination:'visits',label:'Visitas'},{destination:'patients',label:'Pacientes'},{destination:'office',label:'Central de trabalho'},{destination:'assistant',label:'Central de agentes'},{destination:'knowledge',label:'Biblioteca'}];
const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
const safeCount=(value:number)=>Number.isSafeInteger(value)&&value>=0?String(value):'indisponível';
export function answerOpenBot(question:string,snapshot:OpenBotSnapshot|null,allowed:readonly OpenBotDestination[]):OpenBotReply{
 const query=normalize(question);
 const reply=(text:string,targets:OpenBotDestination[]):OpenBotReply=>({text,actions:openBotActions.filter(action=>allowed.includes(action.destination)&&targets.includes(action.destination))});
 if(!query||question.length>240)return reply('Escreva uma pergunta de até 240 caracteres sobre navegação, tarefas ou visitas.',['tasks','visits']);
 if(/\b(diagnostico|diagnosticar|prescrever|prescricao|medicamento|dosagem|dose|tratamento|triagem|risco clinico)\b/.test(query))return reply('Posso ajudar com organização administrativa e navegação. Decisões clínicas precisam da avaliação do profissional responsável.',['knowledge']);
 if(/\b(resumo|pendencias|organizar|organizacao|atrasos|situacao)\b/.test(query)){
  if(!snapshot)return reply('Os dados ainda não estão disponíveis para um resumo. Atualize a consulta no painel e tente novamente.',['overview']);
  return reply(`Nos registros carregados: ${safeCount(snapshot.openTasks)} tarefas abertas, ${safeCount(snapshot.overdueTasks)} com prazo ultrapassado; ${safeCount(snapshot.plannedVisits)} visitas previstas, ${safeCount(snapshot.overdueVisits)} com horário ultrapassado. Esses números são uma amostra de até 200 registros por módulo. Prazos são administrativos.`,['tasks','visits','office']);
 }
 const routeMatchers:{pattern:RegExp;destination:OpenBotDestination;text:string}[]=[
  {pattern:/\b(tarefa|tarefas|checklist|checklists)\b/,destination:'tasks',text:'Em Tarefas você pode buscar títulos, filtrar prazos e acompanhar conclusões. Para criar uma tarefa, abra o módulo e use o formulário, conforme suas permissões.'},
  {pattern:/\b(visita|visitas|domiciliar|domiciliares)\b/,destination:'visits',text:'Em Visitas você encontra agendamentos, busca por paciente ou código local e filtros por situação. Para agendar, use o formulário do módulo, conforme suas permissões.'},
  {pattern:/\b(paciente|pacientes|cadastro|cadastros)\b/,destination:'patients',text:'O módulo Pacientes reúne os cadastros autorizados da unidade. Use a área profissional para consultar ou cadastrar, conforme suas permissões.'},
  {pattern:/\b(biblioteca|calculo|calculos|referencia|referencias)\b/,destination:'knowledge',text:'A Biblioteca reúne referências e ferramentas técnicas do projeto. Confira o contexto e as limitações de cada ferramenta.'},
  {pattern:/\b(agente|agentes|plantao)\b/,destination:'assistant',text:'A Central de Agentes reúne os agentes operacionais e a passagem de plantão. As ações seguem as permissões institucionais.'},
  {pattern:/\b(central de trabalho)\b/,destination:'office',text:'A Central de Trabalho reúne a fila operacional e checklists administrativos supervisionados.'},
  {pattern:/\b(painel|inicio|agenda)\b/,destination:'overview',text:'O Painel reúne a agenda do dia e indicadores. Abra uma pendência da agenda para localizar o registro correspondente.'}
 ];
 const match=routeMatchers.find(item=>item.pattern.test(query));
 if(match)return allowed.includes(match.destination)?reply(match.text,[match.destination]):reply('Esse módulo está disponível na área profissional. Nesta demonstração você pode explorar painel, tarefas, visitas e pacientes fictícios.',['overview','tasks','visits']);
 return reply('Posso mostrar onde ficam os módulos e resumir as pendências carregadas. Experimente “resumo das pendências”, “como criar tarefa” ou “abrir visitas”.',['overview','tasks','visits']);
}
