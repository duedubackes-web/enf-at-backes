import {useCallback,useEffect,useMemo,useState,type FormEvent} from 'react';
import {Activity,ArrowRight,CalendarCheck2,CalendarClock,CheckCircle2,ClipboardPlus,HeartPulse,RefreshCw,ShieldCheck} from 'lucide-react';
import {supabase,type Patient,type Profile} from './supabase';
import './care-programs.css';

type ProgramType='prenatal'|'diabetes'|'hypertension';
type ProgramStatus='active'|'completed'|'cancelled';
type FollowupStatus='planned'|'completed'|'cancelled';
type Program={id:string;patient_id:string;program_type:ProgramType;status:ProgramStatus;enrolled_at:string};
type Followup={id:string;program_id:string;scheduled_at:string;status:FollowupStatus;note:string;completed_at:string|null};
type Filter='all'|'prenatal'|'diabetes'|'hypertension';
const labels:Record<ProgramType,string>={prenatal:'Pré-natal',diabetes:'Diabetes',hypertension:'Hipertensão'};
const toISO=(local:string)=>{const d=new Date(local);return Number.isFinite(d.valueOf())?d.toISOString():null;};
const fmt=(date:string)=>new Date(date).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});
export default function CarePrograms({patients,profile,canClinical}:{patients:Patient[];profile:Profile;canClinical:boolean}){
 const [programs,setPrograms]=useState<Program[]>([]),[followups,setFollowups]=useState<Followup[]>([]);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [programPatient,setProgramPatient]=useState(''),[programType,setProgramType]=useState<ProgramType>('prenatal');
 const [filter,setFilter]=useState<Filter>('all'),[programId,setProgramId]=useState(''),[date,setDate]=useState('');
 const [note,setNote]=useState('');
 const unit=profile.health_unit_id,org=profile.organization_id;
 const load=useCallback(async()=>{
  if(!supabase)return;
  const [a,b]=await Promise.all([
   supabase.from('care_programs').select('id,patient_id,program_type,status,enrolled_at')
    .eq('organization_id',org).eq('health_unit_id',unit).order('enrolled_at',{ascending:false}).limit(200),
   supabase.from('care_followups').select('id,program_id,scheduled_at,status,note,completed_at')
    .eq('organization_id',org).eq('health_unit_id',unit).order('scheduled_at').limit(200)
  ]);
  if(a.error||b.error){setError('Não foi possível consultar os acompanhamentos autorizados.');return;}
  setPrograms((a.data||[]) as Program[]);setFollowups((b.data||[]) as Followup[]);
 },[org,unit]);
 useEffect(()=>{void load()},[load]);
 const active=programs.filter(p=>p.status==='active');
 const pending=followups.filter(f=>f.status==='planned');
 const overdue=pending.filter(f=>new Date(f.scheduled_at).getTime()<Date.now());
 const shown=useMemo(()=>programs.filter(p=>filter==='all'||p.program_type===filter),[programs,filter]);
 const getPatient=(id:string)=>patients.find(p=>p.id===id)?.full_name||'Paciente vinculado';
 const selected=programs.find(p=>p.id===programId);
 const clearMessages=()=>{setError('');setNotice('')};
 async function enroll(e:FormEvent){
  e.preventDefault();if(!supabase||!canClinical)return;
  const patient=patients.find(p=>p.id===programPatient);
  if(!patient||patient.status!=='active'){setError('Selecione um paciente ativo.');return;}
  if(active.some(p=>p.patient_id===programPatient&&p.program_type===programType)){setError('Já existe acompanhamento ativo nessa linha de cuidado.');return;}
  clearMessages();setBusy(true);
  try{
   const user=await supabase.auth.getUser();if(!user.data.user)throw Error('Sessão expirada');
   const {error:err}=await supabase.from('care_programs').insert({
    organization_id:org,health_unit_id:unit,patient_id:programPatient,
    program_type:programType,created_by:user.data.user.id});
   if(err)throw err;
   setProgramPatient('');setNotice('Paciente incluído na linha de cuidado.');await load();
  }catch(ex){setError(ex instanceof Error?ex.message:'Falha ao incluir paciente.')}
  finally{setBusy(false)}
 }
 async function schedule(e:FormEvent){
  e.preventDefault();if(!supabase||!canClinical)return;
  if(!selected||selected.status!=='active'){setError('Escolha um programa ativo.');return;}
  const when=toISO(date);
  if(!when){setError('Informe data e hora válidas.');return;}
  clearMessages();setBusy(true);
  try{
   const user=await supabase.auth.getUser();if(!user.data.user)throw Error('Sessão expirada');
   const {error:err}=await supabase.from('care_followups').insert({
    organization_id:org,health_unit_id:unit,program_id:selected.id,scheduled_at:when,
    note:note.trim(),created_by:user.data.user.id});
   if(err)throw err;
   setDate('');setNote('');setNotice('Acompanhamento agendado.');await load();
  }catch(ex){setError(ex instanceof Error?ex.message:'Falha ao agendar.')}
  finally{setBusy(false)}
 }
 async function completeFollowup(f:Followup){
  if(!supabase||!canClinical||f.status!=='planned')return;
  clearMessages();setBusy(true);
  try{
   const {error:err}=await supabase.from('care_followups')
    .update({status:'completed'}).eq('id',f.id).eq('organization_id',org).eq('health_unit_id',unit);
   if(err)throw err;
   setNotice('Acompanhamento concluído com registro de horário no servidor.');await load();
  }catch(ex){setError(ex instanceof Error?ex.message:'Falha ao concluir.')}
  finally{setBusy(false)}
 }
 async function closeProgram(p:Program){
  if(!supabase||!canClinical||p.status!=='active')return;
  if(pending.some(f=>f.program_id===p.id)){setError('Conclua ou cancele os retornos pendentes antes de encerrar o programa.');return;}
  if(!window.confirm('Encerrar este ciclo de acompanhamento? A operação não pode ser revertida.'))return;
  clearMessages();setBusy(true);
  try{
   const {error:err}=await supabase.from('care_programs')
    .update({status:'completed'}).eq('id',p.id).eq('organization_id',org).eq('health_unit_id',unit);
   if(err)throw err;setNotice('Ciclo encerrado.');await load();
  }catch(ex){setError(ex instanceof Error?ex.message:'Falha ao encerrar.')}
  finally{setBusy(false)}
 }
 return <div className="care-page">
  <div className="care-intro"><div className="care-icon"><HeartPulse size={23}/></div><div><span className="care-kicker">CONTINUIDADE ASSISTENCIAL</span><h2>Acompanhamento longitudinal</h2><p>Organize linhas de cuidado e retornos programados. Os registros não representam diagnósticos automáticos.</p></div></div>
  <div className="care-metrics">
   <div><Activity size={21}/><strong>{active.length}</strong><span>Programas ativos*</span></div>
   <div><CalendarClock size={21}/><strong>{pending.length}</strong><span>Retornos previstos*</span></div>
   <div><CalendarCheck2 size={21}/><strong>{overdue.length}</strong><span>Retornos com data passada*</span></div>
  </div>
  <p className="care-sample">* Resumo limitado aos primeiros 200 registros por consulta; não é indicador de cobertura populacional nem classificação de risco clínico.</p>
  {error&&<div className="error" role="alert">{error}</div>}
  {notice&&<p className="care-notice" role="status"><CheckCircle2 size={16}/>{notice}</p>}
  <div className="care-layout">
   <section className="panel care-panel"><div className="care-panel-head"><h2>Linhas de cuidado</h2><button type="button" className="ghost" onClick={()=>void load()}><RefreshCw size={16}/> Atualizar</button></div>
    <div className="care-filters" role="group" aria-label="Filtrar programas">
     {([['all','Todos'],['prenatal','Pré-natal'],['diabetes','Diabetes'],['hypertension','Hipertensão']] as [Filter,string][]).map(([k,v])=><button type="button" key={k} className={filter===k?'selected':''} onClick={()=>setFilter(k)}>{v}</button>)}
    </div>
    {shown.map(p=><article className="care-row" key={p.id}>
     <div className="care-row-main"><b>{getPatient(p.patient_id)}</b><small>{labels[p.program_type]} · Entrada em {fmt(p.enrolled_at)}</small></div>
     <span className={'care-state '+p.status}>{p.status==='active'?'Ativo':p.status==='completed'?'Encerrado':'Cancelado'}</span>
     {canClinical&&p.status==='active'&&<button type="button" className="care-text-button" disabled={busy} onClick={()=>void closeProgram(p)}>Encerrar</button>}
    </article>)}
    {shown.length===0&&<p className="empty">Nenhum programa encontrado.</p>}
   </section>
   <div className="care-side">
    {canClinical&&<section className="panel care-panel"><div className="care-subheading"><ClipboardPlus size={19}/><h2>Novo acompanhamento</h2></div>
     <form className="care-form" onSubmit={enroll}>
      <label htmlFor="care-patient">Paciente</label><select id="care-patient" required value={programPatient} onChange={e=>setProgramPatient(e.target.value)}><option value="">Selecione um paciente ativo</option>{patients.filter(p=>p.status==='active').map(p=><option key={p.id} value={p.id}>{p.full_name}</option>)}</select>
      <label htmlFor="care-type">Linha de cuidado</label><select id="care-type" value={programType} onChange={e=>setProgramType(e.target.value as ProgramType)}><option value="prenatal">Pré-natal</option><option value="diabetes">Diabetes</option><option value="hypertension">Hipertensão</option></select>
      <button type="submit" disabled={busy||!patients.length}>Iniciar acompanhamento <ArrowRight size={16}/></button>
     </form></section>}
    {canClinical&&<section className="panel care-panel"><div className="care-subheading"><CalendarClock size={19}/><h2>Agendar retorno</h2></div>
     <form className="care-form" onSubmit={schedule}>
      <label htmlFor="care-program">Programa ativo</label><select required id="care-program" value={programId} onChange={e=>setProgramId(e.target.value)}><option value="">Selecione</option>{active.map(p=><option key={p.id} value={p.id}>{getPatient(p.patient_id)} · {labels[p.program_type]}</option>)}</select>
      <label htmlFor="care-date">Data e hora</label><input required id="care-date" type="datetime-local" value={date} onChange={e=>setDate(e.target.value)}/>
      <label htmlFor="care-note">Observação descritiva (opcional)</label><textarea id="care-note" maxLength={5000} rows={3} value={note} onChange={e=>setNote(e.target.value)} placeholder="Informações operacionais do agendamento"/>
      <button type="submit" disabled={busy||!active.length}>Registrar retorno <ArrowRight size={16}/></button>
     </form></section>}
   </div>
  </div>
  <section className="panel care-panel"><div className="care-subheading"><CalendarDaysIcon/><h2>Agenda de retornos</h2></div>
   {followups.map(f=>{const p=programs.find(x=>x.id===f.program_id);return <div className="care-row" key={f.id}><div className="care-row-main"><b>{p?getPatient(p.patient_id):'Programa associado'}</b><small>{p?labels[p.program_type]:''} · {fmt(f.scheduled_at)}{f.note?' · '+f.note.slice(0,75):''}</small></div><span className={'care-state '+f.status}>{f.status==='planned'?'Previsto':f.status==='completed'?'Concluído':'Cancelado'}</span>{canClinical&&f.status==='planned'&&<button className="care-text-button" disabled={busy} onClick={()=>void completeFollowup(f)}>Concluir</button>}</div>})}
   {followups.length===0&&<p className="empty">Nenhum retorno agendado.</p>}
   <p className="care-disclaimer"><ShieldCheck size={15}/> Prioridades baseadas em datas e status administrativos, sem classificação clínica automatizada.</p>
  </section>
 </div>;
}
function CalendarDaysIcon(){return <CalendarCheck2 size={19}/>;}
