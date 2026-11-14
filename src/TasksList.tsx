import {useEffect,useState} from 'react';
import {Check,ClipboardList,Search,Undo2} from 'lucide-react';
import {isDue,selectTasks,summarizeTasks,type FilterMode} from './task-priority';
import RecordFocus from './RecordFocus';
import './worklist.css';
type Task={id:string;title:string;status:string;due_at:string|null};
const filters:{id:FilterMode;label:string}[]=[{id:'open',label:'Abertas'},{id:'today',label:'Hoje'},{id:'overdue',label:'Prazo ultrapassado'},{id:'upcoming',label:'Próximas 24h'},{id:'done',label:'Concluídas'},{id:'all',label:'Todas'}];
const statusLabel=(status:string)=>({pending:'Pendente',in_progress:'Em andamento',completed:'Concluída',cancelled:'Cancelada'}[status]||'Estado não reconhecido');
export default function TasksList({tasks,canEdit,busy,selectedId,onClearSelection,onBackToAgenda,onSetStatus}:{tasks:Task[];canEdit:boolean;busy:boolean;selectedId?:string;onClearSelection:()=>void;onBackToAgenda:()=>void;onSetStatus:(id:string,status:'pending'|'completed')=>void}){
 const [filter,setFilter]=useState<FilterMode>('open');
 const [search,setSearch]=useState('');
 const [now,setNow]=useState(Date.now);
 useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),30000);return()=>window.clearInterval(timer)},[]);
 const counts=summarizeTasks(tasks,now);
 const selected=selectedId?tasks.filter(task=>task.id===selectedId):selectTasks(tasks,filter,search,now);
 const reset=()=>{setFilter('all');setSearch('');onClearSelection()};
 return <div className="worklist">
  <div className="worklist-summary" aria-label="Resumo das tarefas carregadas">{[{label:'Abertas',value:counts.open},{label:'Prazo ultrapassado',value:counts.overdue},{label:'Sem prazo válido',value:counts.withoutDeadline}].map(item=><div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div>
  {selectedId&&<div className="record-context"><span>Tarefa aberta pela agenda do dia.</span><button type="button" onClick={onBackToAgenda}>Voltar à agenda</button><button type="button" onClick={reset}>Ver lista completa</button></div>}
  <label className="worklist-search"><Search size={18}/><span className="worklist-sr-only">Buscar tarefas por título</span><input type="search" placeholder="Buscar tarefa" value={search} onChange={e=>{setSearch(e.target.value);onClearSelection()}}/></label>
  <div className="worklist-filters" role="group" aria-label="Filtrar tarefas">{filters.map(item=><button type="button" key={item.id} aria-pressed={!selectedId&&filter===item.id} onClick={()=>{setFilter(item.id);onClearSelection()}}>{item.label}</button>)}</div>
  <p className="worklist-result" role="status">{selected.length} {selected.length===1?'tarefa encontrada':'tarefas encontradas'} nos registros carregados.</p>
  {selected.length?<ul className="worklist-list">{selected.map(task=>{
   const at=task.due_at?Date.parse(task.due_at):NaN;
   return <li key={task.id}><RecordFocus active={selectedId===task.id}><div className="worklist-record-row"><span className="worklist-calendar"><ClipboardList size={21}/></span><div className="worklist-detail"><strong>{task.title}</strong><small>{Number.isFinite(at)?<>Prazo: <time dateTime={new Date(at).toISOString()}>{new Date(at).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}</time></>:task.due_at?'Prazo indisponível':'Sem prazo definido'}</small></div><div className="worklist-state"><span>{statusLabel(task.status)}</span>{isDue(task,now)&&<small>Prazo ultrapassado</small>}</div>{canEdit&&['pending','in_progress','completed'].includes(task.status)&&<button type="button" className="worklist-complete" disabled={busy} aria-label={`${task.status==='completed'?'Reabrir':'Concluir'} tarefa: ${task.title}`} onClick={()=>onSetStatus(task.id,task.status==='completed'?'pending':'completed')}>{task.status==='completed'?<Undo2 size={17}/>:<Check size={17}/>} {task.status==='completed'?'Reabrir':'Concluir'}</button>}</div></RecordFocus></li>;
  })}</ul>:<div className="worklist-empty"><ClipboardList size={26}/><p>{selectedId?'Esta tarefa não está mais entre os registros carregados. Atualize os dados ou abra a lista completa.':tasks.length?'Nenhuma tarefa corresponde à busca e ao filtro.':'Nenhuma tarefa carregada.'}</p><button type="button" onClick={reset}>Ver todas as tarefas carregadas</button></div>}
  <p className="worklist-note">Resumo e filtros consideram as 200 tarefas mais recentes carregadas. Hoje segue o calendário deste dispositivo; próximas 24h é uma janela a partir do horário atual. Prazos são administrativos.</p>
 </div>;
}
