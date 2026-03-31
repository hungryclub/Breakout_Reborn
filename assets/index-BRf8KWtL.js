const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Game-BcdYzGBE.js","assets/phaser-engine-Jt__PiWe.js"])))=>i.map(i=>d[i]);
(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))p(e);new MutationObserver(e=>{for(const s of e)if(s.type==="childList")for(const h of s.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&p(h)}).observe(document,{childList:!0,subtree:!0});function c(e){const s={};return e.integrity&&(s.integrity=e.integrity),e.referrerPolicy&&(s.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?s.credentials="include":e.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function p(e){if(e.ep)return;e.ep=!0;const s=c(e);fetch(e.href,s)}})();const E="modulepreload",L=function(d){return"/Breakout_Reborn/"+d},v={},S=function(i,c,p){let e=Promise.resolve();if(c&&c.length>0){let u=function(o){return Promise.all(o.map(l=>Promise.resolve(l).then(m=>({status:"fulfilled",value:m}),m=>({status:"rejected",reason:m}))))};var h=u;document.getElementsByTagName("link");const n=document.querySelector("meta[property=csp-nonce]"),r=n?.nonce||n?.getAttribute("nonce");e=u(c.map(o=>{if(o=L(o),o in v)return;v[o]=!0;const l=o.endsWith(".css"),m=l?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${o}"]${m}`))return;const a=document.createElement("link");if(a.rel=l?"stylesheet":E,l||(a.as="script"),a.crossOrigin="",a.href=o,r&&a.setAttribute("nonce",r),document.head.appendChild(a),l)return new Promise((w,P)=>{a.addEventListener("load",w),a.addEventListener("error",()=>P(new Error(`Unable to preload CSS for ${o}`)))})}))}function s(n){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=n,window.dispatchEvent(r),!r.defaultPrevented)throw n}return e.then(n=>{for(const r of n||[])r.status==="rejected"&&s(r.reason);return i().catch(s)})},t=document.querySelector("#app");if(!t)throw new Error("Root container '#app' was not found.");t.innerHTML=`
  <div class="app-shell">
    <div class="app-shell__glow app-shell__glow--left"></div>
    <div class="app-shell__glow app-shell__glow--right"></div>
    <div class="app-shell__frame">
      <div class="app-shell__header">
        <div class="app-shell__title-wrap">
          <span class="app-shell__eyebrow">Arcade Vertical Breaker</span>
          <h1 class="app-shell__title">Breakout_Reborn</h1>
        </div>
        <div class="app-shell__badge">Commercial Feel Preview</div>
      </div>
      <div class="app-shell__stage">
        <div class="app-shell__loading">
          <div class="app-shell__spinner"></div>
          <div class="app-shell__loading-copy">
            <strong>Loading combat grid</strong>
            <span>타격감과 연출 레이어를 준비하는 중입니다.</span>
          </div>
        </div>
        <div id="game-mount" class="app-shell__game-mount"></div>
      </div>
    </div>
  </div>
`;t.style.setProperty("--safe-top","env(safe-area-inset-top, 0px)");t.style.setProperty("--safe-right","env(safe-area-inset-right, 0px)");t.style.setProperty("--safe-bottom","env(safe-area-inset-bottom, 0px)");t.style.setProperty("--safe-left","env(safe-area-inset-left, 0px)");const _=1180,b=1080,g=2060,x=1980,f="1080 / 1920";t.style.setProperty("--shell-scale","1");t.style.setProperty("--shell-width",`${_}px`);t.style.setProperty("--shell-height",`${g}px`);t.style.setProperty("--game-mount-aspect-ratio",f);const y=()=>{const d=window.visualViewport,i=Math.max(window.innerWidth,document.documentElement.clientWidth,Math.round(d?.width??0)),c=Math.max(window.innerHeight,document.documentElement.clientHeight,Math.round(d?.height??0)),p=i<=900,e=p?b:_,s=getComputedStyle(t),h=parseFloat(s.paddingLeft||"0")+parseFloat(s.paddingRight||"0"),n=parseFloat(s.paddingTop||"0")+parseFloat(s.paddingBottom||"0"),r=p?x:g,u=Math.max(0,i-h),o=Math.max(0,c-n);if(t.style.setProperty("--shell-base-width",`${e}px`),t.style.setProperty("--shell-base-height",`${r}px`),p){t.style.setProperty("--shell-scale","1"),t.style.setProperty("--shell-width",`${u}px`),t.style.setProperty("--shell-height",`${o}px`),t.style.setProperty("--game-mount-aspect-ratio",f);return}const l=Math.min(1,u/e,o/r);t.style.setProperty("--shell-scale",l.toFixed(4)),t.style.setProperty("--shell-width",`${e*l}px`),t.style.setProperty("--shell-height",`${r*l}px`),t.style.setProperty("--game-mount-aspect-ratio",f)};y();window.addEventListener("resize",y,{passive:!0});window.visualViewport?.addEventListener("resize",y,{passive:!0});const H=async()=>{await S(()=>import("./Game-BcdYzGBE.js"),__vite__mapDeps([0,1])),t.classList.add("game-ready")};H();
