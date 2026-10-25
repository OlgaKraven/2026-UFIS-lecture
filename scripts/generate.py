from pathlib import Path
import sys,json,hashlib,math,re

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'authoring'))
from topics import TOPICS
import reliability,labs

def load(name):return json.loads((ROOT/name).read_text(encoding='utf-8'))
def put(name,data):
    p=ROOT/name;p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
def book(citation,url):return dict(citation=citation,url=url)
ARCH=book('Алексахин А. Н., Вершинина Н. М., Джебилов А. В. и др. Архитектура вычислительных систем и компьютерных сетей / под ред. А. М. Нечаева, Н. М. Вершининой, Е. В. Устинова. Москва: Университет «Синергия», 2025. 436 с. ISBN 978-5-4257-0681-2.','https://www.iprbookshop.ru/books/156708/details')
SYSTEMS=book('Цехановский В. В., Водяхо А. И. Проектирование информационных систем: архитектуры и платформы. Москва: Ай Пи Ар Медиа, 2023. 240 с. ISBN 978-5-4497-1786-3.','https://www.iprbookshop.ru/books/123568/details')
QUALITY=book('Юсупова С. М. Управление качеством. Москва: Ай Пи Ар Медиа, 2026. 301 с. ISBN 978-5-4497-5034-1.','https://www.iprbookshop.ru/books/156513/details')
NIST=book('NIST/SEMATECH e-Handbook of Statistical Methods. Assessing Product Reliability: модели времени до отказа и надёжности систем.','https://www.itl.nist.gov/div898/handbook/apr/section1/apr1.htm')
SOURCES={
 'architecture':(ARCH,book('Microsoft Learn. Test-NetConnection: проверка TCP и маршрута.','https://learn.microsoft.com/en-us/powershell/module/nettcpip/test-netconnection')),
 'systems':(SYSTEMS,ARCH),
 'quality':(QUALITY,book('1С:ERP. Производство, обеспечение потребностей и управление качеством.','https://v8.1c.ru/erp/')),
 'library':(SYSTEMS,book('Koha Manual. Каталогизация, экземпляры и обращение фонда.','https://koha-community.org/manual/latest/en/html/using-koha.html')),
 'building':(ARCH,book('BACnet International. Building Automation and Control Network.','https://bacnetinternational.org/')),
 'video':(ARCH,book('ONVIF. Profile G: запись, поиск и воспроизведение.','https://www.onvif.org/profiles/profile-g/')),
 'network':(ARCH,book('Microsoft Learn. Ping и Test-NetConnection: возможности и границы диагностики.','https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ping')),
 'reliability':(NIST,book('NASA. Inherent Availability and Reliability with Constant Failure and Repair Rates.','https://www.nasa.gov/wp-content/uploads/2023/11/170508-formulas-inherent-availability-and-reliability-with-constant-failure-and-repair-rates.pdf')),
 'integrity':(SYSTEMS,book('Google SRE. Data Integrity: What You Read Is What You Wrote.','https://sre.google/sre-book/data-integrity/')),
 'performance':(ARCH,book('Google SRE. Monitoring Distributed Systems: задержка, трафик, ошибки, насыщение.','https://sre.google/sre-book/monitoring-distributed-systems/')),
}
SOURCE_TOPICS=[
'Информационная система как комплекс: техническое, программное, информационное, организационное и правовое обеспечение. Границы системы',
'Базовая структура информационной системы: рабочие места, сеть, серверы, хранилище, периферийное оборудование',
'Классификация информационных систем по назначению, масштабу и способу размещения',
'Информационные системы учёта и материально-технического снабжения: назначение, состав, особенности эксплуатации',
'Информационные системы управления производством и качеством: назначение, состав, особенности эксплуатации',
'Справочно-информационные и библиотечные системы: назначение, состав, особенности эксплуатации',
'Системы управления зданием и многозонным мультимедийным пространством: состав оборудования, особенности эксплуатации',
'Оборудование системной интеграции: коммутационное, отображающее, звуковое, видеонаблюдения. Схема подключения',
'Локальная сеть информационной системы: топология, активное оборудование, адресация. Состав проверок, выполняемых эксплуатирующим персоналом',
'Документация на информационную систему: состав комплекта, паспорт системы, схемы, инструкции',
'Надёжность информационной системы: основные понятия, отказ, восстановление, наработка. Основания для расчёта надёжности',
'Единичные показатели надёжности: вероятность безотказной работы, наработка на отказ, среднее время восстановления. Порядок расчёта',
'Комплексные показатели: коэффициент готовности, коэффициент технического использования. Порядок расчёта',
'Надёжность системы из нескольких элементов: последовательное и параллельное соединение, резервирование. Порядок расчёта',
'Достоверность информации в системе: источники искажений, показатели достоверности, методы контроля',
'Производительность информационной системы: показатели, порядок измерения, выявление узкого места',
'Повышение надёжности: резервирование, отказоустойчивость, регламентное обслуживание. Обоснование выбора меры по результатам расчёта']

