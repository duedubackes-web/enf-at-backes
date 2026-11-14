export type AgendaTask = {id:string;title:string;status:string;due_at:string|null};
export type AgendaVisit = {id:string;patient_id:string;status:string;scheduled_at:string};
export type AgendaEntry = {id:string;kind:'tasks'|'visits';title:string;at:number;overdue:boolean};
export function dailyAgenda(tasks:AgendaTask[], visits:AgendaVisit[], now:number):AgendaEntry[] {
 const today=new Date(now);
 const start=new Date(today.getFullYear(),today.getMonth(),today.getDate()).getTime();
 const end=new Date(today.getFullYear(),today.getMonth(),today.getDate()+1).getTime();
 const entries:AgendaEntry[]=[];
 for(const task of tasks){
  const at=task.due_at?Date.parse(task.due_at):NaN;
  if(!['pending','in_progress'].includes(task.status)||!Number.isFinite(at)||at<start||at>=end)continue;
  entries.push({id:task.id,kind:'tasks',title:task.title,at,overdue:at<now});
 }
 for(const visit of visits){
  const at=Date.parse(visit.scheduled_at);
  if(visit.status!=='planned'||!Number.isFinite(at)||at<start||at>=end)continue;
  entries.push({id:visit.id,kind:'visits',title:'Visita domiciliar',at,overdue:at<now});
 }
 return entries.sort((a,b)=>a.at-b.at||a.kind.localeCompare(b.kind)||a.id.localeCompare(b.id));
}
