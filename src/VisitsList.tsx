import {useEffect,useState} from 'react';
import {CalendarDays,Check,Search} from 'lucide-react';
import {isVisitOverdue,isVisitToday,selectVisits,visitStatusLabel,type PlannedVisit,type VisitPatient,type VisitFilter} from './visit-planning';
import './worklist.css';
import RecordFocus from './RecordFocus';
const filters:{id:VisitFilter;label:string}[]=[{id:'planned',label:'Previstas'},{id:'today',label:'Hoje'},{id:'overdue',label:'Horário ultrapassado'},{id:'completed',label:'Realizadas'},{id:'all',label:'Todas'}];
export default function VisitsList({visits,patients,canComplete,busy,onComplete,selectedId,onClearSelection,onBackToAgenda}:{selectedId?:string;onClearSelection?:()=>void;onBackToAgenda?:()=>void;visits:PlannedVisit[];patients:VisitPatient[];canComplete:boolean;busy:boolean;onComplete:(id:string)=>void}){
 const [filter,setFilter]=useState<VisitFilter>('planned');
 const [search,setSearch]=useState('');
 const [now,setNow]=useState(Date.now);
 useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),30000);return()=>window.clearInterval(timer)},[]);
 const selected=selectedId?visits.filter(visit=>visit.id===selectedId):selectVisits(visits,patients,filter,search,now);
 const patientMap=new Map(patients.map(p=>[p.id,p]));
 const counts=[{label:'Previstas',value:visits.filter(v=>v.status==='planned').length},{label:'Hoje (exceto canceladas)',value:visits.filter(v=>v.status!=='cancelled'&&isVisitToday(v,now)).length},{label:'Horário ultrapassado',value:visits.filter(v=>isVisitOverdue(v,now)).length}];
 return <div className="worklist">
  <div className="worklist-summary" aria-label="Resumo das visitas carregadas">{counts.map(item=><div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div>
  {selectedId&&<div className="record-context"><span>Visita aberta pela agenda do dia.</span><button type="button" onClick={onBackToAgenda}>Voltar à agenda</button><button type="button" onClick={()=>{setFilter('all');setSearch('');onClearSelection?.()}}>Ver lista completa</button></div>}
  <label className="worklist-search"><Search size={18}/><span className="worklist-sr-only">Buscar visitas por paciente ou código local</span><input type="search" placeholder="Buscar paciente ou código local" value={search} onChange={e=>{setSearch(e.target.value);onClearSelection?.()}}/></label>
  <div className="worklist-filters" role="group" aria-label="Filtrar visitas">{filters.map(item=><button type="button" key={item.id} aria-pressed={!selectedId&&filter===item.id} onClick={()=>{setFilter(item.id);onClearSelection?.()}}>{item.label}</button>)}</div>
  <p className="worklist-result" role="status">{selected.length} {selected.length===1?'visita encontrada':'visitas encontradas'} nos registros carregados.</p>
  {selected.length?<ul className="worklist-list">{selected.map(visit=>{
   const patient=patientMap.get(visit.patient_id),date=new Date(visit.scheduled_at),valid=Number.isFinite(date.getTime());
   return <li key={visit.id}><RecordFocus active={selectedId===visit.id}><div className="worklist-record-row"><span className="worklist-calendar"><CalendarDays size={21}/></span><div className="worklist-detail"><strong>{patient?.full_name||'Paciente da unidade'}</strong>{patient&&<small>Código local: {patient.local_code}</small>}{valid?<time dateTime={date.toISOString()}>{date.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}</time>:<small>Data indisponível</small>}</div><div className="worklist-state"><span>{visitStatusLabel(visit.status)}</span>{isVisitOverdue(visit,now)&&<small>Horário ultrapassado</small>}</div>{canComplete&&visit.status==='planned'&&<button type="button" className="worklist-complete" disabled={busy} aria-label={`Marcar visita de ${patient?.full_name||'paciente da unidade'} em ${valid?date.toLocaleString('pt-BR'):'data indisponível'} como realizada`} onClick={()=>onComplete(visit.id)}><Check size={17}/> Marcar realizada</button>}</div></RecordFocus></li>;
  })}</ul>:<div className="worklist-empty"><CalendarDays size={26}/><p>{selectedId?'Esta visita não está mais entre os registros carregados. Atualize os dados ou abra a lista completa.':visits.length?'Nenhuma visita corresponde à busca e ao filtro.':canComplete?'Nenhuma visita carregada. Use o formulário acima para agendar.':'Nenhuma visita carregada.'}</p>{(filter!=='all'||search)&&<button type="button" onClick={()=>{setFilter('all');setSearch('');onClearSelection?.()}}>Ver todas as visitas carregadas</button>}</div>}
  <p className="worklist-note">Resumo e filtros consideram até 200 visitas carregadas, ordenadas pela data do agendamento. Busca por paciente considera os cadastros carregados. Datas no horário deste dispositivo; horário ultrapassado é um sinal administrativo.</p>
 </div>;
}
