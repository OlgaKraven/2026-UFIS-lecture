async(page)=>{
 const base='http://127.0.0.1:5193/2026-UFIS-lecture/';await page.emulateMedia({media:'screen',reducedMotion:'reduce'});const course=await(await page.request.get(base+'course.json')).json(),bank=await(await page.request.get(base+'assessment.json')).json(),results=[];
 const l=course.lectures[0],selected=[l.slides.find(s=>s.task?.type==='single'),l.slides.find(s=>s.task?.type==='multiple'),l.slides.find(s=>s.task?.type==='short')];
 for(const width of [390,1280]){
  await page.setViewportSize({width,height:width===390?844:720});
  for(const s of selected){
   await page.goto(base+'?lecture='+l.id+'&slide='+s.id);const t=page.locator('.interactive-task'),k=bank.keys[s.task.id];await t.waitFor();
   if(await t.getByRole('button',{name:'Ещё попытка',exact:true}).count())await t.getByRole('button',{name:'Ещё попытка',exact:true}).click();
   if(s.task.type==='short')await t.getByRole('textbox',{name:'Краткий ответ',exact:true}).fill(k.accepted[0]);else for(const id of k.correct)await t.getByText(s.task.options.find(o=>o.id===id).text,{exact:true}).click();
   await t.getByRole('button',{name:'Проверить',exact:true}).click();await t.locator('.task-status.correct').waitFor();await t.getByRole('button',{name:'Разбор ответа',exact:true}).click();await page.getByRole('dialog').getByText(k.explanation,{exact:true}).waitFor();await page.screenshot({path:'output/playwright/ufis-depth/assessment-'+width+'-'+s.task.type+'.png',fullPage:true});await page.keyboard.press('Escape');
   results.push({width,type:s.task.type,result:true,review:true,retry:await t.getByRole('button',{name:'Ещё попытка',exact:true}).isVisible()});
  }
  await page.locator('summary[aria-label="Ещё"]').click();await page.getByRole('button',{name:'Самопроверка',exact:true}).click();await page.getByRole('dialog',{name:'Самопроверка',exact:true}).waitFor();results.push({width,summary:true,groups:await page.locator('.assessment-group').count()});await page.keyboard.press('Escape');
 }
 return results;
}
