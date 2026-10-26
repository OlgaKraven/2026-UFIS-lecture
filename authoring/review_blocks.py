"""Предметные кейсы и задания по каждому учебному вопросу."""
from depth import DEPTH
BLOCKS={}

def B(items,unit,max_value=None,threshold=None):
    v=dict(type='bars',items=[dict(label=a,value=b) for a,b in items],max=max_value or max(b for a,b in items)*1.25,unit=unit,caption='Учебные данные; величины сравниваются на общей шкале.')
    if threshold is not None:v['threshold']=threshold
    return v
def D(start,question,yes,no):return dict(type='decision',start=start,question=question,yes=yes,no=no,caption='Решение относится к заданному условию; стрелки подписаны по результату проверки.')
def P(*items):return dict(type='process',items=[dict(title=a,text=b) for a,b in items],caption='Стрелки показывают порядок выполнения и передачи результата.')
def G(nodes,edges,directed=True):
    positions=[(20+i%3*330,30+i//3*210) for i in range(len(nodes))]
    if len(nodes)==3 and any({a,b}=={0,2} for a,b,c in edges):positions=[(20,130),(680,20),(680,250)]
    if len(nodes)>3 and all(a==0 for a,b,c in edges):positions=[(20,230)]+[(680,20+(i-1)*210) for i in range(1,len(nodes))]
    return dict(type='network',nodes=[dict(id=str(i),title=a,text=b,x=positions[i][0],y=positions[i][1]) for i,(a,b) in enumerate(nodes)],edges=[dict(from_=str(a),to=str(b),label=c,directed=directed) for a,b,c in edges],caption='Учебная схема. Подпись каждой связи указывает передаваемый сигнал или общую зависимость.')
def T(*items):return dict(type='timeline',items=[dict(title=a,text=b,duration=c) for a,b,c in items],caption='Учебная временная шкала; длительности указаны в минутах.')

def R(slug,key,a,b,pairs,wrong,short=None,visual=None,multi=None):
    q=next(q for q in DEPTH[slug]['sections'] if q['key']==key)
    pairs=[p.split('=',1) for p in pairs.split('~')]
    assert len(pairs)==4 and len({p[0] for p in pairs})==4 and len({p[1] for p in pairs})==4,(slug,key)
    wrong=wrong.split('~');assert len(wrong)==3,(slug,key)
    variants=[]
    for i,value in enumerate([a,b]):
        given,rule,result,review=value.split('|')
        variants.append(dict(id='base' if i==0 else 'changed',title='Исходные условия' if i==0 else 'Изменённые условия',given=given,rule=rule,result=result,review=review))
    if visual is None:
        visual=dict(type='conceptMap',center=q['title'],items=[dict(title=x,example=y,relation='определяет') for x,y in pairs],caption='Связи понятий учебного вопроса: роль каждого элемента раскрыта на отдельной ветви.')
    if visual['type']=='network':
        for edge in visual['edges']:edge['from']=edge.pop('from_')
    if short is None:short=(f'Укажите термин: {pairs[2][1]}. Введите название из разобранной системы понятий.',pairs[2][0],f'{pairs[2][0]} — {pairs[2][1]}.')
    if multi is None:
        # Four domain statements, with two semantic substitutions rather than irrelevant distractors.
        multi=[f'{pairs[0][0]} — {pairs[0][1]}.',f'{pairs[1][0]} — {pairs[1][1]}.',f'{pairs[2][0]} — {pairs[3][1]}.',f'{pairs[3][0]} — {pairs[2][1]}.']
    assert len(multi)==4
    BLOCKS[(slug,key)]=dict(variants=variants,pairs=pairs,wrong=wrong,short=short,visual=visual,multi=multi)

import review_systems,review_applications,review_equipment,review_reliability,review_metrics
assert set(BLOCKS)=={(s,q['key']) for s,p in DEPTH.items() for q in p['sections']}

# The target quantity is visible before opening the worked solution.
TARGETS={
('system-boundary','information'):'Сколько штук соответствует указанным коробкам?',
('classification','comparison'):'Какова полная стоимость варианта A за указанный период в условных единицах?',
('accounting-supply','documents'):'Сколько единиц из принятого пригодно к свободной выдаче?',
('accounting-supply','stock'):'Сколько единиц свободно для выдачи?',
('accounting-supply','planning'):'Сколько единиц требуется дополнительно закупить к сроку?',
('accounting-supply','integration'):'Каков итоговый остаток при однократной обработке каждого события?',
('production-quality','levels'):'Каков подтверждённый годный выпуск в штуках?',
('production-quality','nonconformity'):'Сколько изделий сейчас не соответствует индивидуальному пределу?',
('production-quality','service'):'Каков подтверждённый выпуск после обработки событий в штуках?',
('reference-library','records'):'Сколько экземпляров доступно для новой выдачи?',
('integration','surveillance'):'Какова суммарная скорость в МБ/с?',
('reliability-foundations','events'):'Сколько эпизодов отказа началось?',
('reliability-foundations','restoration'):'Каково полное время восстановления в минутах?',
('reliability-foundations','journal'):'Сколько минут занимает объединение указанных интервалов?',
('single-metrics','probability'):'Какова наблюдаемая доля безотказных испытаний?',
('single-metrics','operating-mean'):'Какова оценка средней наработки на отказ в часах?',
('single-metrics','repair-mean'):'Каково среднее время восстановления в минутах?',
('single-metrics','exponential'):'Чему равна R(t) в принятой экспоненциальной модели?',
('single-metrics','calculation'):'Чему равен показатель степени −t/Tн после приведения единиц?',
('availability','readiness'):'Чему равен Kг в принятой модели?',
('availability','utilization'):'Чему равен Kти полного фонда времени?',
('availability','comparison'):'Какова разность в процентных пунктах?',
('system-reliability','series'):'Чему равна надёжность последовательной системы?',
('system-reliability','parallel'):'Чему равна надёжность параллельной системы?',
('system-reliability','mixed'):'Чему равна надёжность всей смешанной системы?',
('system-reliability','dependence'):'Чему равна надёжность системы с общим обязательным коммутатором?',
('information-integrity','distortion'):'Сколько штук должно получиться при правильном преобразовании?',
('information-integrity','denominator'):'Какова доля полностью правильных записей?',
('information-integrity','reconciliation'):'Сколько записей различаются с эталоном по своим ключам?',
('performance','measures'):'Какова успешная пропускная способность в операциях/с?',
('performance','statistics'):'Чему равен указанный процентиль в миллисекундах?',
('improvement','recovery'):'Каков возраст последней доступной для возврата точки в часах?',
}
for key,target in TARGETS.items():
    for v in BLOCKS[key]['variants']:v['given']+=' '+target
for key,targets in {
('availability','fund'):['Сколько часов фонда неизвестно?','Сколько часов составит подтверждённое рабочее время?'],
('reliability-foundations','exposure'):['Сколько часов составляет наработка?','Как отразить эпизод в журнале?'],
('improvement','baseline'):['Какая мера непосредственно связана с причиной задержки?','Сколько часов занимает весь возврат после изменения?'],
('information-integrity','correction'):['Сколько записей теперь полностью правильны?','Можно ли считать второе исправление подтверждённым?'],
('availability','procedure'):['Что показывает недопустимый коэффициент?','Чему равен исправленный Kти?'],
('single-metrics','limits'):['Достаточно ли данных для Kг и почему?','Чему равен Kг при добавленном Tв?'],
('improvement','verification'):['Каково полное время восстановления в минутах?','Выполнено ли заданное ограничение?'],
}.items():
    for v,target in zip(BLOCKS[key]['variants'],targets):v['given']+=' '+target

def reserve_scheme(left,left_text,a,b,result):
    return dict(type='network',nodes=[
        dict(id='in',title=left,text=left_text,x=20,y=130),
        dict(id='a',title='Канал A',text=a,x=350,y=20),
        dict(id='b',title='Канал B',text=b,x=350,y=250),
        dict(id='out',title='Функция',text=result,x=680,y=130)],
        edges=[dict(**{'from':x,'to':y},label=label,directed=False) for x,y,label in [('in','a','путь A'),('in','b','путь B'),('a','out','успех A'),('b','out','успех B')]],
        caption='Структурная схема надёжности: в параллельной группе достаточно одного полного пути. Вероятности заданы на общем горизонте; независимость и идеальное переключение приняты.')
BLOCKS['system-reliability','parallel']['visual']=reserve_scheme('Вход','Достаточно одного канала','R=0,90','R=0,80','R=1−0,10×0,20=0,98')
BLOCKS['system-reliability','mixed']['visual']=reserve_scheme('Обязательный сервер','R=0,95','R=0,90','R=0,90','R=0,95×0,99=0,9405')
BLOCKS['system-reliability','dependence']['visual']=reserve_scheme('Общий SW','R=0,95; обязателен','R=0,90','R=0,90','R=0,95×0,99=0,9405')