course=dict(schemaVersion=1,contentVersion='1.0.0',id='ufis',code='МДК.06.03',discipline='Устройство и функционирование информационной системы',heroTitle='Устройство и функционирование',heroAccent='информационной системы',slogan='МДК.06.03',mascot='brand/rhino-ufis.png',mascotAlt='Носорог проверяет соединение коммутатора и серверного оборудования',logo='brand/synergy-wordmark.jpg',mark='brand/synergy-mark.png',ornament='brand/side-ornament.png',font='fonts/raleway-cyrillic.woff2',materialsUrl='https://disk.yandex.ru/d/2vxjVFzQ5k5NdQ',topicArrow='brand/topic-arrow.webp',demo=False,semesters=[5,6],lectures=[],literature=dict(primary=[ARCH,SYSTEMS],additional=[QUALITY,NIST]))
notes={};keys={};models={};explanations={};coverage=[];source_index=0
course['assessment']=dict(mode='autonomous',url='assessment.json')
for n,t in enumerate(TOPICS):
    lab=t.get('category')=='laboratory'
    lid=f"s{t['semester']:02d}-{'lab-' if lab else ''}{t['slug'].removeprefix('lab-')}"
    source=t['title'] if lab else SOURCE_TOPICS[source_index]
    if not lab:source_index+=1
    lecture=dict(id=lid,title=t['title'],sourceTitle=source,semester=t['semester'],question=t['question'],slides=[])
    def add(suffix,kind,title,script,body='',notebook='',answer='',**extra):
        sid=lid+'-'+suffix
        s=dict(id=sid,kind=kind,title=title,kicker='Вопрос 1' if kind=='section' else '')
        if body:s['body']=body
        if notebook:s['notebook']=notebook
        s.update(extra);lecture['slides'].append(s)
        # Timing is an estimate based on the actual text, not an official lesson duration.
        estimated=max(20,round((len((script+' '+answer).split())/115)*60)+(90 if s.get('task') or s.get('learning',{}).get('passport') else 15))
        notes[sid]=dict(script=script,preparation='Учебные данные этой темы; используйте только разрешённый стенд.' if lab else 'Прочитайте исходные данные примера и проверьте принятые ограничения.',notebook=notebook,questions=t['question'] if kind=='section' else '',answer=answer,estimatedSeconds=estimated)
        return s
    add('title','title',t['title'],t['intro'])
    refs=SOURCES[t['reading']]
    add('literature','literature','Основная литература','Этот источник нужен для понятий и устройства систем. Сначала используйте объяснение и учебные примеры темы; доступ к полному тексту книги может требовать учётную запись библиотеки.',readingGroup='primary',references=[refs[0]])
    add('additional','literature','Дополнительные источники','В дополнительном источнике проверяйте детали соответствующего механизма. Документация конкретного оборудования имеет приоритет для его настройки; не переносите параметры другого устройства без проверки.',readingGroup='additional',references=[refs[1]])
    add('materials','materials','Материалы','Ссылка открывает папку дисциплины. Условия всех заданий этой темы приведены на слайдах, поэтому выполнение не зависит от наличия файлов во внешней папке.',**(dict(resourceUrl='labs/passport.html',resourceLabel='Паспорт системы — шаблон') if t['slug']=='lab-passport' else {}))
    add('question','section',t['question'],t['intro']+' '+('Сначала изучите условия и выполните работу самостоятельно, затем сверяйте разбор.' if lab else 'Проследим объяснение и проверим вывод на изменённых условиях.'))
    for i,c in enumerate(t['contents']):
        content=dict(c);title=content.pop('title');body=content.pop('body');speech=content.pop('speech');notebook=content.pop('notebook','');visual=content.pop('visual',None)
        answer='';extra={}
        if lab and i==len(t['contents'])-1:
            # The report criteria stay visible; worked keys become a separate reveal action.
            answer=body+'\n\n'+speech
            body='Сдайте исходные данные, последовательность действий, наблюдения, расчёты или схему, обоснованный вывод и границы проверки. Выполненные действия отличайте от предложенного плана.'
            speech='Завершите самостоятельную попытку и соберите отчёт. Сверьте единицы, исходные условия и конечный результат. Разбор откройте отдельной командой после обсуждения.'
            solution_id=lid+'-report-solution';extra['practice']=dict(solutionId=solution_id);explanations[solution_id]=answer
        if visual:
            # Explanatory prose is a separate readable screen immediately before its diagram.
            add(f'content-{i+1}','theory',title,body,body=body,notebook=notebook,answer=answer,**extra)
            add(f'diagram-{i+1}','example',title+' — схема',speech,visual=visual)
        else:add(f'content-{i+1}','example' if not lab and title.startswith('Разбор:') else 'theory',title,speech,body=body,notebook=notebook,answer=answer,**extra)
    case=t['case'];mid=lid+'-case'
    variants=[]
    for vi,v in enumerate(case['variants']):
        frames=[dict(label='Исходные условия',variables={'Дано':v['given'],'Состояние':'Разбор не начат'})]
        previous={}
        for label,value in v['steps']:
            previous={**previous,label:value}
            frames.append(dict(label=label,variables=previous.copy()))
        frames.append(dict(label='Вывод и его границы',variables={**previous,'Результат':v['result']}))
        review='Исходные условия: '+v['given']+'\n\n'+'\n'.join(f'{j+1}. {label}: {value}.' for j,(label,value) in enumerate(v['steps']))+'\n\n'+v['review']
        variants.append(dict(id=f'case-{vi+1}',title=v['title'],given=v['given'],frames=frames,review=review,accepted=v['accepted'],hint='Проверьте исходные условия, единицы и последнее выполненное действие. Полный разбор доступен отдельной кнопкой.'))
    models[mid]=dict(id=mid,title=re.sub(r'^Лабораторная работа № \d+\. ','',t['title']),mode='table',task=case['task'],output=case['output'],scenarios=variants)
    case_answer='\n\n'.join(v['title']+'. '+v['given']+'\n'+'\n'.join(f'{j+1}. {a}: {b}.' for j,(a,b) in enumerate(v['steps']))+'\nИтог: '+v['result']+'. '+v['review'] for v in case['variants'])
    add('case','example',models[mid]['title'],
        'Откройте задачу. Прочитайте условия выбранного случая, запишите решение и обоснование до показа полного разбора. Сравните оба случая и укажите, какое изменение данных повлияло на ответ.',
        answer=case_answer,learning=dict(id=mid,passport=True))
    q=t['quiz'];tid=lid+'-test-single'
    task=dict(id=tid,type='single',prompt=q['prompt'],options=[dict(id=f'option-{i+1}',text=txt) for i,txt in enumerate(q['options'])])
    key=dict(type='single',correct=[f"option-{q['correct']+1}"],explanation=q['explanation'])
    keys[tid]=key
    add('test','test','Самопроверка',
        'Прочитайте вопрос и выберите один ответ. Перед проверкой объясните, на какое наблюдение или правило вы опираетесь. После попытки обсудим, почему остальные варианты не подтверждают нужный результат.',
        answer=q['options'][q['correct']]+'. '+q['explanation'],task=task)
    # An independent short task takes its condition from the changed case, not the worked slide.
    v=case['variants'][1];tid2=lid+'-test-short'
    task2=dict(id=tid2,type='short',prompt=v['given']+' '+case['task']+' '+case['output'])
    keys[tid2]=dict(type='short',accepted=v['accepted'],explanation=v['review'])
    add('transfer','test','Проверка изменённого случая',
        'Условия изменились. Сначала решите заново, не переносите автоматически прежний ответ. Запишите требуемую величину или решение в указанной форме; полный ответ обсуждаем после проверки.',
        answer=v['result']+'. '+v['review'],task=task2)
    summary=q['explanation'] if not lab else 'Сопоставьте результат с исходным заданием. Укажите фактические наблюдения, проверенные выводы и то, что потребует дополнительного стенда или данных.'
    if t['slug']=='improvement':summary+=' Промежуточная аттестация — зачёт с оценкой. Для подготовки решите расчётные задачи по надёжности и объясните условия применения формул.'
    add('summary','summary','Отчёт и итоговая проверка' if lab else 'Итог и самостоятельная работа',
        ('Завершите отчёт и подготовьтесь объяснить каждый переход от исходных данных к выводу. При анализе без оборудования отметьте ограничение практической проверки.' if lab else 'Ответ на главный вопрос темы опирается на следующие основания. '+q['explanation']+' В самостоятельном случае изменились условия: '+v['given']+' Объясните, почему при этих условиях получается другое решение или число.')+' Свяжите вывод с вопросом темы и приведите случай, при котором он перестаёт быть применимым.',
        body=summary,bullets=['Перечитайте определения и разберите изменённые условия.','Обоснуйте вывод исходными данными и наблюдениями.'] if not lab else ['Подготовьте отчёт по выполненной работе.','Сохраните исходные данные и доказательство конечной проверки.'])
    if lab:
        add('audience','questions','Вопросы к аудитории',
            'Объясните цель выполненной работы и приведите конкретное свидетельство результата. Затем сравните исходный и изменённый случаи, сохраняя их данные и ограничения.',
            bullets=[t['question'],'Какие наблюдения подтверждают результат этой работы?','Как изменяется решение во втором случае разбора?'],
            answer=t['question']+'\n'+q['explanation']+'\n\nИзменённый случай: '+v['given']+'\n'+v['review'])
    course['lectures'].append(lecture)
    coverage.append(dict(lectureId=lid,category='laboratory' if lab else 'lecture',semester=t['semester'],sourceTitle=source,outcome=t['question'],slideIds=[s['id'] for s in lecture['slides']],caseIds=[mid],taskIds=[tid,tid2]))
course['lectures'].sort(key=lambda l:(l['semester'],'-lab-' in l['id']))
from expansion import expand
expand(course,notes,keys,models,coverage)
course['curriculum']=[dict(topic=c['sourceTitle'],outcome=c['outcome'],source='Программа тем и лабораторных работ, предоставленная пользователем.',slideIds=c['slideIds'],taskIds=c['taskIds']) for c in coverage]
put(Path('public/course.json'),course)
put(Path('public/teacher-pack.json'),dict(schemaVersion=1,courseId=course['id'],contentVersion=course['contentVersion'],notes=notes))
put(Path('public/assessment.json'),dict(courseId=course['id'],contentVersion=course['contentVersion'],keys=keys))
put(Path('public/workbenches.json'),models)
put(Path('public/explanations.json'),explanations)
put(Path('authoring/coverage.json'),coverage)
print(json.dumps(dict(lectures=sum(c['category']=='lecture' for c in coverage),laboratories=sum(c['category']=='laboratory' for c in coverage),slides=sum(len(l['slides']) for l in course['lectures']),notes=len(notes),models=len(models)),ensure_ascii=False))
