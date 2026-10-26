async(page)=>{
 const base='http://127.0.0.1:5193/2026-UFIS-lecture/',context=page.context();await page.setViewportSize({width:1440,height:900});await page.emulateMedia({reducedMotion:'reduce'});
 const course=await(await page.request.get(base+'course.json')).json(),models=await(await page.request.get(base+'workbenches.json')).json(),results=[],issues=[];
 for(const l of course.lectures){
  for(const p of context.pages())if(p!==page)await p.close();const cases=l.slides.filter(s=>s.learning),first=cases[0];
  await page.goto(base+'?lecture='+l.id+'&slide='+first.id);await page.locator('.slide-frame').waitFor();
  const [audience]=await Promise.all([context.waitForEvent('page'),page.getByRole('button',{name:'Начать занятие в двух окнах'}).click()]);await audience.locator(`[data-slide-id="${first.id}"]`).waitFor();
  for(const s of cases){try{
   await page.bringToFront();if(s!==first){await page.getByRole('button',{name:'Содержание',exact:true}).click();await page.locator('.presenter-outline button').nth(l.slides.indexOf(s)).click();}
   await audience.bringToFront();await audience.locator(`[data-slide-id="${s.id}"]`).waitFor();await page.bringToFront();
   const model=models[s.learning.id];await page.getByRole('button',{name:'Разбор задачи',exact:true}).click();
   for(const [i,v] of model.scenarios.entries()){
    const dialog=page.getByRole('dialog');
    if(i){await dialog.getByRole('button',{name:/Сценарий/}).click();await dialog.getByRole('button',{name:v.title,exact:true}).click();}
    for(let j=1;j<v.frames.length;j++)await dialog.getByRole('button',{name:'Далее',exact:true}).click();
    await dialog.getByRole('textbox',{name:'Ваш результат',exact:true}).fill(v.discussion?'Мой вывод по наблюдениям':v.accepted[0]);
    if(!v.discussion){await dialog.getByRole('button',{name:'Проверить',exact:true}).click();await dialog.getByText('Верно. Обоснуйте ответ наблюдаемым состоянием.',{exact:true}).waitFor();}
    await dialog.getByRole('button',{name:'Показать разбор',exact:true}).click();await audience.bringToFront();await audience.getByRole('dialog').getByText(v.review,{exact:true}).waitFor();await page.bringToFront();
    await dialog.getByRole('button',{name:'Скрыть разбор',exact:true}).click();
    results.push({id:model.id,scenario:v.id,steps:v.frames.length,review:true,synchronized:true,numeric:!v.discussion});
   }
   await page.keyboard.press('Escape');await audience.bringToFront();await audience.getByRole('dialog').waitFor({state:'hidden'});await page.bringToFront();
  }catch(e){issues.push({id:s.id,error:String(e)});break;}}
  await page.bringToFront();if(await page.getByRole('button',{name:'Завершить показ',exact:true}).count())await page.getByRole('button',{name:'Завершить показ',exact:true}).click();
 }
 return {count:results.length,results,issues};
}
