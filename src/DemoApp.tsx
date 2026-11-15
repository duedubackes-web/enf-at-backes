import {useState} from 'react';
import {Activity,ArrowLeft,CalendarDays,ClipboardList,HeartPulse,RotateCcw,Users} from 'lucide-react';
import DailyAgenda from './DailyAgenda';
import TasksList from './TasksList';
import VisitsList from './VisitsList';
import './demo.css';
type Tab='overview'|'tasks'|'visits'|'patients';
const menu=[{id:'overview',label:'Painel do dia',icon:Activity},{id:'tasks',label:'Tarefas da equipe',icon:ClipboardList},{id:'visits',label:'Visitas domiciliares',icon:CalendarDays},{id:'patients',label:'Pacientes fictícios',icon:Users}] as const;
const patients=[{id:'demo-a',full_name:'Paciente fictício A',local_code:'DEMO-001'},{id:'demo-b',full_name:'Paciente fictício B',local_code:'DEMO-002'},{id:'demo-c',full_name:'Paciente fictício C',local_code:'DEMO-003'}];
function initialData(){
 const at=(hour:number)=>{const date=new Date();date.setHours(hour,0,0,0);return date.toISOString()};
 return {tasks:[{id:'demo-task-1',title:'Conferir materiais da sala de atendimento',status:'pending',due_at:at(9)},{id:'demo-task-2',title:'Organizar a agenda de visitas da equipe',status:'in_progress',due_at:at(11)},{id:'demo-task-3',title:'Revisar pendências administrativas do plantão',status:'pending',due_at:at(15)},{id:'demo-task-4',title:'Conferir escala de apoio',status:'completed',due_at:at(8)},{id:'demo-task-5',title:'Atualizar checklist de materiais',status:'pending',due_at:null}],visits:[{id:'demo-visit-1',patient_id:'demo-a',scheduled_at:at(10),status:'planned'},{id:'demo-visit-2',patient_id:'demo-b',scheduled_at:at(14),status:'planned'},{id:'demo-visit-3',patient_id:'demo-c',scheduled_at:at(8),status:'completed'}]};
}
export default function DemoApp(){
 const [data,setData]=useState(initialData);
 const [tab,setTab]=useState<Tab>('overview');
 const [selected,setSelected]=useState<string|undefined>();
 const [notice,setNotice]=useState('');
 const navigate=(next:Tab)=>{setTab(next);setSelected(undefined);setNotice('')};
 const openRecord=(next:'tasks'|'visits',id:string)=>{navigate(next);setSelected(id)};
 const reset=()=>{setData(initialData());navigate('overview');setNotice('Demonstração restaurada.')};
 return <div className="demo-page">
  <div className="demo-banner"><span><b>DEMONSTRAÇÃO</b> · Dados fictícios. Alterações apenas nesta tela.</span><a href="/">Voltar ao site <ArrowLeft size={14}/></a></div>
  <div className="shell demo-shell"><aside><div className="brand"><HeartPulse/><div><strong>ENF<span>@</span>BACKES</strong><small>Gestão Inteligente de Enfermagem</small></div></div><nav aria-label="Navegação da demonstração">{menu.map(item=><button type="button" key={item.id} className={tab===item.id?'active':''} aria-current={tab===item.id?'page':undefined} onClick={()=>navigate(item.id)}><item.icon size={19}/>{item.label}</button>)}</nav><div className="account"><strong>Unidade demonstrativa</strong><small>Explore sem uma conta institucional.</small><button type="button" onClick={reset}><RotateCcw size={16}/> Restaurar demonstração</button></div></aside>
  <main><header><div><small>UNIDADE DEMONSTRATIVA</small><h1>{menu.find(item=>item.id===tab)?.label}</h1></div><button type="button" className="ghost" onClick={reset}><RotateCcw size={16}/><span>Restaurar</span></button></header>
   {notice&&<p className="demo-notice" role="status">{notice}</p>}
   {tab==='overview'&&<><section className="demo-welcome"><span>MAIS CLAREZA PARA CUIDAR</span><h2>Seu dia, organizado em um só lugar.</h2><p>Explore a rotina da equipe: acompanhe pendências, consulte visitas e experimente concluir uma tarefa. Tudo aqui é uma simulação.</p><div className="demo-welcome-tags"><span><HeartPulse size={15}/> Continuidade do cuidado</span><span><ClipboardList size={15}/> Organização da equipe</span></div></section><div className="stats demo-stats">{[{label:'Pacientes fictícios',value:patients.length,icon:Users,target:'patients'},{label:'Tarefas abertas',value:data.tasks.filter(t=>['pending','in_progress'].includes(t.status)).length,icon:ClipboardList,target:'tasks'},{label:'Visitas previstas',value:data.visits.filter(v=>v.status==='planned').length,icon:CalendarDays,target:'visits'}].map(item=><button type="button" className="stat" key={item.label} onClick={()=>navigate(item.target as Tab)}><item.icon size={21}/><b>{item.value}</b><span>{item.label}</span></button>)}</div><DailyAgenda tasks={data.tasks} visits={data.visits} onNavigate={openRecord}/></>}
   {tab==='tasks'&&<section className="panel"><h2>Organização do trabalho</h2><TasksList tasks={data.tasks} canEdit busy={false} selectedId={selected} onClearSelection={()=>setSelected(undefined)} onBackToAgenda={()=>navigate('overview')} onSetStatus={(id,status)=>{setData(current=>({...current,tasks:current.tasks.map(task=>task.id===id?{...task,status}:task)}));setNotice('Tarefa atualizada somente nesta demonstração.')}}/></section>}
   {tab==='visits'&&<section className="panel"><h2>Agenda de visitas</h2><VisitsList visits={data.visits} patients={patients} canComplete busy={false} selectedId={selected} onClearSelection={()=>setSelected(undefined)} onBackToAgenda={()=>navigate('overview')} onComplete={id=>{setData(current=>({...current,visits:current.visits.map(visit=>visit.id===id?{...visit,status:'completed'}:visit)}));setNotice('Visita marcada como realizada somente nesta demonstração.')}}/></section>}
   {tab==='patients'&&<section className="panel"><h2>Cadastros de exemplo</h2><p className="notice">Estes identificadores são fictícios e servem apenas para explorar o layout.</p>{patients.map(patient=><div className="item" key={patient.id}><span>{patient.full_name}</span><small>{patient.local_code}</small><em>Exemplo</em></div>)}</section>}
   <footer>Demonstração interativa · Nenhum cadastro ou registro desta tela é enviado ao banco. O acesso profissional continua na área institucional.</footer>
  </main></div>
 </div>;
}
