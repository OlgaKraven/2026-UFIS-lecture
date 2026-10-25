async(page)=>{
 const base='http://127.0.0.1:5193/2026-UFIS-lecture/',context=page.context();await page.setViewportSize({width:1280,height:800});await page.emulateMedia({reducedMotion:'reduce'});
 const course=await(await page.request.get(base+'course.json')).json(),bank=await(await page.request.get(base+'assessment.json')).json();const results=[],issues=[];
 for(const l of course.lectures.filter(l=>l.semester===5)){
  try{
   for(const p of context.pages())if(p!==page)await p.close();
   const tests=l.slides.filter(s=>s.task),first=tests[0];await page.goto(base+'?lecture='+l.id+'&slide='+first.id);
   const popup=context.waitForEvent('page');await page.getByRole('button',{name:'Начать занятие в двух окнах'}).click();const audience=await popup;
   await audience.locator(`[data-slide-id="${first.id}"]`).waitFor();
   for(const s of tests){
    if(s.id!==first.id){await page.getByRole('button',{name:'Содержание',exact:true}).click();await page.locator('.presenter-outline button').nth(l.slides.indexOf(s)).click();await audience.locator(`[data-slide-id="${s.id}"]`).waitFor();}
    const t=s.task,k=bank.keys[t.id],task=page.locator('.interactive-task'),a=audience.locator('.interactive-task');
    if(await task.getByRole('button',{name:'Ещё попытка',exact:true}).count())await task.getByRole('button',{name:'Ещё попытка',exact:true}).click();
    const choose=async(correct)=>{
     if(t.type==='short'){await task.getByRole('textbox',{name:'Краткий ответ',exact:true}).fill(correct?k.accepted[0]:'ошибочный ответ');return;}
     const ids=correct?k.correct:[t.options.find(o=>!k.correct.includes(o.id)).id,...(t.type==='multiple'?k.correct.slice(0,t.choose-1):[])];
     for(const id of ids)await task.getByText(t.options.find(o=>o.id===id).text,{exact:true}).click();
    };
    await choose(false);await task.getByRole('button',{name:'Проверить',exact:true}).click();await a.locator('.task-status.incorrect').waitFor();
    await task.getByRole('button',{name:'Разбор ответа',exact:true}).click();await audience.getByText(k.explanation,{exact:true}).waitFor();await page.getByRole('dialog').getByRole('button',{name:'Закрыть окно',exact:true}).click();
    await task.getByRole('button',{name:'Ещё попытка',exact:true}).click();await choose(true);await task.getByRole('button',{name:'Проверить',exact:true}).click();await a.locator('.task-status.correct').waitFor();
    results.push({id:t.id,type:t.type,wrong:true,correct:true,review:true,synchronized:true});
   }
   await page.locator('summary[aria-label="Ещё"]').click();await page.getByRole('button',{name:'Самопроверка',exact:true}).click();
   const groups=await page.locator('.assessment-group').count();if(groups!==l.slides.filter(s=>s.kind==='section').length)issues.push({id:l.id,error:'Question grouping mismatch',groups});
   await page.keyboard.press('Escape');await page.getByRole('button',{name:'Завершить показ',exact:true}).click();
  }catch(error){issues.push({id:l.id,error:String(error)});}
 }
 return {count:results.length,results,issues};
}
