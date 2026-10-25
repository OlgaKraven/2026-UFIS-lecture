async (page) => {
 const base='http://127.0.0.1:5193/2026-UFIS-lecture/';const results=[];
 for(const semester of [5,6]){
  await page.goto(base+'?mode=print&scope=semester-'+semester);
  await page.locator('.print-page').first().waitFor();
  await page.evaluate(()=>document.fonts.ready);
  await page.emulateMedia({media:'print'});
  const issues=await page.locator('.slide-frame').evaluateAll(elements=>elements.flatMap(el=>{
   const copy=el.querySelector('.slide-copy');return copy.scrollHeight>copy.clientHeight+4?[{id:el.dataset.slideId,overflow:copy.scrollHeight-copy.clientHeight}]:[];
  }));
  await page.pdf({path:'output/playwright/ufis-depth/semester-'+semester+'.pdf',printBackground:true,preferCSSPageSize:true});
  results.push({semester,pages:await page.locator('.print-page').count(),issues});
 }
 return results;
}
