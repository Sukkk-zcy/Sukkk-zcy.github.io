const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/mermaid.core.CewdoEAD.js","_astro/preload-helper.CVfkMyKi.js","_astro/transform.C0v2qCWc.js","_astro/step.BX9jSvII.js"])))=>i.map(i=>d[i]);
import{_ as p}from"./preload-helper.CVfkMyKi.js";import{i as C}from"./index.B3Vr0K9f.js";const t=(...r)=>console.log("[astro-mermaid]",...r),u=(...r)=>console.error("[astro-mermaid]",...r),b=()=>document.querySelectorAll("pre.mermaid").length>0;let m=null;async function k(){return m||(t("Loading mermaid.js..."),m=p(()=>import("./mermaid.core.CewdoEAD.js").then(r=>r.b6),__vite__mapDeps([0,1,2,3])).then(async({default:r})=>{const a=[];if(a&&a.length>0){t("Registering",a.length,"icon packs");const o=a.map(e=>e.icons?{name:e.name,icons:e.icons}:{name:e.name,loader:()=>fetch(e.url).then(d=>d.json())});await r.registerIconPacks(o)}return r}).catch(r=>{throw u("Failed to load mermaid:",r),m=null,r}),m)}const l={startOnLoad:!1,theme:"base",securityLevel:"loose",themeVariables:{fontFamily:"ui-sans-serif, system-ui, -apple-system, PingFang SC, Microsoft YaHei, sans-serif",fontSize:"14px",primaryColor:"#f4f0ff",primaryBorderColor:"#b8a5f0",primaryTextColor:"#2a2438",lineColor:"#8a7fb8",secondaryColor:"#ffe9f3",tertiaryColor:"#e8f6ff",secondaryBorderColor:"#f5c8dc",tertiaryBorderColor:"#b3d9f0",edgeLabelBackground:"#ffffff",clusterBkg:"#fbf7ff",clusterBorder:"#cfc5ee",titleColor:"#2a2438",mainBkg:"#f4f0ff",nodeBorder:"#b8a5f0",nodeTextColor:"#2a2438",actorBkg:"#f4f0ff",actorBorder:"#b8a5f0",actorTextColor:"#2a2438",actorLineColor:"#8a7fb8",signalColor:"#8a7fb8",signalTextColor:"#2a2438",labelBoxBkgColor:"#fff5fa",labelBoxBorderColor:"#f5c8dc",labelTextColor:"#2a2438",loopTextColor:"#2a2438",noteBkgColor:"#e8f6ff",noteBorderColor:"#b3d9f0",noteTextColor:"#2a2438",activationBkgColor:"#f0e8ff",activationBorderColor:"#b8a5f0",sequenceNumberColor:"#ffffff",sectionBkgColor:"#f4f0ff",altSectionBkgColor:"#fbf7ff",sectionBkgColor2:"#fff0f6",excludeBkgColor:"#f2f2f2",taskBorderColor:"#8a7fb8",taskBkgColor:"#f4f0ff",taskTextLightColor:"#ffffff",taskTextColor:"#2a2438",taskTextDarkColor:"#2a2438",todayLineColor:"#e5788d",gridColor:"#e8e4f5",border1:"#b8a5f0",border2:"#f5c8dc",border3:"#b3d9f0",border4:"#a8e3c0",border5:"#f5e3a8",border6:"#c0bdf5",border7:"#e8b8b8",border8:"#b8e0e0",border9:"#e8c8e8",background:"#ffffff"},flowchart:{curve:"basis",nodeSpacing:50,rankSpacing:45,padding:8,htmlLabels:!0,useMaxWidth:!1,nodeMinWidth:120},sequence:{mirrorActors:!1,useMaxWidth:!1,actorMargin:60,boxMargin:12,messageMargin:40,width:160},gantt:{useMaxWidth:!1,barHeight:28},pie:{useMaxWidth:!1},er:{useMaxWidth:!1}},y={light:"default",dark:"dark"};async function f(){t("Initializing mermaid diagrams...");const r=document.querySelectorAll("pre.mermaid");if(t("Found",r.length,"mermaid diagrams"),r.length===0)return;const a=await k();let o=l.theme;{const e=document.documentElement.getAttribute("data-theme"),d=document.body.getAttribute("data-theme");o=y[e||d]||l.theme,t("Using theme:",o,"from",e?"html":"body")}a.initialize({...l,theme:o,gitGraph:{mainBranchName:"main",showCommitLabel:!0,showBranches:!0,rotateCommitLabel:!0}});for(const e of r){if(e.hasAttribute("data-processed"))continue;e.hasAttribute("data-diagram")||e.setAttribute("data-diagram",e.textContent||"");const d=e.getAttribute("data-diagram")||"",i="mermaid-"+Math.random().toString(36).slice(2,11);t("Rendering diagram:",i);try{const s=document.getElementById(i);s&&s.remove();const{svg:n}=await a.render(i,d);e.innerHTML=n,e.setAttribute("data-processed","true"),t("Successfully rendered diagram:",i)}catch(s){u("Mermaid rendering error for diagram:",i,s);const n=document.createElement("div");n.style.cssText="color: red; padding: 1rem; border: 1px solid red; border-radius: 0.5rem;";const c=document.createElement("strong");c.textContent="Error rendering diagram:";const g=document.createElement("span");g.textContent=" "+(s.message||"Unknown error"),n.appendChild(c),n.appendChild(g),e.textContent="",e.appendChild(n),e.setAttribute("data-processed","true")}}}b()?(t("Mermaid diagrams detected on initial load"),f()):t("No mermaid diagrams found on initial load");{const r=new MutationObserver(a=>{for(const o of a)o.type==="attributes"&&o.attributeName==="data-theme"&&(document.querySelectorAll("pre.mermaid[data-processed]").forEach(e=>{e.removeAttribute("data-processed")}),f())});r.observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme"]}),r.observe(document.body,{attributes:!0,attributeFilter:["data-theme"]})}document.addEventListener("astro:after-swap",()=>{t("View transition detected"),b()&&f()});const h=document.createElement("style");h.textContent=`
            /* Prevent layout shifts by setting minimum height */
            pre.mermaid {
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 2rem 0;
              padding: 1rem;
              background-color: transparent;
              border: none;
              overflow: auto;
              min-height: 200px; /* Prevent layout shift */
              position: relative;
            }
            
            /* Loading state with skeleton loader */
            pre.mermaid:not([data-processed]) {
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: shimmer 1.5s infinite;
            }
            
            /* Dark mode skeleton loader */
            [data-theme="dark"] pre.mermaid:not([data-processed]) {
              background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
              background-size: 200% 100%;
            }
            
            @keyframes shimmer {
              0% {
                background-position: -200% 0;
              }
              100% {
                background-position: 200% 0;
              }
            }
            
            /* Show processed diagrams with smooth transition */
            pre.mermaid[data-processed] {
              animation: none;
              background: transparent;
              min-height: auto; /* Allow natural height after render */
            }
            
            /* Ensure responsive sizing for mermaid SVGs */
            pre.mermaid svg {
              max-width: 100%;
              height: auto;
            }
            
            /* Optional: Add subtle background for better visibility */
            @media (prefers-color-scheme: dark) {
              pre.mermaid[data-processed] {
                background-color: rgba(255, 255, 255, 0.02);
                border-radius: 0.5rem;
              }
            }
            
            @media (prefers-color-scheme: light) {
              pre.mermaid[data-processed] {
                background-color: rgba(0, 0, 0, 0.02);
                border-radius: 0.5rem;
              }
            }
            
            /* Respect user's color scheme preference */
            [data-theme="dark"] pre.mermaid[data-processed] {
              background-color: rgba(255, 255, 255, 0.02);
              border-radius: 0.5rem;
            }
            
            [data-theme="light"] pre.mermaid[data-processed] {
              background-color: rgba(0, 0, 0, 0.02);
              border-radius: 0.5rem;
            }
          `;document.head.appendChild(h);C();
