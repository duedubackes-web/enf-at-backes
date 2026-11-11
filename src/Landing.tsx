import {useEffect,useRef,useState,type FormEvent} from 'react';
import {
 Activity,ArrowRight,ArrowUpRight,Check,CheckCircle2,ChevronDown,ClipboardList,
 HeartPulse,LockKeyhole,Menu,ShieldCheck,Stethoscope,Users,CalendarDays,
 BarChart3,Workflow,Eye,Clock3,Sparkles,X,ChartNoAxesCombined,MapPinned
} from 'lucide-react';
import {configured,supabase} from './supabase';

const features=[
 {icon:ClipboardList,eyebrow:'GESTÃO DE ROTINA',name:'Organização sem sobrecarga',description:'Centralize tarefas, responsáveis e pendências de cada turno em um único ambiente.',tone:'cyan'},
 {icon:Stethoscope,eyebrow:'ASSISTÊNCIA',name:'Cuidado com continuidade',description:'Conecte pacientes, atendimentos e histórico de acompanhamento em fluxos estruturados.',tone:'blue'},
 {icon:MapPinned,eyebrow:'TERRITÓRIO',name:'Visitas sob controle',description:'Planeje visitas domiciliares e visualize o que está previsto, realizado ou pendente.',tone:'mint'},
 {icon:BarChart3,eyebrow:'INTELIGÊNCIA GERENCIAL',name:'Indicadores úteis',description:'Visualize prioridades e sinais operacionais para orientar decisões de gestão.',tone:'violet'},
 {icon:ShieldCheck,eyebrow:'GOVERNANÇA',name:'Segurança desde a base',description:'Permissões institucionais, isolamento por unidade e rastreabilidade das alterações.',tone:'blue'},
 {icon:Workflow,eyebrow:'EVOLUÇÃO CONTÍNUA',name:'Pronto para integrar',description:'Arquitetura preparada para ampliar módulos e avançar rumo à interoperabilidade.',tone:'cyan'},
];
const workflow=[
 {number:'01',title:'Identifique prioridades',text:'Abra o painel e encontre a próxima ação relevante para a equipe.'},
 {number:'02',title:'Registre com contexto',text:'Organize informações assistenciais com autoria e vínculo institucional.'},
 {number:'03',title:'Acompanhe a execução',text:'Consulte tarefas e visitas para melhorar a continuidade do cuidado.'}
];

