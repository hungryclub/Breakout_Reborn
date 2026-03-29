import test from "node:test";
import assert from "node:assert/strict";

import { createStageLayout } from "../src/game/systems/stageMath.ts";

test("Stage 1은 빠른 성공을 위해 일반 브릭 비중이 높다", () => {
  const layout = createStageLayout(1);
  const normalCount = layout.filter((item) => item.type === "normal").length;

  assert.equal(normalCount >= 18, true);
});

test("Stage 2는 강체 브릭을 더 많이 포함한다", () => {
  const layout = createStageLayout(2);
  const hardCount = layout.filter((item) => item.type === "hard").length;

  assert.equal(hardCount >= 6, true);
});
