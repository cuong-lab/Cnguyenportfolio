import{n as e}from"./react-dom.C-2vKPFn.js";import{t}from"./client.B4KXplu9.js";import{$o as n,Bo as r,Fo as i,Io as a,Ll as o,Mo as s,Oo as c,Qa as l,Qo as u,Ro as d,Za as f,fs as p,mn as m,zo as h}from"./index2.CqE9xhXe.js";import{t as g}from"./jsx-runtime.C2w196fF.js";import{t as _}from"./compiler-runtime.CCQjDKOz.js";import{F as v,H as y,Ot as b,R as x,gt as S,kt as C,wt as w}from"./dist.E5vo4xYT.js";var T=g(),E=_();e(),o(),r(),h(),s(),u(),d(),a(),i(),p(),n(),c(),t();var D=1,O=3,k=C(x).withConfig({displayName:`RootFlex`,componentId:`sc-1y8zfkj-0`})(({theme:e})=>b`
    min-height: 100%;

    @media (max-width: ${e.sanity.media[O]}px) {
      position: relative;
    }
  `),A=C(y).withConfig({displayName:`SidebarMotionLayer`,componentId:`sc-1y8zfkj-1`})(({theme:e})=>{let t=e.sanity.media;return b`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 360px;
    border-left: 1px solid var(--card-border-color);
    box-sizing: border-box;
    overflow: hidden;

    box-shadow:
      0px 6px 8px -4px var(--card-shadow-umbra-color),
      0px 12px 17px -1px var(--card-shadow-penumbra-color);

    @media (max-width: ${t[O]}px) {
      bottom: 0;
      position: absolute;
      right: 0;
      top: 0;
    }

    @media (max-width: ${t[D]}px) {
      border-left: 0;
      min-width: 100%;
      left: 0;
    }
  `});function j(e){let t=(0,E.c)(12),n=S(),{state:r}=l(),{isOpen:i}=r,a=n<=D&&i?`hidden`:`auto`,o;t[0]===e?o=t[1]:(o=e.renderDefault(e),t[0]=e,t[1]=o);let s;t[2]!==a||t[3]!==o?(s=(0,T.jsx)(v,{flex:1,height:`fill`,overflow:a,children:o}),t[2]=a,t[3]=o,t[4]=s):s=t[4];let c;t[5]===i?c=t[6]:(c=i&&(0,T.jsx)(A,{zOffset:100,height:`fill`,children:(0,T.jsx)(m,{})}),t[5]=i,t[6]=c);let u;t[7]===c?u=t[8]:(u=(0,T.jsx)(w,{initial:!1,children:c}),t[7]=c,t[8]=u);let d;return t[9]!==s||t[10]!==u?(d=(0,T.jsxs)(k,{sizing:`border`,height:`fill`,children:[s,u]}),t[9]=s,t[10]=u,t[11]=d):d=t[11],d}function M(e){let t=(0,E.c)(4),{enabled:n}=f();if(!n){let n;return t[0]===e?n=t[1]:(n=e.renderDefault(e),t[0]=e,t[1]=n),n}let r;return t[2]===e?r=t[3]:(r=(0,T.jsx)(j,{...e}),t[2]=e,t[3]=r),r}export{M as TasksStudioActiveToolLayout};