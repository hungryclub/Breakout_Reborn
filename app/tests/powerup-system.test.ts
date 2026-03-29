import test from "node:test";
import assert from "node:assert/strict";

import { pickPowerupType } from "../src/game/systems/powerupMath.ts";

test("파워업 타입 선택은 4종 순환 규칙을 가진다", () => {
  assert.equal(pickPowerupType(0), "expand");
  assert.equal(pickPowerupType(1), "laser");
  assert.equal(pickPowerupType(2), "multiball");
  assert.equal(pickPowerupType(3), "magnet");
  assert.equal(pickPowerupType(4), "expand");
});
