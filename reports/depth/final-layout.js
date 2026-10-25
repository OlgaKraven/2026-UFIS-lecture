async(page)=>{
 const base='http://127.0.0.1:5193/2026-UFIS-lecture/',course=await(await page.request.get(base+'course.json')).json(),issues=[],results=[];await page.emulateMedia({media:'screen',reducedMotion:'reduce'});await page.setViewportSize({width:1280,height:720});
 for(const l of course.lectures)for(const s of l.slides.filter(s=>s.kind==='questions'||s.id.endsWith('-independent')||s.id.startsWith('s05-reference-library-records-'))){
  await page.goto(base+'?lecture='+l.id+'&slide='+s.id);await page.locator('.slide-frame').waitFor();await page.evaluate(()=>document.fonts.ready);
  const r=await page.locator('.slide-copy').evaluate(e=>({overflow:e.scrollHeight-e.clientHeight}));if(r.overflow>4)issues.push({id:s.id,...r});results.push(s.id);await page.screenshot({path:'output/playwright/ufis-depth/final-'+s.id+'.png'});
 }
 for(const width of [1024,390]){
  await page.setViewportSize({width,height:width===390?844:768});
  for(const theme of ['light','dark']){
   await page.goto(base+'?lecture=s05-system-boundary&slide=s05-system-boundary-agenda');await page.locator('summary[aria-label="Ещё"]').click();await page.getByLabel('Тема презентации').selectOption(theme);await page.keyboard.press('Escape');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);if(overflow>2)issues.push({width,theme,overflow});await page.screenshot({path:'output/playwright/ufis-depth/agenda-'+width+'-'+theme+'.png',fullPage:true});
  }
 }
 return {checked:results.length,ids:results,issues};
}
