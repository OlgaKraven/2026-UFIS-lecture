import type {Visual} from './model';
type Network=Extract<Visual,{type:'network'}>;
function lines(text:string,max:number){
 const result:string[]=[];let line='';
 for(const word of text.split(' ')){if(line&&line.length+word.length+1>max){result.push(line);line=word}else line+=(line?' ':'')+word}
 if(line)result.push(line);return result;
}
export function NetworkDiagram({visual:v}:{visual:Network}){
 const ids=new Set(v.nodes.map(n=>n.id));
 const flat=ids.has('supplier')||ids.has('scanner');
 const width=flat?180:260,height=100;
 const positions:Record<string,[number,number]>=flat?Object.fromEntries(v.nodes.map((n,i)=>[n.id,[i*220+20,120] as [number,number]])):
  ids.has('cam')?{cam:[20,30],sw:[350,30],nvr:[680,30],src:[20,240],screen:[350,240],pc:[680,240]}:
  ids.has('sensor')?{source:[20,30],matrix:[350,30],display:[680,30],sensor:[20,240],ctrl:[350,240],amp:[680,240]}:
  {raw:[20,30],order:[350,30],test:[680,30],machine:[350,240],ship:[680,240]};
 const fullWidth=flat?v.nodes.length*220:980,fullHeight=flat?320:390;
 const marker='ufis-arrow-'+v.nodes.map(n=>n.id).join('-');
 const endpoint=(cx:number,cy:number,dx:number,dy:number)=>{const factor=Math.min(dx?width/2/Math.abs(dx):Infinity,dy?height/2/Math.abs(dy):Infinity);return [cx+dx*factor,cy+dy*factor]};
 return <svg className="ufis-network" viewBox={`0 -40 ${fullWidth} ${fullHeight+40}`} role="img" aria-label={v.caption}>
  <title>{v.caption}</title><defs><marker id={marker} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="var(--muted)"/></marker></defs>
  {ids.has('supplier')&&<g><rect x="220" y="78" width={fullWidth-230} height="190" rx="4" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeDasharray="7 5"/><text x="234" y="102" fill="var(--muted)" fontSize="18">Система склада</text></g>}
  {v.edges.map((e,i)=>{
   const a=positions[e.from],b=positions[e.to];if(!a||!b)return null;
   const ax=a[0]+width/2,ay=a[1]+height/2,bx=b[0]+width/2,by=b[1]+height/2;
   const [sx,sy]=endpoint(ax,ay,bx-ax,by-ay),[tx,ty]=endpoint(bx,by,ax-bx,ay-by);
   if(e.from==='sw'&&e.to==='cam')return <g key={i}><path d={`M${sx} ${sy+28} L${tx} ${ty+28}`} fill="none" stroke="var(--muted)" strokeWidth="2" markerEnd={`url(#${marker})`}/><text x={(sx+tx)/2} y={ay+height/2+27} textAnchor="middle" fill="var(--text)" fontSize="20">{e.label}</text></g>;
   const horizontal=Math.abs(ay-by)<1,vertical=Math.abs(ax-bx)<1;
   const label=lines(e.label,flat?15:24),x=(sx+tx)/2-(vertical?12:0),y=horizontal?ay-height/2-12-(label.length-1)*23:(sy+ty)/2-14;
   return <g key={i}><path d={`M${sx} ${sy} L${tx} ${ty}`} fill="none" stroke="var(--muted)" strokeWidth="2" markerEnd={`url(#${marker})`}/><text x={x} y={y} textAnchor={vertical?'end':'middle'} fill="var(--text)" stroke="var(--surface)" strokeWidth="4" paintOrder="stroke" fontSize={flat?18:20}>{label.map((l,j)=><tspan x={x} dy={j?23:0} key={j}>{l}</tspan>)}</text></g>
  })}
  {v.nodes.map(n=>{
   const p=positions[n.id];if(!p)return null;const title=lines(n.title,flat?16:23),detail=lines(n.text,flat?20:28);
   return <g key={n.id}><rect x={p[0]} y={p[1]} width={width} height={height} rx="3" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5"/><text x={p[0]+width/2} y={p[1]+28} textAnchor="middle" fill="var(--text)" fontSize={flat?20:22} fontWeight="700">{title.map((l,i)=><tspan key={i} x={p[0]+width/2} dy={i?24:0}>{l}</tspan>)}</text><text x={p[0]+width/2} y={p[1]+32+title.length*24} textAnchor="middle" fill="var(--muted)" fontSize="18">{detail.map((l,i)=><tspan key={i} x={p[0]+width/2} dy={i?21:0}>{l}</tspan>)}</text></g>
  })}
 </svg>;
}
