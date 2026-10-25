async (page)=>{
 const base='http://127.0.0.1:5193/2026-UFIS-lecture/';
 await page.emulateMedia({media:'screen',reducedMotion:'reduce',colorScheme:'light'});await page.setViewportSize({width:1280,height:720});
 const course=await(await page.request.get(base+'course.json')).json(),long=[];
 for(const l of course.lectures)for(const s of l.slides.filter(s=>s.kind==='section'&&s.title.length>65)){
  await page.goto(base+'?lecture='+l.id+'&slide='+s.id);await page.evaluate(()=>document.fonts.ready);
  const r=await page.locator('.slide-frame').evaluate(el=>{const c=el.querySelector('.slide-copy');return {overflow:c.scrollHeight-c.clientHeight,font:getComputedStyle(c.querySelector('h2')).fontSize}});long.push({id:s.id,...r});
  await page.screenshot({path:'output/playwright/ufis-reference/'+s.id+'.png'});
 }
 await page.goto(base+'?lecture=s05-system-boundary&slide=s05-system-boundary-title');
 await page.locator('summary[aria-label="Ещё"]').click();await page.getByLabel('Тема презентации').selectOption('auto');
 await page.emulateMedia({colorScheme:'dark'});await page.locator('html[data-theme="dark"]').waitFor();
 await page.emulateMedia({colorScheme:'light'});await page.locator('html[data-theme="light"]').waitFor();
 await page.getByRole('button',{name:'Самопроверка',exact:true}).click();
 const d=page.getByRole('dialog',{name:'Самопроверка',exact:true});await d.waitFor();
 await d.getByRole('button',{name:'Сбросить результаты курса',exact:true}).click();await d.getByRole('button',{name:'Сбросить',exact:true}).click();
 const groups=await d.locator('.assessment-group').count();await page.screenshot({path:'output/playwright/ufis-reference/after-assessment.png'});
 await d.getByRole('button',{name:/^Начать самопроверку/}).click();await page.locator('.interactive-task').waitFor();
 await page.locator('summary[aria-label="Ещё"]').click();await page.getByRole('button',{name:'Преподаватель',exact:true}).click();
 await page.getByRole('dialog').getByRole('button',{name:'Закрыть окно',exact:true}).click();
 await page.locator('summary[aria-label="Ещё"]:focus').waitFor();
 const menuFocus=await page.locator('summary[aria-label="Ещё"]').evaluate(el=>el===document.activeElement);
 const pending=page.context().waitForEvent('page');await page.getByRole('button',{name:'Начать занятие в двух окнах'}).click();const audience=await pending;
 await page.getByRole('button',{name:'Содержание',exact:true}).click();
 const toc=page.getByRole('dialog');await toc.waitFor();await page.screenshot({path:'output/playwright/ufis-reference/after-outline.png'});
 const destination=course.lectures.find(l=>l.id==='s05-system-boundary').slides.find(s=>s.id==='s05-system-boundary-content-1');
 await toc.getByRole('button').filter({hasText:destination.title}).click();
 await audience.locator('[data-slide-id="s05-system-boundary-content-1"]').waitFor();
 await page.getByRole('button',{name:'Завершить показ',exact:true}).click();await page.locator('.active-slide [data-slide-id="s05-system-boundary-content-1"]').waitFor();
 return {long,autoTheme:true,assessmentGroups:groups,nextTask:true,menuFocus,outlineSync:true,exitPreservesSlide:true};
}
