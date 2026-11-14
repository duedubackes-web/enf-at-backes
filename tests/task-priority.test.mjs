import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isDue,isToday,selectTasks} from '../src/task-priority.ts';
const task=(id,due_at,status='pending',title='Conferir escala fictícia')=>({id,due_at,status,title});
const due=new Date(2026,10,11,12).getTime();
const item=task('a',new Date(due).toISOString());
test('a tarefa passa a atrasada apenas após o prazo, sem recarregar os dados',()=>{
 assert.equal(isDue(item,due),false);
 assert.deepEqual(selectTasks([item],'overdue','',due),[]);
 assert.deepEqual(selectTasks([item],'overdue','',due+1),[item]);
});
test('tarefas encerradas nunca geram alerta de atraso',()=>{
 for(const status of ['completed','cancelled'])assert.equal(isDue({...item,status},due+1),false);
 assert.equal(isDue({...item,status:'in_progress'},due+1),true);
});
test('sem prazo ou com prazo inválido não há alerta nem filtro hoje',()=>{
 for(const value of [null,'invalid']){
  const entry=task('b',value);
  assert.equal(isDue(entry,due),false);
  assert.equal(isToday(entry,due),false);
 }
});
test('hoje acompanha a virada do calendário local',()=>{
 const midnight=new Date(2026,10,12).getTime();
 const entry=task('c',new Date(midnight-1).toISOString());
 assert.equal(isToday(entry,midnight-1),true);
 assert.equal(isToday(entry,midnight),false);
 assert.deepEqual(selectTasks([entry],'today','',midnight),[]);
});
test('hoje inclui concluídas e exclui canceladas',()=>{
 const entries=['pending','in_progress','completed','cancelled'].map(status=>({...item,status}));
 assert.equal(selectTasks(entries,'today','',due).length,3);
});
test('busca em português, estados e ordenação preservam a lista original',()=>{
 const entries=[task('none',null),task('late',new Date(due+100).toISOString()),item];
 const original=[...entries];
 assert.deepEqual(selectTasks(entries,'open','ESCALA FICTÍCIA',due).map(t=>t.id),['a','late','none']);
 assert.deepEqual(entries,original);
 assert.deepEqual(selectTasks(entries,'all','inexistente',due),[]);
 assert.equal(selectTasks([{...item,status:'completed'}],'done','',due).length,1);
});

test('busca aceita acentos, caixa e espaços externos sem perder o filtro',()=>{
 const entries=[task('a',null,'pending','Organização fictícia'),task('b',null,'completed','Organização concluída')];
 assert.deepEqual(selectTasks(entries,'open',' ORGANIZACAO ',due).map(t=>t.id),['a']);
 assert.equal(selectTasks(entries,'all','   ',due).length,2);
});
test('estados desconhecidos não entram como abertos nem geram prazo ultrapassado',()=>{
 const entry=task('unknown',new Date(due-1).toISOString(),'unrecognized');
 assert.equal(isDue(entry,due),false);
 assert.deepEqual(selectTasks([entry],'open','',due),[]);
 assert.deepEqual(selectTasks([entry],'all','',due),[entry]);
});
