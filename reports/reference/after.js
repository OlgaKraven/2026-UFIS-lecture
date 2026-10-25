async(page)=>{
 const base='http://127.0.0.1:5193/2026-UFIS-lecture/';await page.setViewportSize({width:1280,height:800});
 for(const [name,id] of [['title','title'],['question','question'],['notebook','content-1'],['case','case'],['short','transfer']]){
  await page.goto(base+`?lecture=s05-system-boundary&slide=s05-system-boundary-${id}`);await page.locator('.slide-frame').waitFor();await page.screenshot({path:`output/playwright/ufis-reference/after-${name}.png`});
 }
 await page.goto(base+'?lecture=s05-system-boundary&slide=s05-system-boundary-case');
 const popup=page.context().waitForEvent('page');await page.getByRole('button',{name:'Начать занятие в двух окнах'}).click();const audience=await popup;await audience.locator('.slide-frame').waitFor();
 await page.screenshot({path:'output/playwright/ufis-reference/after-presenter.png'});
 await page.locator('summary[aria-label="Ещё"]').click();await page.getByRole('combobox',{name:'Тема презентации'}).selectOption('dark');
 await audience.locator('html[data-theme=dark]').waitFor();await page.keyboard.press('Escape');
 await page.screenshot({path:'output/playwright/ufis-reference/after-presenter-dark.png'});
 return {twoColumns:await page.locator('.presenter-grid').evaluate(e=>getComputedStyle(e).gridTemplateColumns),themeSynchronized:true};
}
