from depth import DEPTH
from review_blocks import BLOCKS
import hashlib

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
            block=BLOCKS[(lid[4:],q['key'])]
            add(q['key']+'-scheme','example',q['title']+' — связи и условия',speech=q['takeaway']+' '+block['visual']['caption']+' '+ ' '.join(a+': '+b+'.' for a,b in block['pairs']),visual=block['visual'])
            mid=lid+'-'+q['key']+'-case';scenarios=[]
            for v in block['variants']:
                given=v['given']+' Задача: '+v['rule']
                numeric=bool(__import__('re').fullmatch(r'[−\-]?\d+(?:[,.]\d+)?',v['result']))
                frames=[dict(label='Исходные данные',variables={'Условие':v['given']}),dict(label='Правило решения',variables={'Условие':v['given'],'Правило':v['rule']}),dict(label='Применение правила',variables={'Правило':v['rule'],'Обоснование':v['review']}),dict(label='Вывод и границы',variables={'Результат':v['result'],'Обоснование':v['review']})]
                digits=len(v['result'].replace('.',',').split(',')[1]) if ',' in v['result'] or '.' in v['result'] else 0
                scenarios.append(dict(id=v['id'],title=v['title'],given=given,baseline=block['variants'][0]['given'] if v['id']=='changed' else '',frames=frames,review=v['review']+' Итог: '+v['result']+'.',accepted=[v['result']],discussion=not numeric,precision=digits,hint='Повторите расчёт по приведённому правилу; проверьте единицы и состав исходных данных.'))
            models[mid]=dict(id=mid,lectureId=lid,slideId=mid,title='Кейс: '+q['title'],mode='table',task='Примените правило к данным выбранного случая. Сначала запишите решение и основание, затем сверяйте разбор.',output='Для расчёта укажите искомое число в единицах условия. Для качественного случая сформулируйте вывод и подтвердите его наблюдениями.',scenarios=scenarios)
            case_answer='\n\n'.join(v['title']+'. '+v['given']+'\nПравило: '+v['rule']+'\nРезультат: '+v['result']+'. '+v['review'] for v in block['variants'])
            add(q['key']+'-case','example','Кейс для разбора',speech='Прочитайте оба набора условий на экране. '+q['takeaway']+' Откройте разбор после собственной попытки. Во втором случае назовите изменившееся условие и заново примените правило; не переносите прежний вывод автоматически.',answer=case_answer,learning=dict(id=mid,passport=True))
            check=q['check'];indices=check['correct'] if isinstance(check['correct'],list) else [check['correct']]
            correct='; '.join(check['options'][i] for i in indices)
            prompt=check['prompt'] if len(indices)==1 else check['prompt']+' Выберите один вариант, содержащий полный правильный набор.'
            def task_slide(kind,title,prompt,**fields):
                tid=lid+'-review-'+q['key']+'-'+kind
                task=dict(id=tid,type=kind,prompt=prompt,**fields)
                return tid,task
            option_values=[correct,*block['wrong']]
            rotation=int(hashlib.sha256((lid+q['key']).encode()).hexdigest()[:4],16)%4
            option_values=option_values[rotation:]+option_values[:rotation]
            options=[dict(id='option-'+str(i+1),text=value) for i,value in enumerate(option_values)]
            tid,task=task_slide('single','Один правильный ответ',prompt,options=options)
            keys[tid]=dict(type='single',correct=[options[option_values.index(correct)]['id']],explanation=check['explanation'])
            add(q['key']+'-check','test','Один правильный ответ',speech='Решите новое условие на экране. Выберите один из четырёх вариантов и укажите правило, исключающее остальные.',answer=correct+'. '+check['explanation'],task=task)
            tid,task=task_slide('multiple','Несколько правильных ответов','Выберите два верных утверждения по теме «'+q['title']+'».',choose=2,options=[dict(id='option-'+str(i+1),text=value) for i,value in enumerate(block['multi'])])
            explanation='Верны утверждения: '+block['multi'][0]+' '+block['multi'][1]+' В двух других подменены роли. Правильные связи: '+block['pairs'][2][0]+' — '+block['pairs'][2][1]+'; '+block['pairs'][3][0]+' — '+block['pairs'][3][1]+'.'
            keys[tid]=dict(type='multiple',correct=['option-1','option-2'],explanation=explanation)
            add(q['key']+'-multiple','test','Несколько правильных ответов',speech='Оцените каждое из четырёх утверждений независимо. Выберите два верных. Объясните, почему похожие термины не позволяют подменить роли.',answer=explanation.replace('первые два','два'),task=task)
            prompt,answer,why=block['short'];tid,task=task_slide('short','Краткий ответ',prompt)
            keys[tid]=dict(type='short',accepted=list(dict.fromkeys([answer,answer.replace(',','.'),answer.replace('−','-')])),explanation=why)
            add(q['key']+'-short','test','Краткий ответ',speech='Ответьте без вариантов выбора. Все исходные данные и формат ответа указаны на экране. Перед отправкой проверьте единицу либо точное название термина.',answer=answer+'. '+why,task=task)
            tid,task=task_slide('matching','Сопоставление','Сопоставьте четыре понятия с их значениями. Каждое значение используется один раз.',items=[dict(id='item-'+str(i+1),text=a) for i,(a,b) in enumerate(block['pairs'])],options=[dict(id='option-'+str(i+1),text=b) for i,(a,b) in enumerate(block['pairs'])])
            why='\n'.join(a+' → '+b for a,b in block['pairs'])
            keys[tid]=dict(type='matching',pairs={'item-'+str(i+1):'option-'+str(i+1) for i in range(4)},explanation='Различайте предметные роли:\n'+why)
            add(q['key']+'-matching','test','Сопоставление',speech='Для каждого понятия выберите одно значение. Сначала определите смысл каждой роли, затем проверьте все четыре пары. Сходство слов не заменяет смысловое соответствие.',answer=why,task=task)
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
                c['caseIds']=[s['learning']['id'] for s in slides if s.get('learning')]
    slide_ids={s['id'] for l in course['lectures'] for s in l['slides']}
    task_ids={s['task']['id'] for l in course['lectures'] for s in l['slides'] if s.get('task')}
    model_ids={s['learning']['id'] for l in course['lectures'] for s in l['slides'] if s.get('learning')}
    for values,keep in [(notes,slide_ids),(keys,task_ids),(models,model_ids)]:
        for key in set(values)-keep:del values[key]
