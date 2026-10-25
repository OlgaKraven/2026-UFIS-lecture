import {useEffect,useRef} from 'react';
import type {Lecture,Slide} from './model';
export type ThemeMode='auto'|'light'|'dark';
export const resolveTheme=(mode:ThemeMode):'light'|'dark'=>mode==='auto'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):mode;
export function ThemePicker({value,onChange}:{value:ThemeMode;onChange:(mode:ThemeMode)=>void}){
 return <label className="presentation-theme">Тема<select aria-label="Тема презентации" value={value} onChange={e=>onChange(e.target.value as ThemeMode)}><option value="auto">Авто</option><option value="light">Светлая</option><option value="dark">Тёмная</option></select></label>;
}
export function PresentationMenu({children}:{children:React.ReactNode}){
 const ref=useRef<HTMLDetailsElement>(null);
 useEffect(()=>{
  const close=(e:PointerEvent)=>{if(ref.current?.open&&!ref.current.contains(e.target as Node))ref.current.open=false};
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'&&ref.current?.open){e.preventDefault();ref.current.open=false;ref.current.querySelector('summary')?.focus()}};
  document.addEventListener('pointerdown',close);document.addEventListener('keydown',key);
  return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',key)};
 },[]);
 return <details className="pd-more" ref={ref}><summary className="icon-button" aria-label="Ещё" title="Ещё">•••</summary><div className="pd-menu" onClick={e=>{if((e.target as HTMLElement).closest('button')){ref.current!.open=false;ref.current?.querySelector('summary')?.focus()}}}>{children}</div></details>;
}
export function questionLabel(lecture:Lecture,slide:Slide){
 const index=lecture.slides.findIndex(s=>s.id===slide.id);
 if(['title','literature','materials','agenda','summary','questions'].includes(slide.kind))return '';
 const sections=lecture.slides.slice(0,index+1).filter(s=>s.kind==='section');
 return sections.length?`Вопрос ${sections.length}`:'';
}
