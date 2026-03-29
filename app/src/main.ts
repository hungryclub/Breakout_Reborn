import "./styles.css";

const root = document.querySelector<HTMLDivElement>("#app");

if (!root) {
  throw new Error("Root container '#app' was not found.");
}

root.innerHTML = `
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
`;

root.style.setProperty("--safe-top", "max(20px, env(safe-area-inset-top))");
root.style.setProperty("--safe-right", "max(20px, env(safe-area-inset-right))");
root.style.setProperty("--safe-bottom", "max(20px, env(safe-area-inset-bottom))");
root.style.setProperty("--safe-left", "max(20px, env(safe-area-inset-left))");

const mountGame = async (): Promise<void> => {
  await import("./game/core/Game");
  root.classList.add("game-ready");
};

void mountGame();
