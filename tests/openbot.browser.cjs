const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});
 try{
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:1000}});const page=await context.newPage();let apiCalls=0;const modules=[];
  await page.route('**/*.supabase.co/rest/**',route=>{apiCalls++;return route.abort()});
  page.on('request',request=>{if(/\/src\/(NursingCommand|TaskOffice|CarePrograms|KnowledgeCenter)\.tsx/.test(request.url()))modules.push(request.url())});
  await page.goto(new URL('/?demo=1',process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:5173/').href);
  const launcher=page.getByRole('button',{name:'OpenBot',exact:true});await launcher.click();
  const dialog=page.getByRole('dialog',{name:'OpenBot',exact:true});await dialog.waitFor();
  await dialog.getByRole('button',{name:'Resumo das pendências',exact:true}).click();
  await dialog.getByText(/Nos registros carregados: 4 tarefas abertas/).waitFor();
  await dialog.locator('.openbot-actions').getByRole('button',{name:'Tarefas',exact:true}).click();
  await page.getByRole('heading',{name:'Organização do trabalho'}).waitFor();
  await page.getByRole('button',{name:'Concluir tarefa: Conferir materiais da sala de atendimento'}).click();
  await launcher.click();await dialog.getByRole('button',{name:'Resumo das pendências',exact:true}).click();
  await dialog.getByText(/Nos registros carregados: 3 tarefas abertas/).waitFor();
  await dialog.getByRole('textbox',{name:'O que você quer organizar?'}).fill('Qual dose de medicamento?');
  await dialog.getByRole('button',{name:'Enviar pergunta ao OpenBot'}).click();
  await dialog.getByText(/avaliação do profissional responsável/).waitFor();
  await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
  if(!await launcher.evaluate(node=>node===document.activeElement))throw Error('Close focus');
  await launcher.click();
  if(await dialog.getByText(/3 tarefas abertas/).count())throw Error('Old conversation retained after close');
  await dialog.getByRole('button',{name:'Abrir visitas',exact:true}).click();
  await dialog.locator('.openbot-actions').getByRole('button',{name:'Visitas',exact:true}).click();
  await page.getByRole('heading',{name:'Agenda de visitas'}).waitFor();
  if(apiCalls)throw Error('OpenBot attempted database request');
  if(modules.length)throw Error('Inactive modules eagerly loaded');
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Horizontal overflow');
  console.log(`PASS OpenBot ${width}px: summary freshness, navigation, clinical boundary, Escape/focus, ephemeral conversation, no API calls, lazy modules`);
  await context.close();
 }
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
