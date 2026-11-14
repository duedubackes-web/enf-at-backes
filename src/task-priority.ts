export type Status='pending'|'in_progress'|'completed'|'cancelled';
export type FilterMode='open'|'overdue'|'upcoming'|'today'|'done'|'all';
type PrioritizedTask={title:string;status:Status;due_at:string|null};
const isOpen=(task:PrioritizedTask)=>task.status==='pending'||task.status==='in_progress';
const deadline=(task:PrioritizedTask)=>task.due_at===null?NaN:Date.parse(task.due_at);

export function isDue(task:PrioritizedTask,now:number){
 return isOpen(task)&&deadline(task)<now;
}
export function isUpcoming(task:PrioritizedTask,now:number){
 const due=deadline(task);
 return isOpen(task)&&due>=now&&due<=now+24*60*60*1000;
}
export function summarizeTasks(tasks:readonly PrioritizedTask[],now:number){
 return {
  open:tasks.filter(isOpen).length,
  overdue:tasks.filter(task=>isDue(task,now)).length,
  upcoming:tasks.filter(task=>isUpcoming(task,now)).length,
  withoutDeadline:tasks.filter(task=>isOpen(task)&&!Number.isFinite(deadline(task))).length,
  done:tasks.filter(task=>task.status==='completed').length
 };
}
export function administrativeSummary(tasks:readonly PrioritizedTask[],now:number){
 const counts=summarizeTasks(tasks,now);
 return `ENF@BACKES — conferência administrativa\nTarefas abertas (amostra): ${counts.open}\nCom prazo ultrapassado (amostra): ${counts.overdue}\nVencem nas próximas 24h (amostra): ${counts.upcoming}\nAbertas sem prazo válido (amostra): ${counts.withoutDeadline}\nConcluídas (amostra): ${counts.done}\nGerado em: ${new Date(now).toLocaleString('pt-BR')}\nNúmeros limitados às 200 tarefas mais recentes. Validar nos módulos de origem.\nPrazos administrativos não indicam urgência clínica.`;
}
export function isToday(task:PrioritizedTask,now:number){
 const date=new Date(deadline(task)),today=new Date(now);
 return date.getFullYear()===today.getFullYear()&&date.getMonth()===today.getMonth()&&date.getDate()===today.getDate();
}
export function selectTasks<T extends PrioritizedTask>(tasks:readonly T[],filter:FilterMode,search:string,now:number):T[]{
 const query=search.toLocaleLowerCase('pt-BR');
 return tasks.filter(task=>{
  if(!task.title.toLocaleLowerCase('pt-BR').includes(query))return false;
  if(filter==='open')return isOpen(task);
  if(filter==='overdue')return isDue(task,now);
  if(filter==='upcoming')return isUpcoming(task,now);
  if(filter==='today')return isToday(task,now)&&task.status!=='cancelled';
  if(filter==='done')return task.status==='completed';
  return true;
 }).sort((a,b)=>{
  const at=deadline(a),bt=deadline(b);
  return (Number.isFinite(at)?at:Number.MAX_SAFE_INTEGER)-(Number.isFinite(bt)?bt:Number.MAX_SAFE_INTEGER);
 });
}
