import type {Visual} from './model'
import {InfographicMobile} from './InfographicMobile'
import {NetworkDiagram} from './NetworkDiagram'
import {NativeInfographic} from './NativeInfographic'
export function diagramSteps(v:Visual):number {
  if(v.type==='process'||v.type==='timeline'||v.type==='layers'||v.type==='cycle')return v.items.length
  if(v.type==='cause')return 3
  return 0
}
export function ReadableDiagram({visual:v,base,step=0}:{visual:Visual;base:string;step?:number}){
  if(v.type==='network')return <NetworkDiagram visual={v}/>;
  if(['process','timeline','layers','cycle','cause','bars','funnel','decision','beforeAfter','states','conceptMap'].includes(v.type))return <NativeInfographic visual={v} step={step}/>
  if(v.type==='matrix'||v.type==='comparison')return <div className="rd-table-wrap"><table className="rd-table">
    <thead><tr>{v.columns.map((column,i)=><th key={i} scope="col">{column}</th>)}</tr></thead>
    <tbody>{v.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=>j===0?<th key={j} scope="row">{cell}</th>:<td key={j}>{cell}</td>)}</tr>)}</tbody>
  </table></div>
  if(v.type==='codeParts')return <div className="rd-code-parts">{v.parts.map((part,i)=><section className="rd-code" key={i}>
    <strong className="rd-code-label">{part.label}</strong><pre><code>{part.code}</code></pre><p className="rd-code-explanation">{part.explanation}</p>
  </section>)}</div>
  return <InfographicMobile visual={v} base={base}/>
}
