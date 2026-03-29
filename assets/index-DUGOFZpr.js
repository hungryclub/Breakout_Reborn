const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Game-EqFrew6L.js","assets/phaser-engine-Jt__PiWe.js"])))=>i.map(i=>d[i]);
(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))f(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const p of t.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&f(p)}).observe(document,{childList:!0,subtree:!0});function c(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function f(e){if(e.ep)return;e.ep=!0;const t=c(e);fetch(e.href,t)}})();const g="modulepreload",y=function(u){return"/trendboard/"+u},h={},w=function(i,c,f){let e=Promise.resolve();if(c&&c.length>0){let m=function(r){return Promise.all(r.map(l=>Promise.resolve(l).then(d=>({status:"fulfilled",value:d}),d=>({status:"rejected",reason:d}))))};var p=m;document.getElementsByTagName("link");const n=document.querySelector("meta[property=csp-nonce]"),s=n?.nonce||n?.getAttribute("nonce");e=m(c.map(r=>{if(r=y(r),r in h)return;h[r]=!0;const l=r.endsWith(".css"),d=l?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${r}"]${d}`))return;const o=document.createElement("link");if(o.rel=l?"stylesheet":g,l||(o.as="script"),o.crossOrigin="",o.href=r,s&&o.setAttribute("nonce",s),document.head.appendChild(o),l)return new Promise((v,_)=>{o.addEventListener("load",v),o.addEventListener("error",()=>_(new Error(`Unable to preload CSS for ${r}`)))})}))}function t(n){const s=new Event("vite:preloadError",{cancelable:!0});if(s.payload=n,window.dispatchEvent(s),!s.defaultPrevented)throw n}return e.then(n=>{for(const s of n||[])s.status==="rejected"&&t(s.reason);return i().catch(t)})},a=document.querySelector("#app");if(!a)throw new Error("Root container '#app' was not found.");a.innerHTML=`
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
`;a.style.setProperty("--safe-top","max(20px, env(safe-area-inset-top))");a.style.setProperty("--safe-right","max(20px, env(safe-area-inset-right))");a.style.setProperty("--safe-bottom","max(20px, env(safe-area-inset-bottom))");a.style.setProperty("--safe-left","max(20px, env(safe-area-inset-left))");const P=async()=>{await w(()=>import("./Game-EqFrew6L.js"),__vite__mapDeps([0,1])),a.classList.add("game-ready")};P();
