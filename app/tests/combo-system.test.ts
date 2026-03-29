import test from "node:test";
import assert from "node:assert/strict";

import {
  awardComboScore,
  getComboMultiplier,
  getFeedbackTier,
} from "../src/game/systems/comboMath.ts";

test("콤보 1은 기본 배수를 유지한다", () => {
  assert.equal(getComboMultiplier(1), 1);
  assert.equal(getFeedbackTier(1), "basic");
});

test("콤보 3은 강조 단계와 1.5배 점수를 적용한다", () => {
  const result = awardComboScore(100, 3);

  assert.equal(result.totalScore, 150);
  assert.equal(getFeedbackTier(3), "emphasis");
});

test("콤보 8은 피크 단계와 2배 점수를 적용한다", () => {
  const result = awardComboScore(100, 8);

  assert.equal(result.totalScore, 200);
  assert.equal(getFeedbackTier(8), "peak");
});
