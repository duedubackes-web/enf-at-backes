import {test} from 'node:test';import assert from 'node:assert/strict';
import {selectVisits,isVisitOverdue,visitStatusLabel} from '../src/visit-planning.ts';
const now=new Date(2026,10,14,12).getTime();const date=(day,hour)=>new Date(2026,10,day,hour).toISOString();
const visit=(id,at,status='planned',patient_id='p1')=>({id,scheduled_at:at,status,patient_id});
const patients=[{id:'p1',full_name:'Paciente Fictício Á',local_code:'TESTE-01'}];
test('hoje segue o calendário local, inclui realizadas e exclui canceladas',()=>{
 const list=[visit('a',date(14,0)),visit('b',date(14,23),'completed'),visit('c',date(14,10),'cancelled'),visit('d',date(15,0)),visit('e','invalid')];
 assert.deepEqual(selectVisits(list,patients,'today','',now).map(v=>v.id),['a','b']);
 assert.deepEqual(selectVisits(list,patients,'today','',new Date(2026,10,15).getTime()).map(v=>v.id),['d']);
});
test('ultrapassado exige visita prevista e instante estritamente anterior',()=>{
 for(const status of ['completed','cancelled'])assert.equal(isVisitOverdue(visit('a',date(14,10),status),now),false);
 assert.equal(isVisitOverdue(visit('a',new Date(now).toISOString()),now),false);
 assert.equal(isVisitOverdue(visit('a','invalid'),now),false);
 assert.deepEqual(selectVisits([visit('a',date(13,10)),visit('b',date(14,13))],patients,'overdue','',now).map(v=>v.id),['a']);
});
test('busca ignora acentos e espaços externos, aceita código e não inventa paciente',()=>{
 const list=[visit('a',date(14,10)),visit('b',date(14,11),'planned','unloaded')];
 for(const query of [' ficticio a ','teste-01'])assert.deepEqual(selectVisits(list,patients,'all',query,now).map(v=>v.id),['a']);
 assert.equal(selectVisits(list,patients,'all','inexistente',now).length,0);
 assert.equal(selectVisits(list,patients,'all','',now).length,2);
});
test('ordenação é estável, não altera entrada e deixa datas inválidas por último',()=>{
 const list=[visit('invalid','invalid'),visit('b',date(14,11)),visit('a',date(14,11)),visit('done',date(14,10),'completed')];const original=[...list];
 assert.deepEqual(selectVisits(list,patients,'planned','',now).map(v=>v.id),['a','b','invalid']);
 assert.deepEqual(selectVisits(list,patients,'completed','',now).map(v=>v.id),['done']);
 assert.deepEqual(list,original);assert.equal(visitStatusLabel('cancelled'),'Cancelada');assert.equal(visitStatusLabel('unknown'),'Estado não reconhecido');
});
