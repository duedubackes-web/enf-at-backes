import {useEffect,useState} from 'react';
import {ArrowRight,CalendarDays,ClipboardList} from 'lucide-react';
import {dailyAgenda,type AgendaTask,type AgendaVisit} from './daily-agenda';
import './daily-agenda.css';

export default function DailyAgenda({tasks,visits,onNavigate}:{tasks:AgendaTask[];visits:AgendaVisit[];onNavigate:(tab:'tasks'|'visits')=>void}){
 const [now,setNow]=useState(Date.now);
 const [filter,setFilter]=useState<'all'|'tasks'|'visits'>('all');
 useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),30000);return()=>window.clearInterval(timer)},[]);
 const entries=dailyAgenda(tasks,visits,now);
 const visible=entries.filter(entry=>filter==='all'||entry.kind===filter);
 return <section className="daily-agenda" aria-labelledby="daily-agenda-title">
  <div className="daily-agenda-heading"><div><span>ORGANIZAÇÃO DO DIA</span><h2 id="daily-agenda-title">Sua agenda de hoje</h2><p>{new Date(now).toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})} · horário deste dispositivo</p></div><CalendarDays size={26}/></div>
  <div className="daily-agenda-filters" role="group" aria-label="Filtrar agenda">{([{id:'all',label:'Tudo'},{id:'tasks',label:'Tarefas'},{id:'visits',label:'Visitas'}] as const).map(item=><button type="button" key={item.id} aria-pressed={filter===item.id} onClick={()=>setFilter(item.id)}>{item.label}</button>)}</div>
  <p className="daily-agenda-count" role="status">{visible.length} {visible.length===1?'pendência de hoje':'pendências de hoje'} nos registros carregados.</p>
  {visible.length?<ol className="daily-agenda-list">{visible.map(entry=><li key={`${entry.kind}-${entry.id}`}>
   <time dateTime={new Date(entry.at).toISOString()}>{new Date(entry.at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</time>
   <span className="daily-agenda-icon">{entry.kind==='tasks'?<ClipboardList size={18}/>:<CalendarDays size={18}/>}</span>
   <div><strong>{entry.title}</strong><small>{entry.kind==='tasks'?'Tarefa':'Visita'} · {entry.overdue?'Horário ultrapassado':'Prevista'}</small></div>
   <button type="button" aria-label={`Abrir ${entry.kind==='tasks'?'tarefas':'visitas'}: ${entry.title}`} onClick={()=>onNavigate(entry.kind)}><span>Abrir</span><ArrowRight size={17}/></button>
  </li>)}</ol>:<p className="daily-agenda-empty">Nenhuma pendência de hoje nesta seleção. Consulte os módulos para outros dias e itens sem prazo.</p>}
  <p className="daily-agenda-note">Exibe tarefas abertas e visitas previstas para hoje, entre até 200 registros carregados de cada módulo. Horário ultrapassado é um sinal administrativo.</p>
 </section>;
}
