import {useEffect,useRef,type ReactNode} from 'react';
import './record-focus.css';
export default function RecordFocus({active,children}:{active:boolean;children:ReactNode}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(!active)return;
  ref.current?.focus({preventScroll:true});
  ref.current?.scrollIntoView?.({block:'center',behavior:'instant'});
 },[active]);
 return <div className={active?'record-focus active':'record-focus'} ref={ref} tabIndex={active?-1:undefined}>{children}</div>;
}
