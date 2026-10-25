import assert from 'node:assert/strict';
export function validateNarrative(lecture,outline){
 const sections=lecture.slides.filter(s=>s.kind==='section');
 assert.ok(outline.questions?.length>1,lecture.id+': missing authored question structure');
 assert.deepEqual(sections.map(s=>s.title),outline.questions.map(q=>q.title),lecture.id+': questions do not match the authored plan');
 const agenda=lecture.slides.findIndex(s=>s.kind==='agenda');
 assert.ok(agenda>0&&agenda<lecture.slides.indexOf(sections[0]),lecture.id+': agenda must precede questions');
 assert.equal(lecture.slides.at(-1).kind,'questions',lecture.id+': discussion must conclude the lecture');
 assert.equal(lecture.slides.at(-1).title,'Вопросы к аудитории');
 assert.ok(!lecture.slides.some(s=>s.title==='Итог и самостоятельная работа'),lecture.id+': mixed conclusion');
 for(let i=0;i<sections.length;i++){
  const start=lecture.slides.indexOf(sections[i]),end=i+1<sections.length?lecture.slides.indexOf(sections[i+1]):lecture.slides.findIndex((s,n)=>n>start&&s.kind==='summary');
  const block=lecture.slides.slice(start+1,end);
  assert.ok(block.some(s=>s.kind==='theory'&&s.body),sections[i].id+': missing explanation');
  assert.ok(block.some(s=>s.kind==='example'||s.visual),sections[i].id+': missing application');
  assert.ok(block.some(s=>s.task),sections[i].id+': missing check');
 }
}
