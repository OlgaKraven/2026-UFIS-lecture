async(page)=>{
 const base='http://127.0.0.1:5193/2026-UFIS-lecture/';page.setDefaultTimeout(5000);await page.emulateMedia({media:'screen',reducedMotion:'reduce'});
 const course=await(await page.request.get(base+'course.json')).json(),bank=await(await page.request.get(base+'assessment.json')).json(),results=[],issues=[];
 for(const width of [390,1280]){
  await page.setViewportSize({width,height:width===390?844:800});
  for(const type of ['single','multiple','short','matching']){
   const l=course.lectures[0],s=l.slides.find(s=>s.task?.type===type),t=s.task,k=bank.keys[t.id];await page.goto(base+'?lecture='+l.id+'&slide='+s.id);const task=page.locator('.interactive-task');await task.waitFor();
   if(await task.getByRole('button',{name:'Ещё попытка',exact:true}).count())await task.getByRole('button',{name:'Ещё попытка',exact:true}).click();
   if(type==='short')await task.getByRole('textbox',{name:'Краткий ответ',exact:true}).fill(k.accepted[0]);
   else if(type==='matching'){
    for(const item of t.items){const select=task.getByLabel('Соответствие: '+item.text,{exact:true});const order=await select.locator('option').evaluateAll(os=>os.map(o=>o.value));await select.click();await page.keyboard.press('Home');for(let i=0;i<order.indexOf(k.pairs[item.id]);i++)await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');}
   }else for(const id of k.correct)await task.getByText(t.options.find(o=>o.id===id).text,{exact:true}).click();
   await task.getByRole('button',{name:'Проверить',exact:true}).click();await task.locator('.task-status.correct').waitFor();await task.getByRole('button',{name:'Разбор ответа',exact:true}).click();await page.getByRole('dialog').getByText(k.explanation,{exact:true}).waitFor();await page.screenshot({path:`output/playwright/ufis-revision/review-${width}-${type}.png`,fullPage:true});await page.getByRole('dialog').getByRole('button',{name:'Закрыть окно',exact:true}).click();
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);if(overflow>2)issues.push({width,type,overflow});results.push({width,type,correct:true,review:true,keyboard:type==='matching'});
  }
  for(const type of ['network','conceptMap','process','bars','decision','timeline']){
   const l=course.lectures.find(l=>l.slides.some(s=>s.id.endsWith('-scheme')&&s.visual?.type===type)),s=l.slides.find(s=>s.id.endsWith('-scheme')&&s.visual?.type===type);
   for(const theme of ['light','dark']){
    await page.goto(base+'?lecture='+l.id+'&slide='+s.id);await page.locator('.slide-frame').waitFor();await page.locator('summary[aria-label="Ещё"]').click();await page.getByLabel('Тема презентации').selectOption(theme);await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'Развернуть схему',exact:true}).click();await page.getByRole('dialog').waitFor();await page.screenshot({path:`output/playwright/ufis-revision/diagram-${width}-${theme}-${type}.png`,fullPage:true});await page.keyboard.press('Escape');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);if(overflow>2)issues.push({width,type,theme,overflow});results.push({width,type,theme,expanded:true});
   }
  }
 }
 return {results,issues};
}
