import {useCallback,useEffect,useMemo,useState,type FormEvent} from 'react';
import {AlertCircle,ArrowRight,CalendarClock,Check,CheckCircle2,ClipboardCheck,ClipboardList,Copy,FileCheck2,Filter,RefreshCw,Search,ShieldCheck,Sparkles,Users} from 'lucide-react';
import {supabase,type Profile} from './supabase';
import {administrativeSummary,isDue,selectTasks,summarizeTasks,type Status,type FilterMode} from './task-priority';
import './task-office.css';

type Task={id:string;title:string;status:Status;due_at:string|null;created_at:string;completed_at:string|null};
type TemplateId='shift_handover'|'weekly_coordination'|'documentation_review';
const templates:{id:TemplateId;title:string;description:string;icon:typeof Users;items:string[]}[]=[
 {id:'shift_handover',title:'Organizar passagem de plantão',description:'Padronize a conferência de pendências do turno.',icon:ClipboardCheck,
  items:['Conferir pendências administrativas do turno','Verificar agenda operacional de visitas e retornos','Revisar tarefas abertas antes da passagem de plantão']},
 {id:'weekly_coordination',title:'Organizar reunião da equipe',description:'Prepare a pauta de coordenação semanal.',icon:Users,
  items:['Revisar distribuição das tarefas da equipe','Conferir agendas e pendências da semana','Consolidar pontos administrativos da reunião de equipe']},
 {id:'documentation_review',title:'Revisar documentação',description:'Crie lembretes de conferência documental.',icon:FileCheck2,
  items:['Conferir registros em rascunho pendentes de revisão','Verificar completude administrativa dos atendimentos','Registrar encaminhamentos para revisão documental']}
];
function formatDate(v:string|null){return v?new Date(v).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'Sem prazo'}
function taskStatus(v:Status){return v==='pending'?'Pendente':v==='in_progress'?'Em andamento':v==='completed'?'Concluída':'Cancelada'}
export default function TaskOffice({profile}:{profile:Profile}){
 const [now,setNow]=useState(Date.now);
 useEffect(()=>{
  const tick=()=>setNow(Date.now());
  const timer=window.setInterval(tick,30000);
  window.addEventListener('focus',tick);
  document.addEventListener('visibilitychange',tick);
  return ()=>{window.clearInterval(timer);window.removeEventListener('focus',tick);document.removeEventListener('visibilitychange',tick)};
 },[]);
 const canWrite=['coordinator','nurse','technician'].includes(profile.role);
 const [tasks,setTasks]=useState<Task[]>([]),[filter,setFilter]=useState<FilterMode>('open');
 const [search,setSearch]=useState(''),[loading,setLoading]=useState(false),[busyId,setBusyId]=useState<string|null>(null);
 const [error,setError]=useState(''),[notice,setNotice]=useState('');
 const [pendingTemplate,setPendingTemplate]=useState<TemplateId|null>(null);
 const [requestId,setRequestId]=useState<string|null>(null);
 const [title,setTitle]=useState(''),[deadline,setDeadline]=useState('');
 const scope={organization_id:profile.organization_id,health_unit_id:profile.health_unit_id};
 const refresh=useCallback(async()=>{
  if(!supabase)return;
  setLoading(true);
  const {data,error:e}=await supabase.from('care_tasks')
   .select('id,title,status,due_at,created_at,completed_at')
   .eq('organization_id',profile.organization_id).eq('health_unit_id',profile.health_unit_id)
   .order('created_at',{ascending:false}).limit(200);
  if(e){setError('Falha ao carregar tarefas autorizadas.');setTasks([]);}
  else{setTasks((data||[]) as Task[]);setError('');}
  setLoading(false);
 },[profile.organization_id,profile.health_unit_id]);
 useEffect(()=>{void refresh()},[refresh]);
 const visible=useMemo(()=>selectTasks(tasks,filter,search,now),[tasks,filter,search,now]);
 const {open,overdue,upcoming,done}=useMemo(()=>summarizeTasks(tasks,now),[tasks,now]);
 const selected=templates.find(t=>t.id===pendingTemplate);
 function openTemplate(id:TemplateId){if(!canWrite)return;setPendingTemplate(id);setRequestId(crypto.randomUUID());setNotice('');setError('');}
 async function confirmTemplate(){
  if(!supabase||!canWrite||!selected||!requestId||busyId)return;
  setBusyId('template');setNotice('');setError('');
  try{
   const {data,error:e}=await supabase.rpc('create_admin_checklist',{p_template:selected.id,p_request_id:requestId});
   if(e)throw e;
   const created=typeof data==='object'&&data!==null&&'created'in data&&data.created===true;
   setNotice(created?'Checklist criado: três tarefas pendentes para conferência.':'Este checklist já tinha sido registrado. Nenhuma tarefa duplicada.');
   setPendingTemplate(null);setRequestId(null);await refresh();
  }catch(e){setError(e instanceof Error?e.message:'Não foi possível criar o checklist.');}
  finally{setBusyId(null);}
 }
 async function createTask(e:FormEvent){
  e.preventDefault();
  if(!supabase||!canWrite||busyId)return;
  if(title.trim().length<3||title.trim().length>200){setError('Informe um título de 3 a 200 caracteres.');return;}
  const due=deadline?new Date(deadline):null;
  if(due&&!Number.isFinite(due.getTime())){setError('O prazo informado é inválido.');return;}
  setBusyId('create');setError('');setNotice('');
  try{
   const {data:user,error:u}=await supabase.auth.getUser();if(u||!user.user)throw new Error('Sua sessão expirou.');
   const {error:e}=await supabase.from('care_tasks').insert({
    ...scope,title:title.trim(),created_by:user.user.id,
    ...(due?{due_at:due.toISOString()}:{})
   });
   if(e)throw e;setTitle('');setDeadline('');setNotice('Tarefa registrada.');await refresh();
  }catch(e){setError(e instanceof Error?e.message:'Falha ao registrar.');}
  finally{setBusyId(null);}
 }
 async function changeStatus(t:Task,next:Status){
  if(!supabase||!canWrite||busyId)return;
  setBusyId(t.id);setError('');setNotice('');
  try{
   const {data,error:e}=await supabase.from('care_tasks')
    .update({status:next,completed_at:next==='completed'?new Date().toISOString():null})
    .eq('id',t.id).eq('organization_id',scope.organization_id).eq('health_unit_id',scope.health_unit_id)
    .select('id');
   if(e)throw e;if(!data||data.length!==1)throw new Error('Tarefa não alterada: verifique as permissões.');
   setNotice('Situação da tarefa atualizada.');await refresh();
  }catch(e){setError(e instanceof Error?e.message:'Falha ao atualizar tarefa.');}
  finally{setBusyId(null);}
 }
 async function copySummary(){
  const summary=administrativeSummary(tasks,Date.now());
  try{await navigator.clipboard.writeText(summary);setNotice('Resumo administrativo copiado, sem nomes de pacientes.');}
  catch{setError('Não foi possível copiar; verifique as permissões do navegador.');}
 }
 return <div className="office">
  <section className="office-hero"><div className="office-hero-icon"><ClipboardCheck size={25}/></div><div>
   <span className="office-kicker">MENOS BUROCRACIA · MAIS TEMPO PARA CUIDAR</span>
   <h2>Central de Trabalho</h2><p>Organize pendências administrativas, gere checklists e conclua tarefas sem perder o contexto da rotina.</p>
   </div><button type="button" onClick={()=>void copySummary()} className="office-copy"><Copy size={16}/> Copiar resumo</button>
  </section>
  <div className="office-mini-stats">
   <div><ClipboardList size={19}/><strong>{open}</strong><span>Abertas*</span></div>
   <div><AlertCircle size={19}/><strong>{overdue}</strong><span>Fora do prazo*</span></div>
   <div><CalendarClock size={19}/><strong>{upcoming}</strong><span>Próximas 24h*</span></div>
   <div><CheckCircle2 size={19}/><strong>{done}</strong><span>Concluídas*</span></div>
  </div>
  <p className="office-caption">* Resumo das últimas 200 tarefas, não uma contagem institucional completa. Próximas 24h considera apenas tarefas abertas entre agora e 24 horas à frente. Consulte o Painel geral para indicadores integrais.</p>
  {error&&<div className="error" role="alert">{error}</div>}
  {notice&&<div className="office-notice" role="status"><CheckCircle2 size={17}/>{notice}</div>}
  {canWrite&&<section className="office-panel"><div className="office-panel-heading"><Sparkles size={20}/><div><h3>Automação administrativa supervisionada</h3><p>Escolha uma rotina. Você verá todas as tarefas antes de confirmar.</p></div></div>
   <div className="office-templates">{templates.map(t=><button key={t.id} type="button" onClick={()=>openTemplate(t.id)} className="office-template" disabled={busyId!==null}>
    <span><t.icon size={22}/></span><strong>{t.title}</strong><small>{t.description}</small><ArrowRight size={17}/></button>)}</div>
  </section>}
  {selected&&<section className="office-confirm" aria-label="Confirmação do checklist"><div className="office-panel-heading"><ShieldCheck size={19}/><div><h3>Confirmar checklist: {selected.title}</h3><p>As três tarefas abaixo serão registradas na sua unidade. Nenhuma ação foi executada ainda.</p></div></div>
   <ol>{selected.items.map(item=><li key={item}>{item}</li>)}</ol><div className="office-confirm-actions">
   <button type="button" onClick={()=>{setPendingTemplate(null);setRequestId(null)}} disabled={busyId!==null} className="office-neutral">Cancelar</button>
   <button type="button" onClick={()=>void confirmTemplate()} disabled={busyId!==null} className="office-primary">Confirmar e criar 3 tarefas</button></div></section>}
  {canWrite&&<section className="office-panel"><div className="office-panel-heading"><CalendarClock size={20}/><div><h3>Nova tarefa rápida</h3><p>Um registro simples, com prazo opcional e autoria institucional.</p></div></div>
   <form className="office-new-form" onSubmit={createTask}><label>Título<input required minLength={3} maxLength={200} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex.: Revisar escala da equipe"/></label>
    <label>Prazo (opcional)<input type="datetime-local" value={deadline} onChange={e=>setDeadline(e.target.value)}/></label>
    <button type="submit" disabled={busyId!==null}>Adicionar tarefa</button>
   </form></section>}
  <section className="office-panel"><div className="office-list-heading"><div><h3>Fila de tarefas</h3><p>Priorização por prazo administrativo, sem classificação clínica.</p></div>
   <button type="button" className="office-refresh" disabled={loading} onClick={()=>void refresh()}><RefreshCw size={16}/> Atualizar</button></div>
   <div className="office-toolbar"><div className="office-filters" role="group" aria-label="Filtrar tarefas">{([['open','Abertas'],['overdue','Atrasadas'],['upcoming','Próximas 24h'],['today','Hoje'],['done','Concluídas'],['all','Todas']] as [FilterMode,string][]).map(([id,label])=><button type="button" key={id} aria-pressed={filter===id} className={filter===id?'active':''} onClick={()=>setFilter(id)}>{label}</button>)}</div>
   <label className="office-search"><Search size={16}/><span className="office-sr-only">Buscar tarefas</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por título"/></label></div>
   {loading&&<p className="office-caption" role="status"><Filter size={14}/> Atualizando tarefas...</p>}
   {!loading&&visible.length===0&&<p className="empty">Nenhuma tarefa encontrada para este filtro.</p>}
   <div className="office-rows">{visible.map(t=><article key={t.id} className="office-task">
    <span className={t.status==='completed'?'office-task-state done':'office-task-state'}>{t.status==='completed'?<Check size={17}/>:<ClipboardList size={17}/>}</span>
    <div><strong>{t.title}</strong><small>{taskStatus(t.status)} · {formatDate(t.due_at)}</small></div>
    {isDue(t,now)&&<span className="office-overdue">Prazo ultrapassado</span>}
    {canWrite&&t.status!=='completed'&&t.status!=='cancelled'&&<button type="button" className="office-action" disabled={busyId!==null} onClick={()=>void changeStatus(t,'completed')}>Concluir</button>}
    {canWrite&&t.status==='completed'&&<button type="button" className="office-action" disabled={busyId!==null} onClick={()=>void changeStatus(t,'pending')}>Reabrir</button>}
   </article>)}</div>
   <p className="office-caption"><ShieldCheck size={15}/> Alterações respeitam as permissões da unidade e são registradas pela auditoria do banco.</p>
  </section>
 </div>;
}
