import {useMemo,useState,type FormEvent} from 'react';
import {BookOpen,Search,ExternalLink,Calculator,FileQuestion,Send,ShieldCheck,CheckCircle2,Info} from 'lucide-react';
import {supabase,type Profile} from './supabase';
import {references,categories} from './reference-library';
import {occupancyRate,teamHours,workloadEstimate,administrativeCompletion} from './technical-calculations';
import './knowledge-center.css';
type Calculation='occupancy'|'hours'|'workload'|'completion';
type Field={key:string;label:string;hint?:string};
const calculators:{id:Calculation;name:string;description:string;formula:string;fields:Field[];unit:string}[]=[
 {id:'occupancy',name:'Ocupação operacional',description:'Percentual de ocupação de leitos cadastrados no período.',formula:'Leitos ocupados ÷ leitos disponíveis × 100',unit:'%',fields:[{key:'occupied',label:'Leitos ocupados'},{key:'available',label:'Leitos disponíveis'}]},
 {id:'hours',name:'Horas de equipe',description:'Total bruto de horas planejadas para a escala informada.',formula:'Profissionais × horas por turno × número de turnos',unit:'horas',fields:[{key:'professionals',label:'Profissionais'},{key:'hours',label:'Horas por turno'},{key:'shifts',label:'Quantidade de turnos'}]},
 {id:'workload',name:'Estimativa de carga de trabalho',description:'Simulação de equivalentes de trabalho com parâmetros locais; não substitui WISN completo ou dimensionamento Cofen.',formula:'Atividades anuais × minutos por atividade ÷ (60 × horas anuais disponíveis por profissional)',unit:'equivalentes',fields:[{key:'activities',label:'Atividades no ano'},{key:'minutes',label:'Minutos por atividade'},{key:'annualHours',label:'Horas de trabalho disponíveis por profissional no ano'}]},
 {id:'completion',name:'Execução administrativa',description:'Percentual de atividades administrativas concluídas.',formula:'Atividades concluídas ÷ atividades planejadas × 100',unit:'%',fields:[{key:'completed',label:'Concluídas'},{key:'planned',label:'Planejadas'}]}
];
type Request={id:string;title:string;category:string;status:string;created_at:string};
export default function KnowledgeCenter({profile}:{profile:Profile}){
 const [mode,setMode]=useState<'library'|'calculators'|'requests'>('library');
 const [search,setSearch]=useState(''),[category,setCategory]=useState<string>('Todas');
 const [selected,setSelected]=useState<Calculation>('workload'),[values,setValues]=useState<Record<string,string>>({});
 const [requestTitle,setRequestTitle]=useState(''),[requestDesc,setRequestDesc]=useState('');
 const [requestCategory,setRequestCategory]=useState('staffing');
 const [requests,setRequests]=useState<Request[]>([]),[saving,setSaving]=useState(false),[loading,setLoading]=useState(false),[message,setMessage]=useState('');
 const items=useMemo(()=>references.filter(d=>(category==='Todas'||d.category===category)
  && [d.title,d.publisher,d.summary,d.category].join(' ').toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))),[search,category]);
 const config=calculators.find(x=>x.id===selected)!;
 const result=useMemo(()=>{
  const parsed=config.fields.map(f=>values[f.key]===undefined||values[f.key].trim()===''?NaN:Number(values[f.key].replace(',','.')));
  if(parsed.some(x=>!Number.isFinite(x)))return {value:null,error:''};
  try{
   let value=0;
   if(selected==='occupancy')value=occupancyRate(parsed[0],parsed[1]);
   if(selected==='hours')value=teamHours(parsed[0],parsed[1],parsed[2]);
   if(selected==='workload')value=workloadEstimate(parsed[0],parsed[1],parsed[2]);
   if(selected==='completion')value=administrativeCompletion(parsed[0],parsed[1]);
   return {value,error:''};
  }catch(e){return {value:null,error:e instanceof Error?e.message:'Parâmetros inválidos.'}}
 },[config,values,selected]);
 const loadRequests=async()=>{
  if(!supabase)return;
  setLoading(true);setMessage('');
  const {data,error}=await supabase.from('technical_calculation_requests')
   .select('id,title,category,status,created_at')
   .eq('requester_id',profile.id).eq('health_unit_id',profile.health_unit_id)
   .order('created_at',{ascending:false}).limit(30);
  if(error)setMessage('Não foi possível consultar os pedidos.');
  else setRequests((data||[]) as Request[]);
  setLoading(false);
 };
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!supabase||saving)return;
  setMessage('');
  if(requestTitle.trim().length<5||requestDesc.trim().length<10){setMessage('Preencha o título e a descrição com mais detalhes.');return;}
  setSaving(true);
  const {error}=await supabase.from('technical_calculation_requests').insert({
   organization_id:profile.organization_id,health_unit_id:profile.health_unit_id,
   requester_id:profile.id,title:requestTitle.trim(),description:requestDesc.trim(),
   category:requestCategory,status:'submitted'
  });
  if(error)setMessage('Não foi possível registrar o pedido. Confira sua autorização.');
  else{setRequestTitle('');setRequestDesc('');setMessage('Pedido registrado para análise institucional. Não há resposta automática.');await loadRequests();}
  setSaving(false);
 }
 const switchMode=(v:'library'|'calculators'|'requests')=>{setMode(v);setMessage('');if(v==='requests')void loadRequests();};
 return <div className="kb">
  <section className="kb-hero"><div><span>CONHECIMENTO TÉCNICO · ENFERMAGEM</span><h2>Biblioteca & Cálculos de Gestão</h2><p>Referências oficiais, pesquisas rápidas e simulações administrativas para apoiar o trabalho profissional.</p></div><BookOpen size={39}/></section>
  <div className="kb-tabs" role="group" aria-label="Área de conhecimento">
   <button type="button" aria-pressed={mode==='library'} onClick={()=>switchMode('library')}><BookOpen size={17}/> Biblioteca</button>
   <button type="button" aria-pressed={mode==='calculators'} onClick={()=>switchMode('calculators')}><Calculator size={17}/> Calculadoras</button>
   <button type="button" aria-pressed={mode==='requests'} onClick={()=>switchMode('requests')}><FileQuestion size={17}/> Solicitar cálculo</button>
  </div>
  {mode==='library'&&<section className="kb-panel">
    <h3>Fontes oficiais selecionadas</h3><p>Catálogo inicial com links de consulta às publicações originais. Não reproduz documentos protegidos nem certifica conformidade.</p>
    <div className="kb-filter"><label><Search size={16}/><input aria-label="Pesquisar documentos" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar por assunto, entidade ou título"/></label>
      <select aria-label="Filtrar categoria" value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(x=><option key={x} value={x}>{x}</option>)}</select></div>
    <div className="kb-cards">{items.map(d=><article key={d.id} className="kb-doc">
     <div className="kb-doc-meta"><span>{d.publisher} · {d.year}</span><span>{d.category}</span></div>
     <h4>{d.title}</h4><p>{d.summary}</p>{d.note&&<small>{d.note}</small>}
     <a href={d.url} target="_blank" rel="noopener noreferrer">Abrir publicação oficial <ExternalLink size={15}/></a>
    </article>)}</div>{items.length===0&&<p>Nenhuma referência corresponde à busca.</p>}
    <p className="kb-note"><Info size={15}/> Conteúdo selecionado e datado; confirme atualizações, protocolos locais e direitos de uso na fonte.</p>
  </section>}
  {mode==='calculators'&&<section className="kb-panel"><h3>Calculadoras administrativas</h3><p>Resultados locais no navegador. Nenhum valor informado é enviado ou armazenado automaticamente.</p>
   <div className="kb-calcs">{calculators.map(c=><button type="button" key={c.id} aria-pressed={selected===c.id} onClick={()=>{setSelected(c.id);setValues({})}}>{c.name}</button>)}</div>
   <div className="kb-calc-detail"><h4>{config.name}</h4><p>{config.description}</p><div className="kb-inputs">{config.fields.map(f=><label key={f.key}>{f.label}<input type="number" min="0" step="any" inputMode="decimal" value={values[f.key]||''} onChange={e=>setValues(v=>({...v,[f.key]:e.target.value}))} placeholder="Informe um valor"/></label>)}</div>
    <p className="kb-formula"><b>Fórmula:</b> {config.formula}</p>
    {result.error&&<p role="alert" className="kb-error">{result.error}</p>}
    {result.value!==null&&<div role="status" className="kb-result"><span>Resultado estimado</span><strong>{result.value.toLocaleString('pt-BR',{maximumFractionDigits:2})} {config.unit}</strong></div>}
   </div><p className="kb-note"><ShieldCheck size={15}/> Não usar para doses, infusão, diagnóstico, classificação de risco ou dimensionamento legal definitivo. Verifique os parâmetros com responsabilidade técnica. Para dimensionamento, consulte WISN OMS e Parecer Cofen 1/2024.</p>
  </section>}
  {mode==='requests'&&<section className="kb-panel"><h3>Pedido de cálculo técnico</h3><p>Registre uma solicitação administrativa para análise pelo responsável institucional. Esta versão não oferece atendimento humano automático nem calcula solicitações abertas.</p>
   <form className="kb-request" onSubmit={submit}>
    <label>Categoria<select value={requestCategory} onChange={e=>setRequestCategory(e.target.value)}><option value="staffing">Dimensionamento de equipe</option><option value="workload">Carga de trabalho</option><option value="capacity">Capacidade operacional</option><option value="quality">Indicadores de qualidade</option><option value="other">Outro cálculo administrativo</option></select></label>
    <label>Assunto<input required minLength={5} maxLength={120} value={requestTitle} onChange={e=>setRequestTitle(e.target.value)} placeholder="Ex.: simulação de equipe por carga anual"/></label>
    <label>Descrição sem dados de pacientes<textarea rows={4} required minLength={10} maxLength={1000} value={requestDesc} onChange={e=>setRequestDesc(e.target.value)} placeholder="Objetivo, período, parâmetros agregados e dúvidas. Não incluir nomes, CPF, prontuários ou dados clínicos."/></label>
    <button type="submit" disabled={saving}><Send size={16}/>{saving?'Enviando...':'Registrar pedido'}</button>
   </form>
   {message&&<p role="status" className="kb-message">{message}</p>}
   <div className="kb-request-head"><h4>Meus pedidos</h4><button type="button" onClick={()=>void loadRequests()} disabled={loading}>Atualizar</button></div>
   {requests.map(r=><div className="kb-request-row" key={r.id}><span><b>{r.title}</b><small>{new Date(r.created_at).toLocaleDateString('pt-BR')} · {r.category}</small></span><span>{r.status==='submitted'?'Recebido':r.status==='under_review'?'Em análise':r.status==='answered'?'Respondido':'Encerrado'}</span></div>)}
   {requests.length===0&&<p className="kb-note">Sem solicitações listadas. Nenhum dado clínico deve ser enviado neste formulário.</p>}
   <p className="kb-note"><CheckCircle2 size={15}/> Registro privado por profissional e unidade. A triagem e resposta dependem de um processo institucional que ainda será homologado.</p>
  </section>}
 </div>;
}
