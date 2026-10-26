async(page)=>{
 await page.setViewportSize({width:1280,height:800});await page.emulateMedia({reducedMotion:'reduce'});
 const base='http://127.0.0.1:5193/2026-UFIS-lecture/';const course=await(await page.request.get(base+'course.json')).json();
 const results=[];
 for(const type of ['conceptMap','process','network','bars','timeline','decision']){
  const l=course.lectures.find(l=>l.slides.some(s=>s.visual?.type===type&&s.id.endsWith('-scheme'))),s=l.slides.find(s=>s.visual?.type===type&&s.id.endsWith('-scheme'));
  await page.goto(base+'?lecture='+l.id+'&slide='+s.id);await page.locator('.slide-frame').waitFor();await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:'output/playwright/ufis-revision/smoke-'+type+'.png'});
  results.push({id:s.id,type,copy:await page.locator('.slide-copy').evaluate(e=>({height:e.clientHeight,scroll:e.scrollHeight})),svg:await page.locator('.rd-body svg').boundingBox()});
 }
 return results;
}
