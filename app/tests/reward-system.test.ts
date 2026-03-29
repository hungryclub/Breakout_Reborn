import test from "node:test";
import assert from "node:assert/strict";

import { createRewardChoices } from "../src/game/systems/rewardMath.ts";

test("보상 선택지는 요청된 개수만큼 생성된다", () => {
  const choices = createRewardChoices(2);

  assert.equal(choices.length, 2);
  assert.equal(choices[0]?.label.length > 0, true);
  assert.equal(Boolean(choices[0]?.headline), true);
  assert.equal(Boolean(choices[0]?.subcopy), true);
  assert.equal(Boolean(choices[0]?.accentColor), true);
});
