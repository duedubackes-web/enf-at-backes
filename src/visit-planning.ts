export type PlannedVisit={id:string;patient_id:string;scheduled_at:string;status:string};
export type VisitFilter='planned'|'today'|'overdue'|'completed'|'all';
export type VisitPatient={id:string;full_name:string;local_code:string};
const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
export function isVisitToday(visit:PlannedVisit,now:number){
 const date=new Date(visit.scheduled_at),today=new Date(now);
 return date.getFullYear()===today.getFullYear()&&date.getMonth()===today.getMonth()&&date.getDate()===today.getDate();
}
export function isVisitOverdue(visit:PlannedVisit,now:number){return visit.status==='planned'&&Date.parse(visit.scheduled_at)<now}
export function selectVisits<T extends PlannedVisit>(visits:readonly T[],patients:readonly VisitPatient[],filter:VisitFilter,search:string,now:number):T[]{
 const labels=new Map(patients.map(p=>[p.id,normalize(`${p.full_name} ${p.local_code}`)]));
 const query=normalize(search);
 return visits.filter(visit=>{
  if(query&&!(labels.get(visit.patient_id)||'').includes(query))return false;
  if(filter==='planned')return visit.status==='planned';
  if(filter==='today')return visit.status!=='cancelled'&&isVisitToday(visit,now);
  if(filter==='overdue')return isVisitOverdue(visit,now);
  if(filter==='completed')return visit.status==='completed';
  return true;
 }).sort((a,b)=>{
  const at=Date.parse(a.scheduled_at),bt=Date.parse(b.scheduled_at);
  return (Number.isFinite(at)?at:Infinity)-(Number.isFinite(bt)?bt:Infinity)||a.id.localeCompare(b.id);
 });
}
export const visitStatusLabel=(status:string)=>({planned:'Prevista',completed:'Realizada',cancelled:'Cancelada'}[status]||'Estado não reconhecido');
