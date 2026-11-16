import {useEffect,useRef,useState,type FormEvent} from 'react';
import {ArrowRight,BotMessageSquare,Send,X} from 'lucide-react';
import {answerOpenBot,openBotActions,type OpenBotDestination,type OpenBotReply,type OpenBotSnapshot} from './openbot';
import './openbot.css';
export default function OpenBot({getSnapshot,destinations,onNavigate,demo=false}:{getSnapshot:()=>OpenBotSnapshot|null;destinations:OpenBotDestination[];onNavigate:(destination:OpenBotDestination)=>void;demo?:boolean}){
 const [open,setOpen]=useState(false),[input,setInput]=useState('');
 const [reply,setReply]=useState<OpenBotReply|null>(null);
 const [question,setQuestion]=useState('');
 const dialog=useRef<HTMLDialogElement>(null);
 const inputRef=useRef<HTMLInputElement>(null);
 const launcher=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const node=dialog.current;if(!node)return;if(open&&!node.open){node.showModal();inputRef.current?.focus()}else if(!open&&node.open)node.close()},[open]);
 const ask=(value:string)=>{setQuestion(value);setReply(answerOpenBot(value,getSnapshot(),destinations));setInput('')};
 const submit=(event:FormEvent)=>{event.preventDefault();if(input.trim())ask(input.trim())};
 const navigate=(destination:OpenBotDestination)=>{setOpen(false);setReply(null);setQuestion('');onNavigate(destination)};
 return <>
  <button type="button" className="openbot-launcher" ref={launcher} aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(true)}><BotMessageSquare size={21}/><span>OpenBot</span></button>
  <dialog ref={dialog} className="openbot-dialog" aria-labelledby="openbot-title" onClose={()=>{setOpen(false);setReply(null);setQuestion('');setInput('');launcher.current?.focus()}}>
   <header className="openbot-head"><div><span>ASSISTENTE INTERNO</span><h2 id="openbot-title"><BotMessageSquare size={23}/> OpenBot</h2></div><button type="button" aria-label="Fechar OpenBot" onClick={()=>setOpen(false)}><X size={21}/></button></header>
   <p className="openbot-intro">Encontre o próximo passo da sua rotina. Posso indicar módulos e resumir tarefas e visitas carregadas.</p>
   <p className="openbot-mode">Respostas por regras locais · {demo?'demonstração com dados fictícios':'organização administrativa'}. Não envie informações de pacientes.</p>
   <div className="openbot-suggestions" role="group" aria-label="Sugestões de perguntas">{['Resumo das pendências','Como criar tarefa','Abrir visitas'].map(value=><button type="button" key={value} onClick={()=>ask(value)}>{value}</button>)}</div>
   <div className="openbot-response" aria-live="polite" aria-atomic="true">{reply?<><p className="openbot-question">{question}</p><p>{reply.text}</p><div className="openbot-actions">{reply.actions.map(action=><button type="button" key={action.destination} onClick={()=>navigate(action.destination)}>{action.label}<ArrowRight size={16}/></button>)}</div></>:<p>Use uma sugestão ou pergunte onde encontrar um recurso.</p>}</div>
   <form className="openbot-form" onSubmit={submit}><label htmlFor="openbot-input">O que você quer organizar?</label><div><input id="openbot-input" ref={inputRef} value={input} onChange={event=>setInput(event.target.value)} maxLength={240} placeholder="Ex.: onde ficam as tarefas?" autoComplete="off"/><button type="submit" aria-label="Enviar pergunta ao OpenBot" disabled={!input.trim()}><Send size={18}/></button></div></form>
   <nav className="openbot-shortcuts" aria-label="Atalhos do OpenBot">{openBotActions.filter(action=>destinations.includes(action.destination)).map(action=><button type="button" key={action.destination} onClick={()=>navigate(action.destination)}>{action.label}</button>)}</nav>
   <p className="openbot-foot">As alterações de registros são feitas nos módulos, com as permissões existentes. A conversa não é salva.</p>
  </dialog>
 </>;
}
