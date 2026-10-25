async(page)=>{
 const base='http://127.0.0.1:5193/2026-UFIS-lecture/';await page.setViewportSize({width:1280,height:720});await page.emulateMedia({media:'screen',reducedMotion:'reduce',colorScheme:'light'});
 const course=await(await page.request.get(base+'course.json')).json(),issues=[],errors=[],results=[];page.on('pageerror',e=>errors.push(e.message));
 for(const l of course.lectures.filter(l=>l.semester===6)){
  await page.goto(base+'?lecture='+l.id+'&slide='+l.slides[0].id);await page.locator('.slide-frame').waitFor();await page.evaluate(()=>document.fonts.ready);
  let checked=0;
  for(let i=0;i<l.slides.length;i++){
   const s=l.slides[i];await page.locator(`[data-slide-id="${s.id}"]`).waitFor();
   const r=await page.locator('.slide-frame').evaluate(el=>{const c=el.querySelector('.slide-copy'),a=el.querySelector('.slide-content');return {width:el.getBoundingClientRect().width,copy:c.scrollHeight-c.clientHeight,content:a.scrollHeight-a.clientHeight,body:document.documentElement.scrollWidth-innerWidth}});
   if(r.width<500||r.copy>4||r.content>4||r.body>2)issues.push({id:s.id,...r});
   if(s.visual||s.kind==='agenda'||s.kind==='questions'||s.id.endsWith('-independent'))await page.screenshot({path:'output/playwright/ufis-depth/'+s.id+'.png'});
   checked++;if(i<l.slides.length-1)await page.getByRole('button',{name:'Вперёд',exact:true}).click();
  }results.push({id:l.id,checked});
 }return {results,issues,errors};
}
