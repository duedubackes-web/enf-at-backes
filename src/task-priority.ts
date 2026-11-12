export type Status='pending'|'in_progress'|'completed'|'cancelled';
export type FilterMode='open'|'overdue'|'today'|'done'|'all';
type PrioritizedTask={title:string;status:Status;due_at:string|null};
const isOpen=(task:PrioritizedTask)=>task.status==='pending'||task.status==='in_progress';
const deadline=(task:PrioritizedTask)=>task.due_at===null?NaN:Date.parse(task.due_at);

export function isDue(task:PrioritizedTask,now:number){
 return isOpen(task)&&deadline(task)<now;
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
  if(filter==='today')return isToday(task,now)&&task.status!=='cancelled';
  if(filter==='done')return task.status==='completed';
  return true;
 }).sort((a,b)=>{
  const at=deadline(a),bt=deadline(b);
  return (Number.isFinite(at)?at:Number.MAX_SAFE_INTEGER)-(Number.isFinite(bt)?bt:Number.MAX_SAFE_INTEGER);
 });
}
