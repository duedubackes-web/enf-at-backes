import {test} from 'node:test';
import assert from 'node:assert/strict';
import {administrativeSummary,isUpcoming,selectTasks,summarizeTasks} from '../src/task-priority.ts';

const now=Date.parse('2026-11-12T02:30:00-03:00');
const hour=60*60*1000;
const task=(offset,status='pending')=>({title:'Rotina administrativa fictícia',status,due_at:new Date(now+offset).toISOString()});

test('janela móvel de 24 horas inclui limites e exclui atraso e prazo posterior',()=>{
 for(const offset of [0,1,24*hour])assert.equal(isUpcoming(task(offset),now),true);
 for(const offset of [-1,24*hour+1])assert.equal(isUpcoming(task(offset),now),false);
 assert.equal(isUpcoming(task(hour,'in_progress'),now),true);
 for(const status of ['completed','cancelled'])assert.equal(isUpcoming(task(hour,status),now),false);
 for(const due_at of [null,'inválido'])assert.equal(isUpcoming({...task(0),due_at},now),false);
});

test('próximas 24h atravessa meia-noite e combina busca, ordenação e estados',()=>{
 const entries=[task(24*hour),task(hour,'completed'),task(-1),task(0),{...task(hour),title:'Conferir escala fictícia'}];
 assert.deepEqual(selectTasks(entries,'upcoming','',now),[entries[3],entries[4],entries[0]]);
 assert.deepEqual(selectTasks(entries,'upcoming','ESCALA',now),[entries[4]]);
 assert.equal(isUpcoming(task(0),now+1),false);
});

test('resumo discrimina pendências, prazos inválidos e encerramentos',()=>{
 const entries=[task(-1),task(hour,'in_progress'),task(hour,'completed'),task(-1,'cancelled'),{...task(0),due_at:null},{...task(0),due_at:'inválido'}];
 assert.deepEqual(summarizeTasks(entries,now),{open:4,overdue:1,upcoming:1,withoutDeadline:2,done:1});
 assert.deepEqual(summarizeTasks([],now),{open:0,overdue:0,upcoming:0,withoutDeadline:0,done:0});
});

test('exportação inclui apenas contagens e contexto, sem títulos ou atributos pessoais',()=>{
 const entry={...task(hour),title:'NOME FICTÍCIO CONFIDENCIAL',patient_id:'PACIENTE-FICTICIO-123',full_name:'PESSOA FICTÍCIA'};
 const summary=administrativeSummary([entry],now);
 for(const value of [entry.title,entry.patient_id,entry.full_name])assert.equal(summary.includes(value),false);
 assert.match(summary,/Vencem nas próximas 24h \(amostra\): 1/);
 assert.match(summary,/200 tarefas/);
 assert.match(summary,/não indicam urgência clínica/);
 assert.match(administrativeSummary([entry],now+2*hour),/Com prazo ultrapassado \(amostra\): 1/);
});
