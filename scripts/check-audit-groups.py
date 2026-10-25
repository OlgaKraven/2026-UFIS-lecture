"""Regression: question boundaries follow kind, including IDs without a Q-number."""
from pathlib import Path
import tempfile,json
from audit_gate import inventory
with tempfile.TemporaryDirectory(prefix='ufis-audit-') as location:
 root=Path(location)
 slides=[dict(id='lesson-'+key,kind=kind,title=key) for key,kind in [('title','title'),('first-topic','section'),('a','theory'),('second-topic','section'),('b','theory'),('summary','summary'),('audience','questions')]]
 course=dict(id='fixture',contentVersion='1',lectures=[dict(id='lesson',slides=slides)])
 pack=dict(courseId='fixture',contentVersion='1',notes={s['id']:dict(script='A visible explanation') for s in slides})
 for name,value in [('course.json',course),('pack.json',pack)]:
  (root/name).write_text(json.dumps(value),encoding='utf-8',newline='\n')
 (root/'runtime.txt').write_text('fixture',encoding='utf-8')
 result=inventory(root,'course.json','pack.json',['runtime.txt'])
 assert [u['id'] for u in result['units']]==['lesson:intro','lesson:first-topic','lesson:second-topic','lesson:closing']
 assert result['units'][-1]['slideIds']==['lesson-summary','lesson-audience']
print('Question boundaries and closing block verified without ID convention')
