import test from "node:test";
import assert from "node:assert/strict";

import {
  createInitialLaunchVector,
  getAttachedBallPosition,
} from "../src/game/systems/ballMath.ts";

test("공은 패들 상단 중앙에 부착 좌표로 계산된다", () => {
  const result = getAttachedBallPosition(540, 1528, 36, 18, 14);

  assert.deepEqual(result, {
    x: 540,
    y: 1478,
  });
});

test("초기 발사 벡터는 항상 위쪽 진행을 보장한다", () => {
  const result = createInitialLaunchVector(1120, 0.22);

  assert.equal(result.y < 0, true);
  assert.equal(result.x > 0, true);
});

test("초기 발사 벡터는 완전 수직이 아닌 미세한 편향을 유지한다", () => {
  const result = createInitialLaunchVector(1120, 0.22);

  assert.notEqual(result.x, 0);
  assert.equal(Math.round(Math.hypot(result.x, result.y)), 1120);
});
