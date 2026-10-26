async(page)=>{
 const base='http://127.0.0.1:5193/2026-UFIS-lecture/',context=page.context();await page.setViewportSize({width:1280,height:800});await page.emulateMedia({media:'screen',reducedMotion:'reduce',colorScheme:'light'});
 const course=await(await page.request.get(base+'course.json')).json(),pack=await(await page.request.get(base+'teacher-pack.json')).json(),results=[],issues=[];
 for(const l of course.lectures){
  let checked=0;try{
   for(const p of context.pages())if(p!==page)await p.close();await page.goto(base+'?lecture='+l.id+'&slide='+l.slides[0].id);
   const [audience]=await Promise.all([context.waitForEvent('page'),page.getByRole('button',{name:'Начать занятие в двух окнах'}).click()]);
   for(let i=0;i<l.slides.length;i++){
    const s=l.slides[i],n=pack.notes[s.id];await audience.bringToFront();await audience.locator(`[data-slide-id="${s.id}"]`).waitFor();
    await page.bringToFront();await page.locator('.note-reader').filter({hasText:n.script}).waitFor();
    const text=await page.locator('.note-reader').innerText();if(text.replace(/\s+/g,' ').trim()!==n.script.replace(/\s+/g,' ').trim())issues.push({id:s.id,error:'Teacher script mismatch'});
    if(s.id.endsWith('-independent')||s.kind==='questions'){
     await page.locator('.note-tabs').getByRole('tab',{name:'Ответ',exact:true}).click();await page.locator('.note-reader').filter({hasText:n.answer}).waitFor();
     if((await audience.locator('body').innerText()).includes(n.answer))issues.push({id:s.id,error:'Private answer leaked'});
     await page.locator('.note-tabs').getByRole('tab',{name:'Сценарий',exact:true}).click();
    }
    checked++;if(i<l.slides.length-1)await page.locator('.presenter-controls').getByRole('button',{name:'Вперёд',exact:true}).click();
   }
   await page.getByRole('button',{name:'Завершить показ',exact:true}).click();results.push({id:l.id,checked,notes:true,audience:true});
  }catch(e){issues.push({id:l.id,checked,error:String(e)});}
 }
 return {results,issues};
}
