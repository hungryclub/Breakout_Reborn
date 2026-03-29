import { awardComboScore, getFeedbackTier, type FeedbackTier } from "./comboMath.ts";

export interface ComboAwardResult {
  comboCount: number;
  totalScore: number;
  multiplier: number;
  feedbackTier: FeedbackTier;
}

export class ComboSystem {
  private comboCount = 0;

  registerBrickBreak(baseScore: number): ComboAwardResult {
    this.comboCount += 1;
    const scoreResult = awardComboScore(baseScore, this.comboCount);

    return {
      comboCount: this.comboCount,
      totalScore: scoreResult.totalScore,
      multiplier: scoreResult.multiplier,
      feedbackTier: getFeedbackTier(this.comboCount),
    };
  }

  reset(): void {
    this.comboCount = 0;
  }

  getComboCount(): number {
    return this.comboCount;
  }
}
