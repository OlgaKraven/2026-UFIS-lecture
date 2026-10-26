async(page)=>{
 const base='http://127.0.0.1:5193/2026-UFIS-lecture/',context=page.context();page.setDefaultTimeout(5000);await page.setViewportSize({width:1440,height:900});await page.emulateMedia({reducedMotion:'reduce'});
 const course=await(await page.request.get(base+'course.json')).json(),bank=await(await page.request.get(base+'assessment.json')).json(),results=[],issues=[];
 for(const l of course.lectures){
  for(const p of context.pages())if(p!==page)await p.close();
  const tests=l.slides.filter(s=>s.task),first=tests[0];await page.goto(base+'?lecture='+l.id+'&slide='+first.id);await page.locator('.slide-frame').waitFor();
  if(await page.getByRole('dialog').count())await page.getByRole('dialog').getByRole('button',{name:'Закрыть окно',exact:true}).click();
  const [audience]=await Promise.all([context.waitForEvent('page'),page.getByRole('button',{name:'Начать занятие в двух окнах'}).click()]);
  await audience.locator(`[data-slide-id="${first.id}"]`).waitFor();
  for(const s of tests){try{
   await page.bringToFront();
   if(s!==first){await page.getByRole('button',{name:'Содержание',exact:true}).click();await page.locator('.presenter-outline button').nth(l.slides.indexOf(s)).click();}
   await audience.bringToFront();await audience.locator(`[data-slide-id="${s.id}"]`).waitFor();await page.bringToFront();
   if(await page.getByRole('dialog').count())await page.getByRole('dialog').getByRole('button',{name:'Закрыть окно',exact:true}).click();
   const t=s.task,k=bank.keys[t.id],task=page.locator('.interactive-task'),a=audience.locator('.interactive-task');
   if(await task.getByRole('button',{name:'Ещё попытка',exact:true}).count())await task.getByRole('button',{name:'Ещё попытка',exact:true}).click();
   const choose=async(correct)=>{
    if(t.type==='short'){await task.getByRole('textbox',{name:'Краткий ответ',exact:true}).fill(correct?k.accepted[0]:'ошибочный ответ');return;}
    if(t.type==='matching'){
     const selects=task.locator('select');
     for(let i=0;i<await selects.count();i++){const select=selects.nth(i),label=await select.getAttribute('aria-label'),item=t.items.find(x=>label===`Соответствие: ${x.text}`);if(!item)throw Error('Cannot identify matching row '+label);
      await select.selectOption(correct?k.pairs[item.id]:t.options.find(o=>o.id!==k.pairs[item.id]).id);
     }return;
    }
    const ids=correct?k.correct:[t.options.find(o=>!k.correct.includes(o.id)).id,...(t.type==='multiple'?k.correct.slice(0,t.choose-1):[])];
    for(const id of ids)await task.getByText(t.options.find(o=>o.id===id).text,{exact:true}).click();
   };
   await choose(false);await task.getByRole('button',{name:'Проверить',exact:true}).click();await task.locator('.task-status.incorrect').waitFor();
   await audience.bringToFront();await a.locator('.task-status.incorrect').waitFor();await page.bringToFront();
   await task.getByRole('button',{name:'Разбор ответа',exact:true}).click();await audience.bringToFront();await audience.getByText(k.explanation,{exact:true}).waitFor();await page.bringToFront();await page.getByRole('dialog').getByRole('button',{name:'Закрыть окно',exact:true}).click();
   await task.getByRole('button',{name:'Ещё попытка',exact:true}).click();await choose(true);await task.getByRole('button',{name:'Проверить',exact:true}).click();await task.locator('.task-status.correct').waitFor();
   await audience.bringToFront();await a.locator('.task-status.correct').waitFor();await page.bringToFront();
   results.push({id:t.id,type:t.type,wrong:true,correct:true,review:true,synchronized:true});
  }catch(e){issues.push({id:s.id,error:String(e)});await page.screenshot({path:'output/playwright/ufis-revision/task-failure.png'});return {count:results.length,results,issues};}}
  await page.bringToFront();if(await page.getByRole('button',{name:'Завершить показ',exact:true}).count())await page.getByRole('button',{name:'Завершить показ',exact:true}).click();
 }
 return {count:results.length,results,issues};
}
