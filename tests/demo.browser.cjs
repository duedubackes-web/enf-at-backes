const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});
 try{
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:1000}});
  const page=await context.newPage();let databaseRequests=0;
  await page.route('**/*.supabase.co/rest/**',route=>{databaseRequests++;return route.abort()});
  const base=process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:5173/';
  await page.goto(base);await page.getByRole('link',{name:'Ver demonstração'}).click();
  await page.getByRole('heading',{name:'Seu dia, organizado em um só lugar.'}).waitFor();
  const nav=page.getByRole('navigation',{name:'Navegação da demonstração'});
  await nav.getByRole('button',{name:'Tarefas da equipe'}).click();
  await page.getByRole('button',{name:'Concluir tarefa: Conferir materiais da sala de atendimento'}).click();
  await page.getByText('Tarefa atualizada somente nesta demonstração.').waitFor();
  await page.getByRole('button',{name:'Concluídas',exact:true}).click();
  await page.getByRole('button',{name:'Reabrir tarefa: Conferir materiais da sala de atendimento'}).waitFor();
  await nav.getByRole('button',{name:'Visitas domiciliares'}).click();
  await page.getByRole('button',{name:/Marcar visita de Paciente fictício A/}).click();
  await page.getByText('Visita marcada como realizada somente nesta demonstração.').waitFor();
  await nav.getByRole('button',{name:'Pacientes fictícios'}).click();
  await page.getByText('DEMO-003',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Restaurar',exact:true}).click();
  await page.getByRole('heading',{name:'Seu dia, organizado em um só lugar.'}).waitFor();
  await page.getByRole('button',{name:'Abrir tarefas: Conferir materiais da sala de atendimento'}).waitFor();
  if(databaseRequests)throw Error('Demo attempted a database request');
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Horizontal overflow');
  if(process.env.DEMO_SCREENSHOT_DIR)await page.screenshot({path:`${process.env.DEMO_SCREENSHOT_DIR}/demo-${width}.png`,fullPage:true});
  console.log(`PASS demo ${width}px: landing entry, tasks, visits, patients, reset, no database requests, responsive width`);
  await context.close();
 }
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
