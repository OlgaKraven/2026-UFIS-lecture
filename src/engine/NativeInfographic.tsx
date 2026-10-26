import {useId} from 'react'
import type {Visual} from './model'

function Text({x,y,text,width=32,strong=false,size=21}:{x:number;y:number;text:string;width?:number;strong?:boolean;size?:number}){
 const words=text.split(' '),lines:string[]=[];let line='';
 for(const word of words){if(line&&line.length+word.length+1>width){lines.push(line);line=word}else line+=(line?' ':'')+word}if(line)lines.push(line)
 return <text x={x} y={y} fill="var(--text)" fontSize={size} fontWeight={strong?700:400}>{lines.map((t,i)=><tspan x={x} dy={i?Math.round(size*1.24):0} key={i}>{t}</tspan>)}</text>
}
export function NativeInfographic({visual:v,step=0}:{visual:Visual;step?:number}){
 const arrow=useId().replace(/:/g,'')
 const line=(x1:number,y1:number,x2:number,y2:number,key:string)=><line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--muted)" strokeWidth="2.5" markerEnd={`url(#${arrow})`}/>
 const box=(x:number,y:number,w:number,h:number,title:string,text:string,current=false)=><g><rect x={x} y={y} width={w} height={h} rx="5" fill="var(--surface)" stroke={current?'var(--red)':'var(--border)'} strokeWidth={current?3:2}/><Text x={x+18} y={y+35} text={title} width={Math.floor(w/12)-2} strong/><Text x={x+18} y={y+76} text={text} width={Math.floor(w/11)-3}/></g>
 let height=460,body:React.ReactNode=null
 if(v.type==='process'||v.type==='cycle'||v.type==='cause'){
  const items=v.type==='cause'?[{title:'Причина',text:v.cause},{title:'Последствие',text:v.effect},{title:'Исправление',text:v.solution}]:v.items
  height=Math.ceil(items.length/2)*205+25
  body=<>{items.map((a,i)=>{const x=i%2*500+20,y=Math.floor(i/2)*205+20;return <g key={i}>{box(x,y,430,160,`${i+1}. ${a.title}`,a.text,step===i+1)}{i<items.length-1&&(i%2===0?line(x+430,y+80,x+490,y+80,'l'):line(x+215,y+160,235,y+195,'l'))}</g>})}{v.type==='cycle'&&<Text x={25} y={height-3} text="После последнего этапа — возврат к первому" width={75}/>}</>
 }else if(v.type==='layers'){
  height=v.items.length*125+25
  body=v.items.map((a,i)=><g key={i}>{box(100,i*125+5,780,100,a.title,a.text,step===i+1)}{i<v.items.length-1&&line(490,i*125+105,490,i*125+127,'l')}</g>)
 }else if(v.type==='bars'||v.type==='funnel'){
  const items=v.type==='bars'?v.items:v.stages.map(a=>({label:a.label,value:a.value})),max=v.type==='bars'?v.max:Math.max(...items.map(a=>a.value))
  height=items.length*83+95
  body=<>{[0,.25,.5,.75,1].map(p=><g key={p}><line x1={300+p*580} y1="25" x2={300+p*580} y2={height-55} stroke="var(--border)"/><Text x={280+p*580} y={height-18} text={String(Math.round(max*p*100)/100)} width={10}/></g>)}{items.map((a,i)=><g key={i}><Text x={15} y={i*83+58} text={a.label} width={24}/><rect x="300" y={i*83+30} width={Math.max(0,a.value/max*580)} height="36" fill="var(--red)" opacity=".8"/><Text x={Math.min(865,310+a.value/max*580)} y={i*83+57} text={`${a.value} ${v.unit}`} width={12}/></g>)}{v.type==='bars'&&v.threshold!==undefined&&<g><line x1={300+v.threshold/max*580} x2={300+v.threshold/max*580} y1="10" y2={height-55} stroke="var(--text)" strokeWidth="3" strokeDasharray="7 5"/><Text x={300+v.threshold/max*580-20} y={18} text={`Предел ${v.threshold}`} width={20}/></g>}</>
 }else if(v.type==='timeline'){
  const scale=v.items.every(a=>a.duration!==undefined),total=v.items.reduce((a,b)=>a+(b.duration??1),0);let x=30
  body=<><line x1="30" y1="125" x2="960" y2="125" stroke="var(--muted)" strokeWidth="3"/>{v.items.map((a,i)=>{const width=(a.duration??1)/total*900,start=x;x+=width;return <g key={i}><rect x={start} y="75" width={width} height="50" fill="var(--red)" opacity={.4+i*.12}/><line x1={start} y1="70" x2={start} y2="140" stroke="var(--text)"/>{box(20+i*960/v.items.length,185,940/v.items.length-10,185,a.title,a.text,step===i+1)}<Text x={start+5} y={62} text={scale?String(a.duration):String(i+1)} width={10}/></g>})}<Text x={30} y={430} text={scale?'Длина участка пропорциональна длительности; единицы указаны в условии.':'Порядок событий; расстояние не обозначает длительность.'} width={80}/></>
 }else if(v.type==='decision'){
  height=350
  body=<><rect x="120" y="0" width="760" height="65" rx="5" fill="var(--surface)" stroke="var(--border)"/><Text x={145} y={28} text={v.start} width={60}/>{line(500,65,500,90,'a')}<polygon points="500,90 760,155 500,220 240,155" fill="var(--surface)" stroke="var(--red)" strokeWidth="3"/><Text x={350} y={145} text={v.question} width={26}/>{line(240,155,130,242,'b')}{line(760,155,850,242,'c')}<Text x={170} y={213} text="Да"/><Text x={790} y={213} text="Нет"/>{box(5,245,470,100,'Условие выполнено',v.yes)}{box(515,245,470,100,'Условие не выполнено',v.no)}</>
 }else if(v.type==='beforeAfter'){
  height=Math.max(v.before.fields.length,v.after.fields.length)*75+150
  body=<>{[v.before,v.after].map((a,i)=><g key={i}><rect x={i*530+10} y="15" width="450" height={height-75} fill="var(--surface)" stroke="var(--border)"/><Text x={i*530+30} y={55} text={a.title} strong/>{a.fields.map((f,j)=><g key={j}><Text x={i*530+30} y={100+j*75} text={f.label} width={35}/><Text x={i*530+30} y={129+j*75} text={f.value} width={35} strong/></g>)}</g>)}{line(465,height/2,532,height/2,'a')}</>
 }else if(v.type==='states'){
  height=v.states.length*105+30
  body=v.states.map((a,i)=><g key={i}>{box(200,i*105,600,80,a,'')}{i<v.states.length-1&&line(500,i*105+80,500,(i+1)*105,'l')}{v.cancelFrom.includes(i)&&<Text x={815} y={i*105+40} text="→ отмена" width={12}/>}</g>)
 }else if(v.type==='conceptMap'){
  height=365
  body=<><rect x="130" y="0" width="740" height="78" fill="var(--surface)" stroke="var(--border)"/><Text x={150} y={32} text={v.center} width={60} strong/>{v.items.map((a,i)=>{const x=5+i*250;return <g key={i}>{line(500,78,x+120,148,'l')}<rect x={x} y="150" width="240" height="205" rx="5" fill="var(--surface)" stroke="var(--border)"/><Text x={x+12} y={182} text={a.title} width={18} strong size={19}/><Text x={x+12} y={265} text={a.example} width={20} size={18}/></g>})}</>
 }
 if(!body)return null
 return <svg className="native-infographic" viewBox={`0 0 1000 ${height}`} role="img" aria-label={v.caption}><title>{v.caption}</title><defs><marker id={arrow} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="var(--muted)"/></marker></defs>{body}</svg>
}
