import {useCallback,useEffect,useState} from 'react';
import {Activity,ArrowRight,CalendarCheck,CalendarClock,ClipboardCheck,ClipboardList,Clock3,FileText,HeartPulse,RefreshCw,ShieldCheck,Stethoscope,Users} from 'lucide-react';
import {supabase,type Profile} from './supabase';
import './operational-overview.css';

type Nav='tasks'|'visits'|'programs'|'encounters'|'assistant';
type Summary={
 patients:number;
 encounters_draft:number;
 encounters_finalized:number;
 tasks_open:number;
 tasks_overdue:number;
 visits_planned:number;
 visits_overdue:number;
 programs_active:number;
 followups_planned:number;
 followups_overdue:number;
 generated_at:string;
};
type MetricKey=Exclude<keyof Summary,'generated_at'>;
const metrics:{key:MetricKey;label:string;icon:typeof Users;target:Nav}[]=[
 {key:'patients',label:'Pacientes ativos',icon:Users,target:'encounters'},
 {key:'tasks_open',label:'Tarefas abertas',icon:ClipboardList,target:'tasks'},
 {key:'visits_planned',label:'Visitas previstas',icon:CalendarCheck,target:'visits'},
 {key:'programs_active',label:'Linhas de cuidado ativas',icon:HeartPulse,target:'programs'}
];
const alerts:{key:MetricKey;label:string;note:string;target:Nav;icon:typeof Clock3}[]=[
 {key:'tasks_overdue',label:'Tarefas fora do prazo',note:'Tarefas ainda abertas com prazo ultrapassado.',target:'tasks',icon:ClipboardList},
 {key:'visits_overdue',label:'Visitas com horário ultrapassado',note:'Agendamentos sem registro de conclusão.',target:'visits',icon:CalendarClock},
 {key:'followups_overdue',label:'Retornos com data ultrapassada',note:'Acompanhamentos com data anterior à consulta.',target:'programs',icon:Clock3},
 {key:'encounters_draft',label:'Atendimentos em rascunho',note:'Registros que ainda não foram finalizados.',target:'encounters',icon:FileText}
];
const count=(value:unknown)=>typeof value==='number' && Number.isSafeInteger(value) && value>=0 ? value : null;
const formatTime=(value:string)=>new Date(value).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});
export default function OperationalOverview({profile,onNavigate}:{profile:Profile;onNavigate:(tab:Nav)=>void}){
 const [summary,setSummary]=useState<Summary|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const load=useCallback(async()=>{
  if(!supabase){setError('Conexão Supabase indisponível.');setLoading(false);return}
  setLoading(true);setError('');
  const {data,error:e}=await supabase.rpc('nursing_operational_overview');
  if(e||!data||typeof data!=='object'){setSummary(null);setError('Não foi possível consultar indicadores autorizados.');}
  else{
   const obj=data as Record<string,unknown>;
   const fields=['patients','encounters_draft','encounters_finalized','tasks_open','tasks_overdue','visits_planned','visits_overdue','programs_active','followups_planned','followups_overdue'];
   const valid=fields.every(key=>count(obj[key])!==null)&&typeof obj.generated_at==='string';
   if(!valid){setSummary(null);setError('O servidor retornou indicadores em formato inválido.');}
   else setSummary(obj as Summary);
  }
  setLoading(false);
 },[]);
 useEffect(()=>{void load();},[load,profile.id,profile.health_unit_id]);
 return <div className="ops">
  <section className="ops-hero">
   <div><span className="ops-kicker"><Activity size={14}/> VISÃO OPERACIONAL DA UNIDADE</span>
    <h2>Bom trabalho, {profile.full_name.split(' ')[0]}.</h2>
    <p>Indicadores calculados no banco para sua unidade autorizada. Sem amostragem limitada e sem expor dados pessoais.</p>
   </div>
   <button type="button" disabled={loading} className="ops-refresh" onClick={()=>void load()}><RefreshCw size={17}/> Atualizar dados</button>
  </section>
  {error&&<div className="error" role="alert">{error}</div>}
  {loading&&<p className="ops-status" role="status">Consultando indicadores da unidade...</p>}
  {summary&&<><div className="ops-stats">
   {metrics.map(m=><button type="button" className="ops-stat" key={m.key} onClick={()=>onNavigate(m.target)}>
    <span className="ops-stat-icon"><m.icon size={23}/></span>
    <strong>{summary[m.key].toLocaleString('pt-BR')}</strong><span>{m.label}</span>
    <ArrowRight className="ops-stat-arrow" size={17}/>
   </button>)}
  </div>
  <div className="ops-columns">
   <section className="ops-panel"><div className="ops-panel-title"><div><span>ATENÇÃO OPERACIONAL</span><h3>Pendências para acompanhamento</h3></div><ClipboardCheck size={22}/></div>
    <div className="ops-alerts">
     {alerts.map(a=><button type="button" key={a.key} onClick={()=>onNavigate(a.target)} className="ops-alert">
      <span className="ops-alert-icon"><a.icon size={19}/></span>
      <span className="ops-alert-copy"><b>{a.label}</b><small>{a.note}</small></span>
      <strong className={summary[a.key]>0?'ops-alert-count active':'ops-alert-count'}>{summary[a.key].toLocaleString('pt-BR')}</strong>
      <ArrowRight size={15}/>
     </button>)}
    </div>
    <p className="ops-disclaimer"><ShieldCheck size={15}/> Prazo ultrapassado é sinal administrativo, não classificação de urgência clínica.</p>
   </section>
   <section className="ops-panel ops-panel-side"><div className="ops-panel-title"><div><span>CONTINUIDADE</span><h3>Acompanhamento integrado</h3></div><Stethoscope size={22}/></div>
    <div className="ops-secondary"><span><CalendarCheck size={18}/> Retornos previstos</span><strong>{summary.followups_planned.toLocaleString('pt-BR')}</strong></div>
    <div className="ops-secondary"><span><FileText size={18}/> Atendimentos finalizados</span><strong>{summary.encounters_finalized.toLocaleString('pt-BR')}</strong></div>
    <div className="ops-shortcuts">
     <button type="button" onClick={()=>onNavigate('programs')}>Linhas de cuidado <ArrowRight size={16}/></button>
     <button type="button" onClick={()=>onNavigate('assistant')}>Abrir Centro de Agentes <ArrowRight size={16}/></button>
    </div>
   </section>
  </div>
  <div className="ops-meta"><ShieldCheck size={16}/> Indicadores operacionais da unidade com acesso autorizado. Última atualização: {formatTime(summary.generated_at)}.</div>
  </>}
 </div>;
}
