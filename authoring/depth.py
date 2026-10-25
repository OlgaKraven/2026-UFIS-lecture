"""Развёрнутые вопросы лекций. Содержание задаётся по теме, без нормы числа слайдов."""
from topics import C,table,process,network

DEPTH={}
def O(index):return {'original':index}
def S(title,body,speech,notebook='',visual=None):return C(title,body,speech,notebook,visual)
def E(title,body,speech,visual=None):
    item=C(title,body,speech,visual=visual);item['kind']='example';return item
def Check(prompt,options,correct,explanation):return dict(prompt=prompt,options=options,correct=correct,explanation=explanation)
def Q(key,title,intro,contents,check,takeaway):return dict(key=key,title=title,intro=intro,contents=contents,check=check,takeaway=takeaway)
def Lecture(slug,sections,discussion,homework):DEPTH[slug]=dict(sections=sections,discussion=discussion,homework=homework)
def H(task,instructions,deliverable,answer):return dict(task=task,instructions=instructions,deliverable=deliverable,answer=answer)

import depth_systems,depth_applications,depth_equipment,depth_reliability,depth_metrics
