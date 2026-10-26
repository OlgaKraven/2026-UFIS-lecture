async(page)=>{
 const base='http://127.0.0.1:5193/2026-UFIS-lecture/',course=await(await page.request.get(base+'course.json')).json(),results=[],issues=[];await page.setViewportSize({width:1280,height:800});await page.emulateMedia({reducedMotion:'reduce'});
 for(const l of course.lectures){
  await page.goto(base+'?lecture='+l.id+'&slide='+l.slides[0].id);await page.locator('.slide-frame').waitFor();
  for(const s of l.slides){
   if(s!==l.slides[0])await page.getByRole('button',{name:'Вперёд',exact:true}).click();await page.locator(`[data-slide-id="${s.id}"]`).waitFor();
   const geometry=await page.locator('.slide-copy').evaluate(e=>({overflow:e.scrollHeight-e.clientHeight,widthOverflow:e.scrollWidth-e.clientWidth}));
   if(geometry.overflow>4||geometry.widthOverflow>4)issues.push({id:s.id,...geometry});
   if(s.visual){
    const over=await page.locator('.rd-body svg').evaluateAll(svgs=>svgs.flatMap(svg=>{const vb=svg.viewBox.baseVal;return Array.from(svg.querySelectorAll('text')).flatMap(e=>{const b=e.getBBox();return b.x<vb.x-3||b.y<vb.y-3||b.x+b.width>vb.x+vb.width+3||b.y+b.height>vb.y+vb.height+3?[{text:e.textContent,b:{x:b.x,y:b.y,width:b.width,height:b.height},viewBox:{x:vb.x,y:vb.y,width:vb.width,height:vb.height}}]:[]})}));
    if(over.length)issues.push({id:s.id,svgOverflow:over});
    if(s.id.endsWith('-scheme'))await page.screenshot({path:'output/playwright/ufis-revision/'+s.id+'.png'});
   }
   results.push(s.id);
  }
 }
 return {count:results.length,results,issues};
}
