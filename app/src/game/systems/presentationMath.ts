export function getBallPulseScale(time: number): number {
  return 1 + Math.sin(time / 180) * 0.04;
}

export function getComboPresentation(
  comboCount: number,
  feedbackTier: string,
): { scale: number; glowAlpha: number } {
  if (feedbackTier === "peak") {
    return {
      scale: 1.18 + Math.min(comboCount, 24) * 0.004,
      glowAlpha: 0.34,
    };
  }

  if (feedbackTier === "emphasis") {
    return {
      scale: 1.08,
      glowAlpha: 0.2,
    };
  }

  return {
    scale: 1,
    glowAlpha: 0.1,
  };
}

export function getRewardCardAccentAlpha(selected: boolean): number {
  return selected ? 0.38 : 0.18;
}

export function getFailureOverlayAlpha(progress: number): number {
  return 0.2 + progress * 0.42;
}

export function getResultTransitionProfile(
  mode: "failed" | "cleared",
): {
  introOffsetY: number;
  introScale: number;
  titleColor: string;
  veilAlpha: number;
  accentAlpha: number;
} {
  if (mode === "cleared") {
    return {
      introOffsetY: 18,
      introScale: 0.94,
      titleColor: "#ffe27a",
      veilAlpha: 0.26,
      accentAlpha: 0.92,
    };
  }

  return {
    introOffsetY: 28,
    introScale: 0.9,
    titleColor: "#ff9c9c",
    veilAlpha: 0.34,
    accentAlpha: 0.84,
  };
}

export function getTrailStyle(
  kind: "primary-ball" | "multiball" | "laser-ball" | "powerup-expand" | "powerup-laser" | "powerup-multiball" | "powerup-magnet",
): {
  tint: number;
  alpha: number;
  scale: number;
} {
  const table = {
    "primary-ball": { tint: 0x8fdcff, alpha: 0.18, scale: 0.9 },
    multiball: { tint: 0x7be7ff, alpha: 0.22, scale: 0.96 },
    "laser-ball": { tint: 0xff7d92, alpha: 0.24, scale: 1.02 },
    "powerup-expand": { tint: 0x43d17a, alpha: 0.16, scale: 0.9 },
    "powerup-laser": { tint: 0xff6b7d, alpha: 0.18, scale: 0.92 },
    "powerup-multiball": { tint: 0x6dd7ff, alpha: 0.18, scale: 0.92 },
    "powerup-magnet": { tint: 0xb68cff, alpha: 0.18, scale: 0.92 },
  } as const;

  return table[kind];
}