export default function Landing(){
 const [loginOpen,setLoginOpen]=useState(false),[mobileOpen,setMobileOpen]=useState(false);
 const [email,setEmail]=useState(''),[password,setPassword]=useState('');
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const emailInput=useRef<HTMLInputElement>(null);
 useEffect(()=>{
  const nodes=document.querySelectorAll<HTMLElement>('[data-reveal]');
  if(!('IntersectionObserver' in window)){
    nodes.forEach(el=>el.classList.add('is-visible'));return;
  }
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}});
  },{threshold:.12,rootMargin:'0px 0px 40px 0px'});
  nodes.forEach(el=>observer.observe(el));return()=>observer.disconnect();
 },[]);
 useEffect(()=>{
  if(!loginOpen)return;
  emailInput.current?.focus();
  const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')setLoginOpen(false)};
  window.addEventListener('keydown',onKey);
  const previous=document.body.style.overflow;document.body.style.overflow='hidden';
  return()=>{window.removeEventListener('keydown',onKey);document.body.style.overflow=previous;};
 },[loginOpen]);
 const openLogin=()=>{setMobileOpen(false);setError('');setLoginOpen(true)};
 async function signIn(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setError('');
  if(!configured||!supabase){setError('O acesso institucional ainda não foi configurado neste ambiente.');return}
  setBusy(true);
  try{
   const {error:authError}=await supabase.auth.signInWithPassword({email:email.trim(),password});
   if(authError)throw authError;setPassword('');setLoginOpen(false);
  }catch{setError('Não foi possível entrar. Verifique seus dados de acesso institucional.')}
  finally{setBusy(false)}
 }
 return <div className="lp" id="inicio">
  <a className="lp-skip" href="#conteudo">Ir para o conteúdo</a>
  <div className="lp-announcement"><span className="lp-announcement-dot"/> Tecnologia aplicada à gestão do cuidado <span className="lp-announcement-divider">·</span> Plataforma em desenvolvimento</div>
  <header className="lp-header">
   <a className="lp-logo" href="#inicio" aria-label="ENF@BACKES início">
    <span className="lp-logo-mark"><HeartPulse size={23} strokeWidth={2.4}/></span>
    <span className="lp-logo-type">ENF<span>@</span>BACKES<small>Gestão Inteligente de Enfermagem</small></span>
   </a>
   <nav className={mobileOpen?'lp-nav open':'lp-nav'} aria-label="Navegação principal">
    <a href="#solucao" onClick={()=>setMobileOpen(false)}>Solução</a>
    <a href="#recursos" onClick={()=>setMobileOpen(false)}>Recursos</a>
    <a href="#como-funciona" onClick={()=>setMobileOpen(false)}>Como funciona</a>
    <a href="#seguranca" onClick={()=>setMobileOpen(false)}>Segurança</a>
    <button className="lp-mobile-login" onClick={openLogin}>Acessar plataforma <ArrowRight size={16}/></button>
   </nav>
   <div className="lp-header-actions"><button className="lp-link-login" onClick={openLogin}>Área profissional</button><button className="lp-btn lp-btn-small lp-btn-dark" onClick={openLogin}>Entrar <ArrowUpRight size={16}/></button></div>
   <button className="lp-menu-toggle" onClick={()=>setMobileOpen(v=>!v)} aria-label={mobileOpen?'Fechar menu':'Abrir menu'} aria-expanded={mobileOpen}>{mobileOpen?<X size={23}/>:<Menu size={23}/>}</button>
  </header>
  <main id="conteudo">
   <section className="lp-hero" id="solucao">
    <div className="lp-hero-orb lp-orb-one" aria-hidden="true"/><div className="lp-hero-orb lp-orb-two" aria-hidden="true"/>
    <div className="lp-hero-grid">
     <div className="lp-hero-copy">
      <div className="lp-eyebrow"><span><Sparkles size={14}/></span> O FUTURO DA GESTÃO EM ENFERMAGEM</div>
      <h1>Mais inteligência na gestão.<br/><span>Mais tempo para cuidar.</span></h1>
      <p>Uma experiência integrada para organizar o trabalho da enfermagem, acompanhar a jornada do paciente e transformar a rotina em decisões mais claras.</p>
      <div className="lp-hero-actions"><button className="lp-btn lp-btn-primary" onClick={openLogin}>Acessar plataforma <ArrowRight size={19}/></button><a className="lp-btn lp-btn-outline" href="#recursos">Explorar recursos <ChevronDown size={18}/></a></div>
      <div className="lp-hero-checks"><span><CheckCircle2 size={16}/> Rotina organizada</span><span><CheckCircle2 size={16}/> Visão assistencial</span><span><CheckCircle2 size={16}/> Segurança de acesso</span></div>
     </div>
     <div className="lp-dashboard-wrap" aria-label="Prévia ilustrativa do dashboard, com dados fictícios">
      <div className="lp-dashboard-glow" aria-hidden="true"/>
      <div className="lp-float lp-float-top"><span className="lp-float-icon"><Activity size={17}/></span><span>Operação conectada<small>Fluxos organizados</small></span><CheckCircle2 size={17} className="lp-green"/></div>
      <div className="lp-dashboard">
       <div className="lp-dashboard-sidebar"><HeartPulse size={22}/><div className="lp-dash-sicon chosen"><Activity size={17}/></div><div className="lp-dash-sicon"><Users size={17}/></div><div className="lp-dash-sicon"><ClipboardList size={17}/></div><div className="lp-dash-sicon"><CalendarDays size={17}/></div><div className="lp-dash-sicon"><ShieldCheck size={17}/></div></div>
       <div className="lp-dashboard-body">
        <div className="lp-dash-head"><div><small>QUARTA-FEIRA · EXEMPLO ILUSTRATIVO</small><h3>Visão geral da unidade</h3><span>Painel de gestão assistencial</span></div><div className="lp-dash-avatar">EB</div></div>
        <div className="lp-dash-metrics">
         <div><span><Users size={15}/> Pacientes</span><strong>248</strong><small>Exemplo fictício</small></div>
         <div><span><ClipboardList size={15}/> Tarefas</span><strong>32</strong><small>Exemplo fictício</small></div>
         <div><span><CalendarDays size={15}/> Visitas</span><strong>18</strong><small>Exemplo fictício</small></div>
        </div>
        <div className="lp-dash-lower">
         <div className="lp-dash-chart"><div className="lp-dash-section-head"><strong>Atividade assistencial</strong><small>Visão demonstrativa</small></div><div className="lp-chart-bars" aria-hidden="true">{[36,55,43,70,50,84,67,92,63,78,58,88].map((h,i)=><div key={i} style={{height:h+'%'}}/>)}</div><div className="lp-chart-axis"><span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span></div></div>
         <div className="lp-dash-tasks"><strong>Prioridades</strong><div><i className="lp-dot-cyan"/> Revisar agenda <Check size={13}/></div><div><i className="lp-dot-mint"/> Visitas do dia <Check size={13}/></div><div><i className="lp-dot-blue"/> Plano de cuidados <Clock3 size={13}/></div></div>
        </div>
       </div>
      </div>
      <div className="lp-float lp-float-bottom"><span className="lp-float-icon lp-mint"><ShieldCheck size={18}/></span><span>Acesso institucional<small>Permissões por função</small></span></div>
     </div>
    </div>
    <div className="lp-hero-bottom"><span>UMA PLATAFORMA PARA O CUIDADO QUE NÃO PARA</span><div className="lp-hero-bottom-line"/></div>
   </section>

   <section className="lp-section lp-benefits" id="recursos">
    <div className="lp-section-heading" data-reveal><div className="lp-overline">UMA NOVA FORMA DE GERENCIAR</div><h2>Tecnologia que entende <em>o ritmo do cuidado.</em></h2><p>Da organização da equipe à continuidade do acompanhamento, cada ferramenta foi pensada para simplificar a rotina.</p></div>
    <div className="lp-feature-grid">{features.map((f,i)=><article className="lp-feature" data-reveal key={f.name} style={{transitionDelay:Math.min(i,3)*70+'ms'}}><div className={'lp-feature-icon '+f.tone}><f.icon size={26} strokeWidth={1.8}/></div><span className="lp-feature-label">{f.eyebrow}</span><h3>{f.name}</h3><p>{f.description}</p><div className="lp-feature-corner"><ArrowUpRight size={19}/></div></article>)}</div>
   </section>

   <section className="lp-showcase">
    <div className="lp-showcase-inner">
     <div className="lp-showcase-visual" data-reveal>
      <div className="lp-mini-top"><span className="lp-mini-visual-dot"/><span className="lp-mini-visual-dot"/><span className="lp-mini-visual-dot"/><small>ENF@BACKES / GESTÃO</small></div>
      <div className="lp-mini-heading">Tudo o que importa, em perspectiva.</div>
      <div className="lp-mini-cards"><div><div className="lp-mini-card-icon"><Users size={18}/></div><strong>Pacientes</strong><span>Visão centralizada</span></div><div><div className="lp-mini-card-icon"><CalendarDays size={18}/></div><strong>Agenda</strong><span>Planejamento diário</span></div></div>
      <div className="lp-mini-tracks"><div><span>Fluxos organizados</span><i style={{width:'82%'}}/></div><div><span>Continuidade do cuidado</span><i style={{width:'65%'}}/></div><div><span>Visibilidade da rotina</span><i style={{width:'92%'}}/></div></div>
      <small className="lp-mini-disclaimer">Ilustração conceitual — não representa resultados clínicos medidos.</small>
     </div>
     <div className="lp-showcase-copy" data-reveal><div className="lp-overline light">FEITO PARA QUEM CUIDA</div><h2>A enfermagem merece ferramentas à altura da sua missão.</h2><p>O ENF@BACKES reúne recursos de apoio à gestão, informação organizada e experiência digital intuitiva — com espaço para crescer junto com a equipe.</p><div className="lp-showcase-list"><span><CheckCircle2 size={19}/> Informação contextualizada</span><span><CheckCircle2 size={19}/> Trabalho colaborativo</span><span><CheckCircle2 size={19}/> Evolução contínua e responsável</span></div><button className="lp-btn lp-btn-primary" onClick={openLogin}>Conhecer por dentro <ArrowRight size={18}/></button></div>
    </div>
   </section>

   <section className="lp-section lp-steps" id="como-funciona"><div className="lp-section-heading" data-reveal><div className="lp-overline">SIMPLES NO USO. SÉRIO NA ESTRUTURA.</div><h2>Um fluxo mais claro <em>do começo ao fim.</em></h2></div><div className="lp-steps-grid">{workflow.map(s=><div className="lp-step" data-reveal key={s.number}><span>{s.number}</span><h3>{s.title}</h3><p>{s.text}</p></div>)}</div></section>

   <section className="lp-security" id="seguranca"><div className="lp-security-inner" data-reveal><div className="lp-security-badge"><LockKeyhole size={25}/></div><div><div className="lp-overline">SEGURANÇA NÃO É UM EXTRA</div><h2>Confiança construída na arquitetura.</h2><p>O núcleo técnico prevê autenticação individual, isolamento de dados por unidade e registro de alterações. A entrada em operação com dados reais depende de testes, aprovação institucional e conformidade com a LGPD.</p></div><div className="lp-security-tags"><span><ShieldCheck size={16}/> Controle de permissões</span><span><Eye size={16}/> Rastreabilidade</span><span><HeartPulse size={16}/> Responsabilidade clínica</span></div></div></section>

   <section className="lp-cta" data-reveal><div className="lp-cta-shape" aria-hidden="true"/><span className="lp-overline light">ENF@BACKES</span><h2>Mais clareza na gestão.<br/>Mais presença no cuidado.</h2><p>Um novo capítulo para a gestão inteligente da enfermagem.</p><button onClick={openLogin} className="lp-btn lp-btn-white">Acessar área profissional <ArrowRight size={18}/></button></section>
  </main>
  <footer className="lp-footer"><a className="lp-footer-brand" href="#inicio"><HeartPulse size={22}/> ENF<span>@</span>BACKES</a><p>Gestão Inteligente de Enfermagem · Plataforma em desenvolvimento, não homologada para uso clínico real.</p><span>© 2026 ENF@BACKES</span></footer>
  {loginOpen&&<div className="lp-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setLoginOpen(false)}}><section role="dialog" aria-modal="true" aria-labelledby="lp-login-title" className="lp-modal">
    <button className="lp-modal-close" onClick={()=>setLoginOpen(false)} aria-label="Fechar acesso"><X size={20}/></button>
    <div className="lp-modal-icon"><LockKeyhole size={23}/></div><h2 id="lp-login-title">Bem-vindo à área profissional.</h2><p>Entre com as credenciais vinculadas à sua instituição de saúde.</p>
    <form onSubmit={signIn}><label htmlFor="lp-email">E-mail institucional</label><input ref={emailInput} id="lp-email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" placeholder="voce@instituicao.com.br"/><label htmlFor="lp-password">Senha</label><input id="lp-password" type="password" required value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" placeholder="Sua senha"/><button disabled={busy} className="lp-btn lp-btn-primary">{busy?'Autenticando…':'Entrar com segurança'} <ArrowRight size={18}/></button></form>
    {error&&<p role="alert" className="lp-login-error">{error}</p>}<div className="lp-modal-foot"><ShieldCheck size={17}/> Acesso restrito a profissionais autorizados.</div>
   </section></div>}
 </div>;
}
