const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./Game-EqFrew6L.js","./phaser-engine-Jt__PiWe.js"])))=>i.map(i=>d[i]);
(function(){const l=document.createElement("link").relList;if(l&&l.supports&&l.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))d(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const s of t.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&d(s)}).observe(document,{childList:!0,subtree:!0});function c(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function d(e){if(e.ep)return;e.ep=!0;const t=c(e);fetch(e.href,t)}})();const g="modulepreload",y=function(m,l){return new URL(m,l).href},v={},w=function(l,c,d){let e=Promise.resolve();if(c&&c.length>0){let _=function(r){return Promise.all(r.map(a=>Promise.resolve(a).then(p=>({status:"fulfilled",value:p}),p=>({status:"rejected",reason:p}))))};const s=document.getElementsByTagName("link"),o=document.querySelector("meta[property=csp-nonce]"),h=o?.nonce||o?.getAttribute("nonce");e=_(c.map(r=>{if(r=y(r,d),r in v)return;v[r]=!0;const a=r.endsWith(".css"),p=a?'[rel="stylesheet"]':"";if(d)for(let u=s.length-1;u>=0;u--){const f=s[u];if(f.href===r&&(!a||f.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${r}"]${p}`))return;const n=document.createElement("link");if(n.rel=a?"stylesheet":g,a||(n.as="script"),n.crossOrigin="",n.href=r,h&&n.setAttribute("nonce",h),document.head.appendChild(n),a)return new Promise((u,f)=>{n.addEventListener("load",u),n.addEventListener("error",()=>f(new Error(`Unable to preload CSS for ${r}`)))})}))}function t(s){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=s,window.dispatchEvent(o),!o.defaultPrevented)throw s}return e.then(s=>{for(const o of s||[])o.status==="rejected"&&t(o.reason);return l().catch(t)})},i=document.querySelector("#app");if(!i)throw new Error("Root container '#app' was not found.");i.innerHTML=`
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
`;i.style.setProperty("--safe-top","max(20px, env(safe-area-inset-top))");i.style.setProperty("--safe-right","max(20px, env(safe-area-inset-right))");i.style.setProperty("--safe-bottom","max(20px, env(safe-area-inset-bottom))");i.style.setProperty("--safe-left","max(20px, env(safe-area-inset-left))");const P=async()=>{await w(()=>import("./Game-EqFrew6L.js"),__vite__mapDeps([0,1]),import.meta.url),i.classList.add("game-ready")};P();
