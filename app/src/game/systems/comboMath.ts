export type FeedbackTier = "basic" | "emphasis" | "peak";

export function getComboMultiplier(comboCount: number): number {
  if (comboCount >= 8) {
    return 2;
  }

  if (comboCount >= 3) {
    return 1.5;
  }

  return 1;
}

export function getFeedbackTier(comboCount: number): FeedbackTier {
  if (comboCount >= 8) {
    return "peak";
  }

  if (comboCount >= 3) {
    return "emphasis";
  }

  return "basic";
}

export function awardComboScore(
  baseScore: number,
  comboCount: number,
): { totalScore: number; multiplier: number } {
  const multiplier = getComboMultiplier(comboCount);

  return {
    totalScore: Math.round(baseScore * multiplier),
    multiplier,
  };
}
