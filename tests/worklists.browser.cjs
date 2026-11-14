const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});
 try{
 for(const width of [390,1280]){
  const page=await browser.newPage({viewport:{width,height:1000}});
  await page.route('**/src/supabase.ts',route=>route.fulfill({contentType:'application/javascript',body:'export const configured=false; export const supabase=null;'}));
  await page.goto(process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:5173/');
  await page.evaluate(async()=>{
   const R=await import('/node_modules/.vite/deps/react.js');const React=R.default||R;
   const D=await import('/node_modules/.vite/deps/react-dom_client.js');const {createRoot}=D.default||D;
   const {default:Tasks}=await import('/src/TasksList.tsx');
   document.body.innerHTML='<main><section class="panel"><h2>Tarefas da equipe</h2><div id="test-root"></div></section></main>';
   const at=new Date();at.setHours(10,0,0,0);
   const root=createRoot(document.getElementById('test-root'));
   const props={tasks:[{id:'open',title:'Organização fictícia',status:'pending',due_at:at.toISOString()},{id:'done',title:'Conferência fictícia',status:'completed',due_at:null},{id:'cancelled',title:'Cancelada fictícia',status:'cancelled',due_at:null},{id:'unknown',title:'Estado desconhecido fictício',status:'unknown',due_at:'invalid'}],canEdit:true,busy:false,onClearSelection:()=>{},onBackToAgenda:()=>{},onSetStatus:(id,status)=>{document.body.dataset.action=JSON.stringify({id,status})}};
   window.renderTasks=extra=>root.render(React.createElement(Tasks,{...props,...extra}));window.renderTasks({});
  });
  await page.getByRole('button',{name:'Todas',exact:true}).waitFor();
  if(await page.locator('.worklist-list li').count()!==1)throw Error('Open default');
  await page.getByRole('searchbox',{name:'Buscar tarefas por título'}).fill(' ORGANIZACAO ');
  if(await page.locator('.worklist-list li').count()!==1)throw Error('Accent search');
  await page.getByRole('button',{name:'Concluir tarefa: Organização fictícia'}).click();
  if(await page.locator('body').getAttribute('data-action')!==JSON.stringify({id:'open',status:'completed'}))throw Error('Complete callback');
  await page.getByRole('searchbox').fill('inexistente');await page.getByText('Nenhuma tarefa corresponde à busca e ao filtro.').waitFor();
  await page.getByRole('button',{name:'Ver todas as tarefas carregadas'}).click();
  if(await page.locator('.worklist-list li').count()!==4)throw Error('Reset');
  if(await page.locator('.worklist-list button').count()!==2)throw Error('Cancelled/unknown action guard');
  await page.getByRole('button',{name:'Concluídas',exact:true}).click();
  await page.getByRole('button',{name:'Reabrir tarefa: Conferência fictícia'}).click();
  if(await page.locator('body').getAttribute('data-action')!==JSON.stringify({id:'done',status:'pending'}))throw Error('Reopen callback');
  await page.evaluate(()=>window.renderTasks({selectedId:'open'}));
  await page.getByText('Tarefa aberta pela agenda do dia.').waitFor();
  if(await page.locator('.worklist-list li').count()!==1)throw Error('Selection override');
  if(!await page.evaluate(()=>document.activeElement.classList.contains('record-focus')))throw Error('Selected keyboard focus');
  await page.evaluate(()=>window.renderTasks({canEdit:false}));
  await page.waitForFunction(()=>document.querySelectorAll('.worklist-list button').length===0);
  await page.evaluate(()=>window.renderTasks({busy:true,selectedId:'open'}));
  await page.getByRole('button',{name:'Concluir tarefa: Organização fictícia'}).waitFor();
  if(!await page.getByRole('button',{name:'Concluir tarefa: Organização fictícia'}).isDisabled())throw Error('Busy guard');
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Horizontal overflow');
  console.log(`PASS ${width}px: task filters, search, complete/reopen callbacks, selection, cancelled/unknown/viewer/busy guards`);
  await page.close();
 }
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
