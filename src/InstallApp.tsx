import {useEffect,useState} from 'react';
import {Download,Smartphone,X} from 'lucide-react';
import './install-app.css';
type InstallEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed'}>};
export default function InstallApp({compact=false}:{compact?:boolean}){
 const [prompt,setPrompt]=useState<InstallEvent|null>(null),[ios,setIos]=useState(false),[standalone,setStandalone]=useState(false);
 const [manual,setManual]=useState(false);
 useEffect(()=>{
  setIos(/iPhone|iPad|iPod/.test(navigator.userAgent));
  setStandalone(window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && Boolean((navigator as Navigator &{standalone?:boolean}).standalone)));
  const onPrompt=(event:Event)=>{event.preventDefault();setPrompt(event as InstallEvent)};
  const onInstalled=()=>{setPrompt(null);setStandalone(true)};
  window.addEventListener('beforeinstallprompt',onPrompt);
  window.addEventListener('appinstalled',onInstalled);
  return()=>{window.removeEventListener('beforeinstallprompt',onPrompt);window.removeEventListener('appinstalled',onInstalled)};
 },[]);
 if(standalone)return null;
 async function install(){
  if(prompt){await prompt.prompt();await prompt.userChoice;setPrompt(null);}
  else setManual(true);
 }
 // Show install CTA in browser and manual Safari help when install event unavailable.
 return <div className={compact?'app-install compact':'app-install'}>
  <button type="button" className="app-install-button" onClick={()=>void install()} aria-label="Instalar ENF@BACKES no dispositivo">
   {compact?<Smartphone size={18}/>:<Download size={17}/>}
   {!compact&&'Instalar no dispositivo'}
  </button>
  {manual&&<div className="app-install-help" role="dialog" aria-modal="false" aria-label="Como instalar o aplicativo">
   <button type="button" className="app-install-close" onClick={()=>setManual(false)} aria-label="Fechar"><X size={17}/></button>
   <b>Adicionar à tela inicial</b>
   <p>{ios?'No Safari, abra Compartilhar e escolha “Adicionar à Tela de Início”; confirme “Abrir como App”.':'No Chrome ou Edge, abra o menu do navegador e selecione “Instalar aplicativo” ou “Adicionar à tela inicial”, se disponível.'}</p>
   <small>É necessário acesso à internet para login e dados de enfermagem.</small>
  </div>}
 </div>;
}
