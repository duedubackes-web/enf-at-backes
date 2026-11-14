import React,{useCallback,useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Activity,HeartPulse,Users,ClipboardList,CalendarDays,FileText,ShieldCheck,LogOut,RefreshCw,Layers3,BotMessageSquare,ClipboardCheck,BookOpen,Menu,House,MoreHorizontal,X,Smartphone} from 'lucide-react';
import {supabase,type Profile,type Patient,type Task,type Visit,type Encounter} from './supabase';
import Landing from './Landing';
import CarePrograms from './CarePrograms';
import NursingCommand from './NursingCommand';
import OperationalOverview from './OperationalOverview';
import TaskOffice from './TaskOffice';
import KnowledgeCenter from './KnowledgeCenter';
import InstallApp from './InstallApp';
import './pwa';
import './platform.css';
import './style.css';
import './landing.css';

type Tab='overview'|'patients'|'tasks'|'visits'|'encounters'|'programs'|'assistant'|'office'|'knowledge'|'security';
type IconType=typeof Users;
const menu:{id:Tab;label:string;icon:IconType}[]=[
{id:'overview',label:'Painel geral',icon:Activity},{id:'patients',label:'Pacientes',icon:Users},
{id:'tasks',label:'Tarefas',icon:ClipboardList},{id:'visits',label:'Visitas',icon:CalendarDays},
{id:'encounters',label:'Atendimentos',icon:FileText},{id:'programs',label:'Linhas de cuidado',icon:Layers3},{id:'assistant',label:'Central de agentes',icon:BotMessageSquare},{id:'office',label:'Central de trabalho',icon:ClipboardCheck},{id:'knowledge',label:'Biblioteca e cálculos',icon:BookOpen},{id:'security',label:'Governança',icon:ShieldCheck}];
function App(){
const [user,setUser]=useState<string|null>(null),[profile,setProfile]=useState<Profile|null>(null);
const [tab,setTab]=useState<Tab>('overview'),[error,setError]=useState(''),[busy,setBusy]=useState(false);
const [mobileMenu,setMobileMenu]=useState(false);
const mobileDialog=useRef<HTMLDialogElement>(null);
const navigate=(next:Tab)=>{setTab(next);setError('');setMobileMenu(false)};
const [patients,setPatients]=useState<Patient[]>([]),[tasks,setTasks]=useState<Task[]>([]);
const [visits,setVisits]=useState<Visit[]>([]),[encounters,setEncounters]=useState<Encounter[]>([]);

const [patientName,setPatientName]=useState(''),[patientCode,setPatientCode]=useState('');
const [taskTitle,setTaskTitle]=useState(''),[selectedPatient,setSelectedPatient]=useState('');
const [visitWhen,setVisitWhen]=useState(''),[notes,setNotes]=useState('');
useEffect(()=>{const dialog=mobileDialog.current;if(!dialog)return;if(mobileMenu&&!dialog.open)dialog.showModal();if(!mobileMenu&&dialog.open)dialog.close();},[mobileMenu]);
const canClinical=profile?.role='nurse'||profile?.role==='coordinator';
const canTask=canClinical||profile?.role==='technician';
const refresh=useCallback(async(uid:string)=>{
 if(!supabase)return;
 const p=await supabase.from('profiles').select('id,organization_id,health_unit_id,full_name,role,active').eq('id',uid).maybeSingle();
 if(p.error){setError('Falha ao carregar autorização institucional.');return;}
 if(!p.data||!p.data.active){setProfile(null);return;}
 setProfile(p.data as Profile);
 const [a,b,c,d]=await Promise.all([
 supabase.from('patients').select('id,local_code,full_name,birth_date,status').order('full_name').limit(200),
 supabase.from('care_tasks').select('id,title,status,due_at').order('created_at',{ascending:false}).limit(200),
 supabase.from('home_visits').select('id,patient_id,scheduled_at,status').order('scheduled_at').limit(200),
 supabase.from('encounters').select('id,patient_id,occurred_at,status').order('occurred_at',{ascending:false}).limit(200)]);
 if([a,b,c,d].some(x=>x.error)){setError('Erro ao consultar dados autorizados.');return;}
 setPatients((a.data||[]) as Patient[]);setTasks((b.data||[]) as Task[]);
 setVisits((c.data||[]) as Visit[]);setEncounters((d.data||[]) as Encounter[]);
},[]);
useEffect(()=>{if(!supabase)return;
 void supabase.auth.getUser().then(({data})=>{const id=data.user?.id||null;setUser(id);if(id)void refresh(id)});
 const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
 const id=session?.user?.id||null;setUser(id);
 if(!id){setProfile(null);setPatients([]);setTasks([]);setVisits([]);setEncounters([])}
 else window.setTimeout(()=>void refresh(id),0);
 });return()=>subscription.unsubscribe();
},[refresh]);
async function save(table:'patients'|'care_tasks'|'home_visits'|'encounters',data:Record<string,unknown>,clear:()=>void){
 if(!supabase||!profile||!user)return;setBusy(true);setError('');
 try{
 const {error:e}=await supabase.from(table).insert({organization_id:profile.organization_id,health_unit_id:profile.health_unit_id,...data});
 if(e)throw e;clear();await refresh(user);
 }catch(e){setError(e instanceof Error?e.message:'Falha ao registrar dados.')}finally{setBusy(false)}
}
async function update(table:'care_tasks'|'home_visits'|'encounters',id:string,fields:Record<string,unknown>){
 if(!supabase||!profile||!user)return;setBusy(true);setError('');
 try{const {error:e}=await supabase.from(table).update(fields).eq('id',id).eq('organization_id',profile.organization_id).eq('health_unit_id',profile.health_unit_id);
 if(e)throw e;await refresh(user);
 }catch(e){setError(e instanceof Error?e.message:'Falha ao atualizar.')}finally{setBusy(false)}
}
function patientLabel(id:string){return patients.find(p=>p.id===id)?.full_name||'Paciente da unidade'}
if(!user)return <Landing/>;
if(!profile)return <div className="login"><section className="auth"><ShieldCheck size={38}/><h2>Aguardando vínculo institucional</h2><p>Sua conta existe, mas não tem perfil ativo atribuído por administrador.</p><button onClick={()=>void supabase?.auth.signOut()}>Sair</button></section></div>;
return <div className="shell"><div className="mobile-topbar"><span className="mobile-brand"><HeartPulse size={20}/> ENF<span>@</span>BACKES</span><div className="mobile-top-actions"><InstallApp compact/><button type="button" title="Sair" aria-label="Sair da conta" onClick={()=>void supabase?.auth.signOut()}><LogOut size={19}/></button></div></div><aside><div className="brand"><HeartPulse/><div><strong>ENF<span>@</span>BACKES</strong><small>Gestão Inteligente de Enfermagem</small></div></div><nav>{menu.map(x=><button key={x.id} className={tab===x.id?'active':''} onClick={()=>navigate(x.id)}><x.icon size={18}/>{x.label}</button>)}</nav><div className="account"><strong>{profile.full_name}</strong><small>{profile.role}</small><button onClick={()=>void supabase?.auth.signOut()}><LogOut size={16}/> Sair</button></div></aside>
<main><header><div><small>GESTÃO ASSISTENCIAL</small><h1>{menu.find(x=>x.id===tab)?.label}</h1></div><button className="ghost" onClick={()=>void refresh(user)}><RefreshCw size={17}/> Atualizar</button></header>
{error&&<div role="alert" className="error">{error}</div>}
{tab==='overview'&&<OperationalOverview profile={profile} onNavigate={navigate} />}
{tab==='patients'&&<section className="panel"><h2>Cadastro de pacientes</h2>{canClinical&&<form className="rowform" onSubmit={e=>{e.preventDefault();void save('patients',{full_name:patientName.trim(),local_code:patientCode.trim(),created_by:user},()=>{setPatientName('');setPatientCode('')})}}><input aria-label="Nome completo" placeholder="Nome completo" minLength={2} maxLength={180} required value={patientName} onChange={e=>setPatientName(e.target.value)}/><input aria-label="Código local" placeholder="Código local (não usar CPF)" minLength={2} maxLength={80} required value={patientCode} onChange={e=>setPatientCode(e.target.value)}/><button disabled={busy}>Cadastrar</button></form>}{patients.map(p=><div className="item" key={p.id}><span>{p.full_name} <small>• {p.local_code}</small></span><em>{p.status}</em></div>)}{!patients.length&&<p className="empty">Nenhum paciente cadastrado.</p>}</section>}
{tab==='tasks'&&<section className="panel"><h2>Tarefas da equipe</h2>{canTask&&<form className="rowform" onSubmit={e=>{e.preventDefault();void save('care_tasks',{title:taskTitle.trim(),created_by:user},()=>setTaskTitle(''))}}><input aria-label="Tarefa" placeholder="Nova tarefa" minLength={3} maxLength={200} required value={taskTitle} onChange={e=>setTaskTitle(e.target.value)}/><button disabled={busy}>Adicionar</button></form>}{tasks.map(t=><div className="item" key={t.id}><span>{t.title}</span><em>{t.status}</em>{canTask&&<button className="ghost" disabled={busy} onClick={()=>void update('care_tasks',t.id,{status:t.status==='completed'?'pending':'completed',completed_at:t.status==='completed'?null:new Date().toISOString()})}>{t.status==='completed'?'Reabrir':'Concluir'}</button>}</div>)}{!tasks.length&&<p className="empty">Sem tarefas.</p>}</section>}
{tab==='visits'&&<section className="panel"><h2>Visitas domiciliares</h2>{canTask&&<form className="rowform" onSubmit={e=>{e.preventDefault();const dt=new Date(visitWhen);if(!Number.isFinite(dt.valueOf())||dt.getTime()<Date.now()){setError('Informe uma data futura válida.');return;}void save('home_visits',{patient_id:selectedPatient,created_by:user,scheduled_at:dt.toISOString()},()=>{setVisitWhen('');setSelectedPatient('')})}}><select required aria-label="Paciente" value={selectedPatient} onChange={e=>setSelectedPatient(e.target.value)}><option value="">Selecionar paciente</option>{patients.map(p=><option key={p.id} value={p.id}>{p.full_name}</option>)}</select><input required aria-label="Data e hora" type="datetime-local" value={visitWhen} onChange={e=>setVisitWhen(e.target.value)}/><button disabled={busy||!patients.length}>Agendar</button></form>}{visits.map(v=><div className="item" key={v.id}><span>{patientLabel(v.patient_id)} · {new Date(v.scheduled_at).toLocaleString('pt-BR')}</span><em>{v.status}</em>{canTask&&v.status==='planned'&&<button className="ghost" disabled={busy} onClick={()=>void update('home_visits',v.id,{status:'completed',completed_at:new Date().toISOString()})}>Realizada</button>}</div>)}{!visits.length&&<p className="empty">Sem visitas agendadas.</p>}</section>}
{tab==='encounters'&&<section className="panel"><h2>Atendimentos de enfermagem</h2>{canClinical&&<form className="vertical" onSubmit={e=>{e.preventDefault();void save('encounters',{patient_id:selectedPatient,author_id:user,notes:notes.trim(),status:'draft',encounter_type:'nursing'},()=>{setNotes('');setSelectedPatient('')})}}><select required aria-label="Paciente" value={selectedPatient} onChange={e=>setSelectedPatient(e.target.value)}><option value="">Selecionar paciente</option>{patients.map(p=><option key={p.id} value={p.id}>{p.full_name}</option>)}</select><textarea aria-label="Anotação" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Registro descritivo (rascunho), sem diagnóstico automatizado" maxLength={5000} rows={4}/><button disabled={busy||!patients.length}>Salvar rascunho</button></form>}{encounters.map(e=><div className="item" key={e.id}><span>{patientLabel(e.patient_id)} · {new Date(e.occurred_at).toLocaleString('pt-BR')}</span><em>{e.status}</em>{canClinical&&e.status==='draft'&&<button className="ghost" disabled={busy} onClick={()=>{if(window.confirm('Finalizar? O atendimento ficará imutável.'))void update('encounters',e.id,{status:'finalized'})}}>Finalizar</button>}</div>)}{!encounters.length&&<p className="empty">Sem atendimentos registrados.</p>}<p className="notice">Adendos rastreáveis estão disponíveis no banco. O formulário de adendos e a homologação documental seguem em desenvolvimento.</p></section>}
{tab==='programs'&&<CarePrograms patients={patients} profile={profile} canClinical={canClinical} />}
{tab==='assistant'&&<NursingCommand profile={profile} />}
{tab==='office'&&<TaskOffice profile={profile} />}
{tab==='knowledge'&&<KnowledgeCenter profile={profile} />}
{tab==='security'&&<section className="panel"><h2>Segurança e governança</h2><p>Profissional: {profile.full_name} · perfil: {profile.role}</p><p>O banco aplica isolamento por unidade e políticas RLS. Usuários não podem atribuir a si próprios um perfil.</p><p>Auditoria de alterações no schema privado; auditoria de leituras, backups e testes de permissões requerem validação institucional.</p><p>Diretrizes OMS/OPAS orientam o roadmap, sem recomendações clínicas autônomas.</p></section>}
<footer>MVP técnico • Não utilizar com informações reais de pacientes antes da homologação institucional.</footer></main>
<nav className="mobile-bottom-nav" aria-label="Acesso rápido do aplicativo">{([{id:'overview',icon:House,label:'Painel'},{id:'tasks',icon:ClipboardList,label:'Tarefas'},{id:'assistant',icon:BotMessageSquare,label:'Agentes'},{id:'knowledge',icon:BookOpen,label:'Biblioteca'}] as const).map(x=><button key={x.id} type="button" aria-current={tab===x.id?'page':undefined} onClick={()=>navigate(x.id)}><x.icon size={21}/><span>{x.label}</span></button>)}<button type="button" onClick={()=>setMobileMenu(true)} aria-label="Abrir menu completo"><MoreHorizontal size={22}/><span>Mais</span></button></nav>
<dialog ref={mobileDialog} className="mobile-drawer" aria-label="Menu completo do ENF@BACKES" onClose={()=>setMobileMenu(false)}><div className="mobile-drawer-head"><b>Menu profissional</b><button type="button" aria-label="Fechar menu" onClick={()=>setMobileMenu(false)}><X size={21}/></button></div><div className="mobile-drawer-links">{menu.map(x=><button type="button" key={x.id} onClick={()=>navigate(x.id)} aria-current={tab===x.id?'page':undefined}><x.icon size={19}/>{x.label}</button>)}</div><div className="mobile-drawer-account"><span>{profile.full_name}</span><button type="button" onClick={()=>void supabase?.auth.signOut()}><LogOut size={18}/> Sair da conta</button></div></dialog>
</div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
