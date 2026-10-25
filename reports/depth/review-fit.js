async(page)=>{
 const base='http://127.0.0.1:5193/2026-UFIS-lecture/',ctx=page.context();await page.emulateMedia({media:'screen',reducedMotion:'reduce'});await page.setViewportSize({width:1280,height:720});const course=await(await page.request.get(base+'course.json')).json(),bank=await(await page.request.get(base+'assessment.json')).json(),results=[];
 for(const type of ['single','multiple','short']){
  for(const p of ctx.pages())if(p!==page)await p.close();const candidates=course.lectures.flatMap(l=>l.slides.filter(s=>s.task?.type===type).map(s=>({l,s}))).sort((a,b)=>b.s.task.prompt.length-a.s.task.prompt.length),{l,s}=candidates[0];
  await page.goto(base+'?lecture='+l.id+'&slide='+s.id);const [audience]=await Promise.all([ctx.waitForEvent('page'),page.getByRole('button',{name:'Начать занятие в двух окнах'}).click()]);await audience.setViewportSize({width:1280,height:720});await audience.locator(`[data-slide-id="${s.id}"]`).waitFor();
  const t=page.locator('.interactive-task'),k=bank.keys[s.task.id];await t.waitFor();if(await t.getByRole('button',{name:'Ещё попытка',exact:true}).count())await t.getByRole('button',{name:'Ещё попытка',exact:true}).click();
  if(type==='short')await t.getByRole('textbox',{name:'Краткий ответ',exact:true}).fill(k.accepted[0]);else for(const id of k.correct)await t.getByText(s.task.options.find(o=>o.id===id).text,{exact:true}).click();await t.getByRole('button',{name:'Проверить',exact:true}).click();await audience.bringToFront();await audience.locator('.task-status.correct').waitFor();await page.bringToFront();await t.getByRole('button',{name:'Разбор ответа',exact:true}).click();await audience.bringToFront();await audience.getByText(k.explanation,{exact:true}).waitFor();
  const r=await audience.locator('.slide-copy').evaluate(e=>({overflow:e.scrollHeight-e.clientHeight}));await audience.screenshot({path:'output/playwright/ufis-depth/audience-review-'+type+'.png'});results.push({type,id:s.id,...r});
  await page.bringToFront();await page.keyboard.press('Escape');await page.getByRole('button',{name:'Завершить показ',exact:true}).click();
 }return results;
}
