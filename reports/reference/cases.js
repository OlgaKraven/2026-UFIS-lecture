async (page) => {
 const base='http://127.0.0.1:5193/2026-UFIS-lecture/';
 const course=await (await page.request.get(base+'course.json')).json();
 const models=await (await page.request.get(base+'workbenches.json')).json();
 const context=page.context();let count=0;const results=[];
 for(const lecture of course.lectures.filter(l=>l.semester===5)){
  // Each presentation starts from the actual public launch button.
  for(const p of context.pages())if(p!==page)await p.close();
  const slide=lecture.slides.find(s=>s.learning?.passport);
  await page.goto(base+'?lecture='+lecture.id+'&slide='+slide.id);
  const popup=context.waitForEvent('page');
  await page.getByRole('button',{name:'Начать занятие в двух окнах'}).click();
  const audience=await popup;await audience.locator(`[data-slide-id="${slide.id}"]`).waitFor();
  await page.getByRole('button',{name:'Разбор задачи',exact:true}).click();
  await audience.locator('dialog.lw-dialog[open]').waitFor();
  const dialog=page.locator('dialog.lw-dialog[open]'),ad=audience.locator('dialog.lw-dialog[open]');
  const model=models[slide.learning.id];
  for(const [i,scenario] of model.scenarios.entries()){
   if(i){await dialog.getByRole('button',{name:/^Сценарий:/}).click();await dialog.getByRole('button',{name:scenario.title,exact:true}).click();}
   await ad.locator('.lw-given').filter({hasText:scenario.given}).waitFor();
   if(await ad.locator('.lw-review').count())throw Error('Premature solution '+slide.id);
   await dialog.getByRole('textbox',{name:'Ваш результат'}).fill('ошибочный ответ');
   await dialog.getByRole('button',{name:'Проверить',exact:true}).click();
   await ad.locator('.lw-feedback').waitFor();
   if(!(await ad.locator('.lw-feedback').innerText()).includes('Проверьте'))throw Error('Incorrect-feedback mismatch');
   for(let j=1;j<scenario.frames.length;j++){
    await dialog.getByRole('button',{name:'Далее',exact:true}).click();
    await ad.locator('.lw-step').filter({hasText:'Шаг '+j+' из'}).filter({hasText:scenario.frames[j].label}).waitFor();
   }
   await dialog.getByRole('textbox',{name:'Ваш результат'}).fill(scenario.accepted[0]);
   await dialog.getByRole('button',{name:'Проверить',exact:true}).click();
   await ad.locator('.lw-feedback').filter({hasText:'Верно.'}).waitFor();
   await dialog.getByRole('button',{name:'Показать разбор',exact:true}).click();
   await ad.getByText(scenario.review,{exact:true}).waitFor();
   await dialog.locator('.lw-review').scrollIntoViewIfNeeded();
   await ad.locator('.lw-review').scrollIntoViewIfNeeded();
   if(!await ad.locator('.lw-review').isVisible())throw Error('Review hidden '+slide.id);
   await dialog.getByRole('button',{name:'Скрыть разбор',exact:true}).click();
   if(i===0){await dialog.getByRole('button',{name:'Назад',exact:true}).click();await dialog.getByRole('button',{name:'Далее',exact:true}).click();}
   count++;
  }
  await audience.reload();await audience.locator('dialog.lw-dialog[open]').waitFor();
  if(await audience.locator('.presenter-notes').count())throw Error('Private notes leaked');
  await dialog.getByRole('button',{name:'Закрыть',exact:true}).click();
  await audience.locator('dialog.lw-dialog[open]').waitFor({state:'hidden'});
  const focus=await page.getByRole('button',{name:'Разбор задачи',exact:true}).evaluate(el=>el===document.activeElement);
  if(!focus)throw Error('Focus not restored '+slide.id);
  await page.getByRole('button',{name:'Разбор задачи',exact:true}).click();
  await page.keyboard.press('Escape');
  await audience.locator('dialog.lw-dialog[open]').waitFor({state:'hidden'});
  results.push({id:lecture.id,scenarios:2,synchronized:true,review:true,focus});
 }
 return {count,results};
}
