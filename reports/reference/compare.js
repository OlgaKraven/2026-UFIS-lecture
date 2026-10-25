async(page)=>{
 await page.setViewportSize({width:1280,height:800});const out=[];
 for(const [label,port,repo] of [['reference',5194,'2026-OKFKS-lecture'],['before',5193,'2026-UFIS-lecture']]){
  const base=`http://127.0.0.1:${port}/${repo}/`;
  const course=await(await page.request.get(base+'course.json')).json();const l=course.lectures[0];
  for(const [name,s] of [['title',l.slides[0]],['question',l.slides.find(s=>s.kind==='section')],['notebook',l.slides.find(s=>s.notebook)],['case',l.slides.find(s=>s.learning||s.visual?.type==='questionPassport')||l.slides.find(s=>s.kind==='test')]]){
   if(!s)continue;await page.goto(base+`?lecture=${l.id}&slide=${s.id}`);await page.locator('.slide-frame').waitFor();await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`output/playwright/ufis-reference/${label}-${name}.png`});
  }
  out.push({label,head:course.contentVersion});
 }
 return out;
}
