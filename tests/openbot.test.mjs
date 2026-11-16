import {test} from 'node:test';import assert from 'node:assert/strict';
import {answerOpenBot} from '../src/openbot.ts';
const destinations=['overview','tasks','visits','patients'];
const snapshot={openTasks:4,overdueTasks:2,plannedVisits:3,overdueVisits:1};
test('OpenBot resume apenas contagens e oferece destinos permitidos',()=>{
 const reply=answerOpenBot('Resumo das pendências',snapshot,destinations);
 assert.match(reply.text,/4 tarefas abertas/);assert.match(reply.text,/até 200 registros/);
 assert.deepEqual(reply.actions.map(x=>x.destination),['tasks','visits']);
});
test('OpenBot não inventa números quando consulta falha ou está carregando',()=>{
 assert.match(answerOpenBot('Resumo',null,destinations).text,/ainda não estão disponíveis/);
 const reply=answerOpenBot('Resumo',{...snapshot,openTasks:-1},destinations);
 assert.match(reply.text,/indisponível tarefas abertas/);
});
test('OpenBot direciona navegação sem executar comandos de alteração',()=>{
 for(const question of ['como criar tarefa','concluir tarefa','apagar tarefas']){
  const reply=answerOpenBot(question,snapshot,destinations);
  assert.deepEqual(reply.actions,[{destination:'tasks',label:'Tarefas'}]);
  assert.equal('mutation' in reply,false);
 }
 assert.deepEqual(answerOpenBot('VISITAS DOMICILIARES',snapshot,destinations).actions,[{destination:'visits',label:'Visitas'}]);
});
test('OpenBot limita escopo clínico, entradas longas e módulos ausentes',()=>{
 assert.match(answerOpenBot('Qual dose de medicamento?',snapshot,destinations).text,/avaliação do profissional/);
 assert.match(answerOpenBot('x'.repeat(241),snapshot,destinations).text,/até 240/);
 assert.match(answerOpenBot('Abrir biblioteca',snapshot,destinations).text,/área profissional/);
 assert.match(answerOpenBot('xyz',snapshot,destinations).text,/Experimente/);
 assert.deepEqual(answerOpenBot('Abrir biblioteca',snapshot,['knowledge']).actions,[{destination:'knowledge',label:'Biblioteca'}]);
});
