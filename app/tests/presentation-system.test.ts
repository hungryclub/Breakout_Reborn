import test from "node:test";
import assert from "node:assert/strict";

import {
  getBallPulseScale,
  getComboPresentation,
  getFailureOverlayAlpha,
  getResultTransitionProfile,
  getTrailStyle,
} from "../src/game/systems/presentationMath.ts";

test("ball pulse scale stays in a safe visual range", () => {
  const scale = getBallPulseScale(100);

  assert.equal(scale > 0.9, true);
  assert.equal(scale < 1.1, true);
});

test("peak combo presentation is stronger than basic", () => {
  const basic = getComboPresentation(2, "basic");
  const peak = getComboPresentation(12, "peak");

  assert.equal(peak.scale > basic.scale, true);
  assert.equal(peak.glowAlpha > basic.glowAlpha, true);
});

test("failure overlay alpha increases with progress", () => {
  assert.equal(getFailureOverlayAlpha(1) > getFailureOverlayAlpha(0), true);
});

test("result transition profile differs by outcome mode", () => {
  const failed = getResultTransitionProfile("failed");
  const cleared = getResultTransitionProfile("cleared");

  assert.equal(failed.introOffsetY > cleared.introOffsetY, true);
  assert.notEqual(failed.titleColor, cleared.titleColor);
});

test("trail styles distinguish laser and primary ball signatures", () => {
  const primary = getTrailStyle("primary-ball");
  const laser = getTrailStyle("laser-ball");

  assert.notEqual(primary.tint, laser.tint);
  assert.equal(laser.alpha > primary.alpha, true);
});
