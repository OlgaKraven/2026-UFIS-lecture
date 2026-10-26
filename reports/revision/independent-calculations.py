from pathlib import Path
import json,sys,math,re
root=Path(__file__).resolve().parents[2];sys.path.insert(0,str(root/'_sources/2026-UFIS-lecture/authoring'))
from review_blocks import BLOCKS
# Independently specified operations from the visible quantities, not values read from the keys.
rows=[
('system-boundary/purpose',None,None,16+9),
('system-boundary/information',8*6,9*4,None),
('structure/power',None,None,24-15),
('classification/comparison',30+2*15,30+15,25+3*8),
('accounting-supply/documents',90-8,120-8-2,75-6),
('accounting-supply/stock',96-28-4,96-(28-10)-4,110-35-5),
('accounting-supply/planning',90+15-35-25,90+15-35,80+10-25-20),
('accounting-supply/integration',40+12,40+12+5,33+14),
('production-quality/levels',124-9,124-9+16-2,95-7),
('production-quality/trace',None,None,len([x for x in ['M21','M22','M21'] if x=='M21'])),
('production-quality/nonconformity',sum(x>10.1 for x in [9.95,10,10.2]),sum(x>10.1 for x in [9.95,10,10.05]),sum(x>12 for x in [11.98,12.01,12.03,12])),
('production-quality/service',23,23+7,19+6),
('reference-library/records',3-1-1,3-2-1,5-2-1),
('integration/switching',None,None,60-6*8),
('integration/surveillance',12/8,20/8,24/8),
('reliability-foundations/events',1,1+1,1+1),
('reliability-foundations/restoration',10+25+10,10+15+10,40),
('reliability-foundations/journal',max(60,40)-min(0,20),max(60,75)-min(0,20),max(50,70)-min(0,30)),
('reliability-foundations/exposure',12-1-2,None,14-2-1),
('single-metrics/probability',72/80,76/80,54/60),
('single-metrics/operating-mean',1800/9,1800/6,2100/7),
('single-metrics/repair-mean',(20+40+60)/3,(20+40+60+80)/4,(15+45+120)/3/60),
('single-metrics/rate',None,None,8/1600),
('single-metrics/exponential',round(math.exp(-40/400),4),round(math.exp(-80/400),4),round(math.exp(-50/500),4)),
('single-metrics/calculation',-45/60/240,-90/60/240,30/60/200),
('single-metrics/limits',None,round(300/(300+3),4),2),
('availability/readiness',round(180/182,4),round(180/181,4),99/100),
('availability/utilization',1080/1200,1140/1200,720/800),
('availability/fund',600-540-15-25,540+20,900-820-20-35),
('availability/effect',None,None,49/50),
('availability/comparison',(0.97-0.94)*100,(0.985-0.97)*100,(0.975-0.95)*100),
('availability/procedure',None,(520-40)/500,430/500),
('system-reliability/series',.95*.9,.95*.9*.98,.8*.7),
('system-reliability/parallel',1-.1*.2,1-.1*.3,1-.2**2),
('system-reliability/mixed',.95*(1-.1**2),.98*(1-.1**2),.9*.96),
('system-reliability/dependence',.95*(1-.1**2),.95*(1-.01**2),None),
('information-integrity/distortion',15*8,12*6,7*12),
('information-integrity/denominator',(10-2)/10,(10-1)/10,(8-3)/8),
('information-integrity/representation',None,None,'11001010'.count('1')),
('information-integrity/reconciliation',sum(a!=b for a,b in zip([14,26],[26,14])),sum(a!=b for a,b in zip([14,26],[14,26])),sum(a!=b for a,b in zip([8,12,20],[12,8,20]))),
('information-integrity/correction',6-2+1,None,10-4+2),
('performance/measures',2250/90,2430/90,3600/120),
('performance/latency',300-80+40,40+20+40+80,250-60+30),
('performance/statistics',[10,11,12,13,14,15,16,17,30,80][math.ceil(.9*10)-1],[10,11,12,13,14,15,16,17,30,80][math.ceil(.95*10)-1],math.ceil(.95*20)),
('improvement/baseline',None,.25+1.5,.5+2),
('improvement/recovery',19-3,15/60,14-5.5),
('improvement/verification',35,None,42),
]
results=[]
for path,a,b,c in rows:
    slug,key=path.split('/');block=BLOCKS[slug,key]
    for kind,expected,authored in [('base',a,block['variants'][0]['result']),('changed',b,block['variants'][1]['result']),('short',c,block['short'][1])]:
        if expected is None:continue
        value=float(authored.replace(',','.').replace('−','-'));assert math.isclose(value,expected,rel_tol=1e-10,abs_tol=1e-10),(path,kind,value,expected)
        results.append(dict(question=path,kind=kind,authored=value,independent=expected))
expected={(s+'/'+k,v['id']) for (s,k),b in BLOCKS.items() for v in b['variants'] if re.fullmatch(r'[−-]?\d+(?:[,.]\d+)?',v['result'])}
assert expected<={(r['question'],r['kind']) for r in results}
out=root/'output/playwright/ufis-revision/arithmetic.json';out.write_text(json.dumps(dict(cases=len(expected),checks=len(results),results=results),ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n');print(len(results),'independent calculations passed')
