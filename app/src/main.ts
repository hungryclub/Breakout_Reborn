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

root.style.setProperty("--safe-top", "env(safe-area-inset-top, 0px)");
root.style.setProperty("--safe-right", "env(safe-area-inset-right, 0px)");
root.style.setProperty("--safe-bottom", "env(safe-area-inset-bottom, 0px)");
root.style.setProperty("--safe-left", "env(safe-area-inset-left, 0px)");

const DESKTOP_SHELL_BASE_WIDTH = 1180;
const MOBILE_SHELL_BASE_WIDTH = 1080;
const DESKTOP_SHELL_BASE_HEIGHT = 2060;
const MOBILE_SHELL_BASE_HEIGHT = 1980;
const GAME_ASPECT_RATIO = "1080 / 1920";

root.style.setProperty("--shell-scale", "1");
root.style.setProperty("--shell-width", `${DESKTOP_SHELL_BASE_WIDTH}px`);
root.style.setProperty("--shell-height", `${DESKTOP_SHELL_BASE_HEIGHT}px`);
root.style.setProperty("--game-mount-aspect-ratio", GAME_ASPECT_RATIO);

const updateShellScale = (): void => {
  const viewport = window.visualViewport;
  const viewportWidth = Math.max(
    window.innerWidth,
    document.documentElement.clientWidth,
    Math.round(viewport?.width ?? 0),
  );
  const viewportHeight = Math.max(
    window.innerHeight,
    document.documentElement.clientHeight,
    Math.round(viewport?.height ?? 0),
  );
  const isMobile = viewportWidth <= 900;
  const shellBaseWidth = isMobile ? MOBILE_SHELL_BASE_WIDTH : DESKTOP_SHELL_BASE_WIDTH;
  const rootStyles = getComputedStyle(root);
  const paddingX =
    parseFloat(rootStyles.paddingLeft || "0") + parseFloat(rootStyles.paddingRight || "0");
  const paddingY =
    parseFloat(rootStyles.paddingTop || "0") + parseFloat(rootStyles.paddingBottom || "0");
  const shellBaseHeight = isMobile ? MOBILE_SHELL_BASE_HEIGHT : DESKTOP_SHELL_BASE_HEIGHT;
  const availableWidth = Math.max(0, viewportWidth - paddingX);
  const availableHeight = Math.max(0, viewportHeight - paddingY);

  root.style.setProperty("--shell-base-width", `${shellBaseWidth}px`);
  root.style.setProperty("--shell-base-height", `${shellBaseHeight}px`);

  if (isMobile) {
    root.style.setProperty("--shell-scale", "1");
    root.style.setProperty("--shell-width", `${availableWidth}px`);
    root.style.setProperty("--shell-height", `${availableHeight}px`);
    root.style.setProperty("--game-mount-aspect-ratio", GAME_ASPECT_RATIO);
    return;
  }

  const scale = Math.min(
    1,
    availableWidth / shellBaseWidth,
    availableHeight / shellBaseHeight,
  );

  root.style.setProperty("--shell-scale", scale.toFixed(4));
  root.style.setProperty("--shell-width", `${shellBaseWidth * scale}px`);
  root.style.setProperty("--shell-height", `${shellBaseHeight * scale}px`);
  root.style.setProperty("--game-mount-aspect-ratio", GAME_ASPECT_RATIO);
};

updateShellScale();
window.addEventListener("resize", updateShellScale, { passive: true });
window.visualViewport?.addEventListener("resize", updateShellScale, {
  passive: true,
});

const mountGame = async (): Promise<void> => {
  await import("./game/core/Game");
  root.classList.add("game-ready");
};

void mountGame();
