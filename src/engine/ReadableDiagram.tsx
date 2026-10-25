import type {Visual} from './model'
import {InfographicMobile} from './InfographicMobile'
import {NetworkDiagram} from './NetworkDiagram'
export function diagramSteps(v:Visual):number {
  if(v.type==='process'||v.type==='timeline'||v.type==='layers'||v.type==='cycle')return v.items.length
  if(v.type==='cause')return 3
  return 0
}
export function ReadableDiagram({visual:v,base,step=0}:{visual:Visual;base:string;step?:number}){
  if(v.type==='network')return <NetworkDiagram visual={v}/>;
  const items=v.type==='cause'?[{title:'Причина',text:v.cause},{title:'Последствие',text:v.effect},{title:'Исправление',text:v.solution}]
    :v.type==='process'||v.type==='timeline'||v.type==='layers'||v.type==='cycle'?v.items:null
  if(items)return <ol className={`rd-flow rd-count-${items.length} rd-${v.type}`}>
    {items.map((item,index)=><li key={index} className={step===index+1?'is-current':''} aria-current={step===index+1?'step':undefined}>
      <div className="rd-node-heading"><span className="rd-number">{String(index+1).padStart(2,'0')}</span><strong>{item.title}</strong></div><p>{item.text}</p>
    </li>)}
  </ol>
  if(v.type==='matrix'||v.type==='comparison')return <div className="rd-table-wrap"><table className="rd-table">
    <thead><tr>{v.columns.map((column,i)=><th key={i} scope="col">{column}</th>)}</tr></thead>
    <tbody>{v.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=>j===0?<th key={j} scope="row">{cell}</th>:<td key={j}>{cell}</td>)}</tr>)}</tbody>
  </table></div>
  if(v.type==='codeParts')return <div className="rd-code-parts">{v.parts.map((part,i)=><section className="rd-code" key={i}>
    <strong className="rd-code-label">{part.label}</strong><pre><code>{part.code}</code></pre><p className="rd-code-explanation">{part.explanation}</p>
  </section>)}</div>
  return <InfographicMobile visual={v} base={base}/>
}
