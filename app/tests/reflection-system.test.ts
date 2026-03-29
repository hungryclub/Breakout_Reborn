import test from "node:test";
import assert from "node:assert/strict";

import {
  computePaddleBounceVelocity,
  getPaddleImpactRatio,
  isCollisionLocked,
  shouldForcePaddleBounce,
  shouldProcessPaddleBounce,
} from "../src/game/systems/reflectionMath.ts";

test("패들 중심 충돌은 안정적인 상향 반사를 만든다", () => {
  const reflection = computePaddleBounceVelocity(0, 1120, 120, 20, 75);

  assert.equal(reflection.y < 0, true);
  assert.equal(reflection.angleFromHorizontal, 75);
  assert.equal(reflection.x > 0, true);
});

test("패들 끝 충돌은 중심 충돌보다 더 큰 수평 성분을 만든다", () => {
  const centerReflection = computePaddleBounceVelocity(0, 1120, 120, 20, 75);
  const edgeReflection = computePaddleBounceVelocity(1, 1120, 120, 20, 75);

  assert.equal(Math.abs(edgeReflection.x) > Math.abs(centerReflection.x), true);
  assert.equal(edgeReflection.angleFromHorizontal, 20);
});

test("충돌 지점 비율은 패들 폭 안에서 -1에서 1 사이로 clamp 된다", () => {
  assert.equal(getPaddleImpactRatio(540, 540, 240), 0);
  assert.equal(getPaddleImpactRatio(700, 540, 240), 1);
  assert.equal(getPaddleImpactRatio(380, 540, 240), -1);
});

test("충돌 보호 시간 안에서는 중복 충돌이 잠긴다", () => {
  assert.equal(isCollisionLocked(100, 40, 80), true);
  assert.equal(isCollisionLocked(150, 40, 80), false);
});

test("패들 반사는 공이 위에서 아래로 접근할 때만 처리된다", () => {
  assert.equal(shouldProcessPaddleBounce(1480, 1498, 700, 1528, 1510), true);
  assert.equal(shouldProcessPaddleBounce(1540, 1558, 700, 1528, 1510), false);
  assert.equal(shouldProcessPaddleBounce(1480, 1498, -700, 1528, 1510), false);
});

test("고속 공이 패들 밴드를 관통하면 수동 반사 보정을 허용한다", () => {
  assert.equal(shouldForcePaddleBounce(540, 1504, 1540, 900, 540, 1510, 1546, 240, 18), true);
  assert.equal(shouldForcePaddleBounce(820, 1504, 1540, 900, 540, 1510, 1546, 240, 18), false);
  assert.equal(shouldForcePaddleBounce(540, 1504, 1540, -900, 540, 1510, 1546, 240, 18), false);
});
