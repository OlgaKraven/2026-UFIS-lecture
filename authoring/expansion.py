from depth import DEPTH

def expand(course,notes,keys,models,coverage):
    for lecture in course['lectures']:
        if '-lab-' in lecture['id']:continue
        lid=lecture['id'];plan=DEPTH[lid[4:]]
        old={s['id'][len(lid)+1:]:s for s in lecture['slides']}
        slides=[old[k] for k in ['title','literature','additional','materials']]
        def add(suffix,kind,title,body='',speech='',notebook='',answer='',questions='',**extra):
            sid=lid+'-'+suffix
            slide=dict(id=sid,kind=kind,title=title,kicker='')
            if body:slide['body']=body
            if notebook:slide['notebook']=notebook
            slide.update(extra);slides.append(slide)
            notes[sid]=dict(script=speech,preparation='Подготовьте приведённые на экране учебные данные и порядок обсуждения.',notebook=notebook,questions=questions,answer=answer,estimatedSeconds=max(30,round(len((speech+' '+answer).split())*60/115)+(60 if extra.get('task') else 15)))
            return slide
        add('agenda','agenda','Вопросы лекции',speech='В этой лекции последовательно разберём: '+ '; '.join(q['title'] for q in plan['sections'])+'. '+plan['sections'][0]['intro'])
        used=[]
        for qi,q in enumerate(plan['sections'],1):
            suffix='question' if qi==1 else 'question-'+q['key']
            s=add(suffix,'section',q['title'],speech=q['intro'],questions=q['title']);s['kicker']=f'Вопрос {qi}'
            for ci,item in enumerate(q['contents'],1):
                if 'original' in item:
                    n=item['original'];used.append(n)
                    for key in [f'content-{n}',f'diagram-{n}']:
                        if key in old:slides.append(old[key])
                    continue
                key=f"{q['key']}-{ci}"
                add(key,item.get('kind','theory'),item['title'],body=item['body'],speech=item['body'] if item.get('visual') else item['body']+' '+item['speech'],notebook=item.get('notebook',''),answer=item.get('answer',''))
                if item.get('visual'):
                    add(key+'-view','example',item['title']+' — разбор',speech=item['speech'],visual=item['visual'])
            check=q['check'];tid=lid+'-task-'+q['key']+'-check'
            multiple=isinstance(check['correct'],list)
            correct=check['correct'] if multiple else [check['correct']]
            options=[dict(id=f'option-{i+1}',text=v) for i,v in enumerate(check['options'])]
            task=dict(id=tid,type='multiple' if multiple else 'single',prompt=check['prompt'],options=options)
            if multiple:task['choose']=len(correct)
            keys[tid]=dict(type=task['type'],correct=[f'option-{i+1}' for i in correct],explanation=check['explanation'])
            add(q['key']+'-check','test','Проверьте понимание',speech='Прочитайте условия задачи на экране. '+('Выберите '+str(len(correct))+' ответа.' if multiple else 'Выберите один ответ.')+' Сначала сформулируйте основание выбора; после проверки разберём, какое условие исключает остальные варианты.',answer='; '.join(check['options'][i] for i in correct)+'. '+check['explanation'],task=task)
        # Keep stable links to the existing applied case and its two independent tasks.
        slides.extend(old[k] for k in ['case','test','transfer'])
        takeaways=[q['takeaway'] for q in plan['sections']]
        for start in range(0,len(takeaways),4):
            add('summary' if start==0 else 'summary-'+str(start//4+1),'summary','Итоги лекции' if start==0 else 'Итоги: применение и ограничения',speech=' '.join(takeaways[start:start+4]),bullets=takeaways[start:start+4])
        hw=plan['homework']
        add('independent','summary','Самостоятельная работа',body=hw['task']+' '+hw['instructions'],speech=hw['task']+' '+hw['instructions']+' Обсудите способ решения до обращения к преподавательскому ключу.',answer=hw['answer'],bullets=[hw['deliverable']])
        add('audience','questions','Вопросы к аудитории',speech='Обсудим вопросы по порядку. На каждый ответ приведите основание из разобранного примера и назовите условие, при котором вывод изменится.',bullets=[p[0] for p in plan['discussion']],answer='\n\n'.join(a+'\n'+b for a,b in plan['discussion']))
        assert len(used)==len(set(used)),f'Duplicated original content in {lid}'
        expected={int(k.split('-')[1]) for k in old if k.startswith('content-')}
        assert set(used)==expected,(lid,used,expected)
        lecture['slides']=slides
        for c in coverage:
            if c['lectureId']==lid:
                c['slideIds']=[s['id'] for s in slides]
                c['taskIds']=[s['task']['id'] for s in slides if 'task' in s]
                c['questions']=[dict(title=q['title'],outcome=q['takeaway']) for q in plan['sections']]
