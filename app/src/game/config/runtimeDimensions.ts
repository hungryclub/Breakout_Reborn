export const BASE_GAME_WIDTH = 1080;
export const BASE_GAME_HEIGHT = 1920;

function resolveMobileViewportSize(): { width: number; height: number } | null {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }

  const mountRect = document.querySelector<HTMLElement>("#game-mount")?.getBoundingClientRect();
  const width = Math.round(mountRect?.width ?? window.innerWidth);
  const height = Math.round(mountRect?.height ?? window.innerHeight);

  if (width <= 0 || height <= 0) {
    return null;
  }

  return { width, height };
}

function resolveGameHeight(): number {
  if (typeof window === "undefined") {
    return BASE_GAME_HEIGHT;
  }

  if (window.innerWidth > 900) {
    return BASE_GAME_HEIGHT;
  }

  const viewport = resolveMobileViewportSize();
  if (!viewport) {
    return BASE_GAME_HEIGHT;
  }

  const nextHeight = Math.round((BASE_GAME_WIDTH * viewport.height) / viewport.width);
  return Math.max(BASE_GAME_HEIGHT, nextHeight);
}

export const GAME_WIDTH = BASE_GAME_WIDTH;
export const GAME_HEIGHT = resolveGameHeight();
