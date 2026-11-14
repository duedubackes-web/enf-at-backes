import {useCallback,useEffect,useRef,useState,type FormEvent} from 'react';
import {Activity,ArrowRight,BotMessageSquare,CalendarDays,CheckCircle2,ClipboardList,HeartPulse,LockKeyhole,MessageCircle,Plus,RefreshCw,Send,ShieldCheck,UserRound,Workflow,ClipboardCheck} from 'lucide-react';
import {supabase,type Profile} from './supabase';
import './nursing-command.css';
type Agent='coordinator'|'visits'|'continuity'|'governance'|'handover';
type Thread={id:string;title:string;created_at:string};
type Msg={id:string;agent:Agent;message_role:'question'|'assistant';body:string;created_at:string};
const agents=[
{id:'coordinator' as Agent,label:'Gestão operacional',subtitle:'Tarefas e pendências',icon:ClipboardList,prompt:'Como estão as tarefas da unidade?',about:'Tarefas abertas e prazos operacionais.'},
{id:'visits' as Agent,label:'Visitas domiciliares',subtitle:'Agenda e território',icon:CalendarDays,prompt:'Qual é a situação das visitas domiciliares?',about:'Visitas previstas e horários ultrapassados.'},
{id:'continuity' as Agent,label:'Continuidade do cuidado',subtitle:'Linhas de cuidado',icon:HeartPulse,prompt:'Como estão os acompanhamentos e retornos?',about:'Acompanhamentos ativos e retornos pendentes.'},
{id:'governance' as Agent,label:'Qualidade e governança',subtitle:'Rastreabilidade',icon:ShieldCheck,prompt:'Qual é a situação dos registros de atendimento?',about:'Rascunhos e atendimentos finalizados.'},
{id:'handover' as Agent,label:'Passagem de plantão',subtitle:'Resumo gerencial',icon:ClipboardCheck,prompt:'Gerar resumo gerencial de passagem de plantão',about:'Resumo de tarefas, visitas, retornos e rascunhos, sem dados de pacientes.'}
];
const formatDate=(v:string)=>new Date(v).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});
export default function NursingCommand({profile}:{profile:Profile}){
 const [agent,setAgent]=useState<Agent>('coordinator'),[thread,setThread]=useState<string|null>(null);
 const [threads,setThreads]=useState<Thread[]>([]),[messages,setMessages]=useState<Msg[]>([]);
 const [input,setInput]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [proposal,setProposal]=useState<string|null>(null);
 const endRef=useRef<HTMLDivElement>(null),agentDef=agents.find(a=>a.id===agent)!;
 const loadThreads=useCallback(async()=>{
  if(!supabase)return;
  const {data,error:e}=await supabase.from('assistant_threads').select('id,title,created_at')
   .eq('owner_id',profile.id).eq('organization_id',profile.organization_id)
   .eq('health_unit_id',profile.health_unit_id).order('created_at',{ascending:false}).limit(30);
  if(e)throw e;setThreads((data||[]) as Thread[]);
 },[profile.id,profile.organization_id,profile.health_unit_id]);
 const loadMessages=useCallback(async(id:string)=>{
  if(!supabase)return;
  const {data,error:e}=await supabase.from('assistant_messages')
   .select('id,agent,message_role,body,created_at')
   .eq('thread_id',id).eq('owner_id',profile.id)
   .order('created_at',{ascending:true}).limit(100);
  if(e)throw e;setMessages((data||[]) as Msg[]);
 },[profile.id]);
 useEffect(()=>{void loadThreads().catch(()=>setError('Erro ao carregar conversas.'));},[loadThreads]);
 useEffect(()=>{if(!thread){setMessages([]);return;}void loadMessages(thread).catch(()=>setError('Erro ao carregar mensagens.'));},[thread,loadMessages]);
 useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth',block:'end'});},[messages]);
 async function send(value:string){
  const question=value.trim();if(!supabase||busy||question.length<2)return;
  const match=agent==='coordinator'&&question.match(/^(?:criar|adicionar|cadastrar)\s+tarefa\s*[:\-]?\s*(.+)$/i);
  if(match){const title=match[1].trim();if(title.length<3||title.length>200){setError('Título de tarefa entre 3 e 200 caracteres.');return;}setProposal(title);setInput('');setError('');return;}
  if(question.length>600){setError('Máximo de 600 caracteres por mensagem.');return;}
  setError('');setBusy(true);
  try{
   let id=thread;
   if(!id){
    const {data,error:e}=await supabase.from('assistant_threads').insert({
     organization_id:profile.organization_id,health_unit_id:profile.health_unit_id,
     owner_id:profile.id,title:'Conversa de trabalho'
    }).select('id').single();
    if(e)throw e;id=data.id as string;setThread(id);await loadThreads();
   }
   const {error:e}=agent==='handover'
    ? await supabase.rpc('agent_shift_handover',{p_thread_id:id})
    : await supabase.rpc('ask_nursing_agent',{p_thread_id:id,p_agent:agent,p_question:question});
   if(e)throw e;
   if(!id)throw Error('Conversa indisponível.');
   setInput('');await loadMessages(id);
  }catch(e){setError(e instanceof Error?e.message:'Falha ao consultar agente.');}
  finally{setBusy(false)}
 }
 async function confirmTask(){
  if(!proposal||!supabase||busy)return;
  if(!['coordinator','nurse','technician'].includes(profile.role)){setError('Seu perfil não pode cadastrar tarefas.');return;}
  setBusy(true);setError('');
  try{
   let id=thread;
   if(!id){const {data,error:e}=await supabase.from('assistant_threads').insert({organization_id:profile.organization_id,health_unit_id:profile.health_unit_id,owner_id:profile.id,title:'Conversa de trabalho'}).select('id').single();if(e)throw e;id=data.id as string;setThread(id);await loadThreads();}
   if(!id)throw Error('Conversa indisponível.');
   const {error:e}=await supabase.rpc('agent_create_task',{p_thread_id:id,p_title:proposal});if(e)throw e;
   setProposal(null);await loadMessages(id);
  }catch(e){setError(e instanceof Error?e.message:'Não foi possível registrar a tarefa.');}
  finally{setBusy(false)}
 }
 function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();void send(input);}
 return <div className="command">
  <section className="command-hero"><div className="command-hero-icon"><BotMessageSquare size={27}/></div>
   <div><span className="command-overline">CENTRO DE COMANDO · ENF@BACKES</span><h2>Seu time de agentes de gestão</h2>
    <p>Um chat de trabalho para organizar informações da unidade, apoiar a rotina da equipe e acompanhar pendências.</p></div>
   <span className="command-privacy"><LockKeyhole size={15}/> Acesso institucional</span>
  </section>
  <section className="command-agents" aria-label="Agentes disponíveis">
   {agents.map(a=><button type="button" key={a.id} className={'command-agent '+(agent===a.id?'selected':'')}
    onClick={()=>{setAgent(a.id);setProposal(null);setError('')}} aria-pressed={agent===a.id}>
     <a.icon size={23}/><strong>{a.label}</strong><small>{a.subtitle}</small></button>)}
  </section>
  <div className="command-grid">
   <aside className="command-history"><div className="command-history-title"><b>Conversas</b><button type="button" title="Nova conversa" onClick={()=>{setThread(null);setProposal(null);setError('')}}><Plus size={18}/></button></div>
    <button type="button" className="command-new" onClick={()=>{setThread(null);setError('')}}><Plus size={16}/> Nova conversa</button>
    <div className="command-thread-list">{threads.map(t=><button type="button" className={thread===t.id?'active':''} key={t.id} onClick={()=>{setThread(t.id);setProposal(null)}}>
     <MessageCircle size={15}/><span><b>{t.title}</b><small>{formatDate(t.created_at)}</small></span></button>)}
     {threads.length===0&&<p>Seu histórico aparecerá após a primeira consulta.</p>}</div>
    <div className="command-history-foot"><ShieldCheck size={15}/> Conversas privadas por usuário</div>
   </aside>
   <section className="command-chat" aria-label="Chat profissional">
    <div className="command-chat-head"><span className="command-avatar"><agentDef.icon size={21}/></span>
     <div><b>{agentDef.label}</b><small><span className="command-dot"/> Agente de dados operacionais</small></div>
     <button type="button" className="command-iconbtn" title="Atualizar" disabled={busy} onClick={()=>{if(thread)void loadMessages(thread).catch(()=>setError('Falha na atualização.'))}}><RefreshCw size={17}/></button>
    </div>
    <div className="command-transcript" role="log" aria-label="Mensagens da conversa" aria-live="polite">
     {!messages.length&&<div className="command-welcome"><span><Workflow size={29}/></span><h3>Olá, {profile.full_name.split(' ')[0]}! Como posso apoiar seu turno?</h3>
      <p>{agentDef.about} Escolha uma consulta rápida ou descreva a informação operacional que deseja conferir.</p>
      <button type="button" disabled={busy} onClick={()=>void send(agentDef.prompt)}><Activity size={16}/>{agentDef.prompt}<ArrowRight size={14}/></button>
     </div>}
     {messages.map(m=><div key={m.id} className={'command-message '+m.message_role}>
      <span>{m.message_role==='question'?<UserRound size={16}/>:<BotMessageSquare size={16}/>}</span>
      <div><small>{m.message_role==='question'?'Você':agents.find(a=>a.id===m.agent)?.label} · {formatDate(m.created_at)}</small><p>{m.body}</p></div></div>)}
     {busy&&<div className="command-loading" role="status">Consultando registros autorizados…</div>}
     <div ref={endRef}/>
    </div>
    <div className="command-form-area">
     {error&&<div role="alert" className="command-error">{error}</div>}
     {proposal&&<div className="command-proposal" role="region" aria-label="Confirmação para criação de tarefa"><b>Proposta de tarefa — ainda não registrada</b><p>{proposal}</p><div><button type="button" className="command-cancel" onClick={()=>setProposal(null)} disabled={busy}>Cancelar</button><button type="button" className="command-confirm" onClick={()=>void confirmTask()} disabled={busy}>Confirmar e registrar</button></div></div>}
     <div className="command-prompt"><small>Consulta rápida</small><button type="button" disabled={busy} onClick={()=>void send(agentDef.prompt)}>{agentDef.prompt}</button>{agent==='coordinator'&&<button type="button" disabled={busy} onClick={()=>{setInput('Criar tarefa: Revisar pendências operacionais');setProposal(null)}}>Criar tarefa</button>}</div>
     <form onSubmit={submit}><label htmlFor="nursing-command-input" className="command-sr-only">Mensagem para o agente</label>
      <textarea id="nursing-command-input" rows={2} minLength={2} maxLength={600} value={input} disabled={busy}
       onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void send(input)}}}
       placeholder="Ex.: Mostre a situação operacional desta unidade…"/>
      <button type="submit" aria-label="Enviar pergunta" disabled={busy||input.trim().length<2}><Send size={18}/></button>
     </form>
     <p><LockKeyhole size={13}/> O agente de passagem de plantão gera um resumo gerencial padronizado, sem dados de pacientes. Não digite CPF, nome de pacientes ou informações de prontuário. As mensagens ficam registradas no banco institucional.</p>
    </div>
   </section>
  </div>
  <p className="command-disclaimer"><CheckCircle2 size={16}/> Agentes determinísticos, sem decisões clínicas. A criação de tarefas somente ocorre após confirmação; a passagem de plantão é um resumo administrativo.</p>
 </div>;
}
