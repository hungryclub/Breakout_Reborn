import test from "node:test";
import assert from "node:assert/strict";

import {
  createCenteredBrickLayout,
  createStageBrickType,
  isNeighborBrick,
  resolveBrickHit,
} from "../src/game/systems/brickMath.ts";

test("Stage 1 기본 브릭 레이아웃은 24개의 좌표를 만든다", () => {
  const layout = createCenteredBrickLayout(1080, 250, 6, 4, 132, 48, 16);

  assert.equal(layout.length, 24);
  assert.equal(layout[0]?.y, 250);
});

test("브릭 히트 결과는 내구도 1에서 파괴와 점수 증가를 반환한다", () => {
  const result = resolveBrickHit(1, 100);

  assert.deepEqual(result, {
    remainingDurability: 0,
    destroyed: true,
    scoreAwarded: 100,
  });
});

test("브릭 좌표는 플레이 영역 안쪽에 중심 정렬된다", () => {
  const layout = createCenteredBrickLayout(1080, 250, 6, 4, 132, 48, 16);
  const xs = layout.map((item) => item.x);

  assert.equal(Math.min(...xs) > 0, true);
  assert.equal(Math.max(...xs) < 1080, true);
});

test("스테이지 브릭 타입 분포는 4종 규칙을 만든다", () => {
  assert.equal(createStageBrickType(0, 1), "hard");
  assert.equal(createStageBrickType(1, 2), "explosive");
  assert.equal(createStageBrickType(2, 0), "item");
  assert.equal(createStageBrickType(3, 3), "normal");
});

test("이웃 브릭 판정은 반경 1칸 기준으로 작동한다", () => {
  assert.equal(isNeighborBrick(2, 2, 3, 2, 1), true);
  assert.equal(isNeighborBrick(2, 2, 4, 2, 1), false);
});
