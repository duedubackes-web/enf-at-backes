import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dailyAgenda} from '../src/daily-agenda.ts';
const now=new Date(2026,10,14,12).getTime();
const date=(day,hour=0)=>new Date(2026,10,day,hour).toISOString();
const task=(id,due_at,status='pending')=>({id,title:'Conferir material fictício',due_at,status});
const visit=(id,scheduled_at,status='planned')=>({id,patient_id:'fictional',scheduled_at,status});
test('agenda combina tarefas e visitas de hoje em ordem de horário',()=>{
 const tasks=[task('t',date(14,14))];const visits=[visit('v',date(14,9))];
 const result=dailyAgenda(tasks,visits,now);
 assert.deepEqual(result.map(x=>[x.id,x.kind,x.overdue]),[['v','visits',true],['t','tasks',false]]);
 assert.equal(tasks.length,1);assert.equal(visits.length,1);
 assert.equal('patient_id' in result[0],false);
});
test('agenda exclui encerrados, cancelados, datas inválidas e tarefas sem prazo',()=>{
 const tasks=[task('a',date(14),'completed'),task('b',date(14),'cancelled'),task('c',null),task('d','invalid')];
 const visits=[visit('e',date(14),'completed'),visit('f',date(14),'cancelled'),visit('g','invalid')];
 assert.deepEqual(dailyAgenda(tasks,visits,now),[]);
});
test('limites seguem o calendário local e mudam à meia-noite',()=>{
 const tasks=[task('previous',date(13,23)),task('start',date(14)),task('next',date(15))];
 assert.deepEqual(dailyAgenda(tasks,[],now).map(x=>x.id),['start']);
 assert.deepEqual(dailyAgenda(tasks,[],new Date(2026,10,15).getTime()).map(x=>x.id),['next']);
});
test('prazo exato ainda não está ultrapassado e tarefa em andamento aparece',()=>{
 assert.equal(dailyAgenda([task('a',new Date(now).toISOString(),'in_progress')],[],now)[0].overdue,false);
});
