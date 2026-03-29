import test from "node:test";
import assert from "node:assert/strict";

import {
  applyPowerupState,
  consumeLaserCharge,
  consumeMagnetCharge,
  INITIAL_POWERUP_STATE,
  syncActiveMultiballCount,
} from "../src/game/systems/powerupEffectMath.ts";

test("expand는 최대 3스택까지만 증가한다", () => {
  let state = INITIAL_POWERUP_STATE;
  state = applyPowerupState(state, "expand");
  state = applyPowerupState(state, "expand");
  state = applyPowerupState(state, "expand");
  state = applyPowerupState(state, "expand");

  assert.equal(state.expandStacks, 3);
});

test("laser와 magnet은 최대 3충전까지 누적된다", () => {
  let state = INITIAL_POWERUP_STATE;
  state = applyPowerupState(state, "laser");
  state = applyPowerupState(state, "laser");
  state = applyPowerupState(state, "laser");
  state = applyPowerupState(state, "laser");
  state = applyPowerupState(state, "magnet");
  state = applyPowerupState(state, "magnet");

  assert.equal(state.laserCharges, 3);
  assert.equal(state.magnetCharges, 2);
});

test("multiball은 최대 5까지 증가한다", () => {
  let state = INITIAL_POWERUP_STATE;
  state = applyPowerupState(state, "multiball");
  state = applyPowerupState(state, "multiball");
  state = applyPowerupState(state, "multiball");
  state = applyPowerupState(state, "multiball");
  state = applyPowerupState(state, "multiball");

  assert.equal(state.multiballCount, 5);
});

test("laser charge 소비는 0 아래로 내려가지 않는다", () => {
  let state = INITIAL_POWERUP_STATE;
  state = applyPowerupState(state, "laser");
  state = applyPowerupState(state, "laser");

  state = consumeLaserCharge(state);
  state = consumeLaserCharge(state);
  state = consumeLaserCharge(state);

  assert.equal(state.laserCharges, 0);
});

test("magnet charge 소비는 0 아래로 내려가지 않는다", () => {
  let state = INITIAL_POWERUP_STATE;
  state = applyPowerupState(state, "magnet");

  state = consumeMagnetCharge(state);
  state = consumeMagnetCharge(state);

  assert.equal(state.magnetCharges, 0);
});

test("활성 공 개수 동기화는 multiball을 1~5 범위로 clamp 한다", () => {
  const reducedState = syncActiveMultiballCount(INITIAL_POWERUP_STATE, 0);
  const expandedState = syncActiveMultiballCount(INITIAL_POWERUP_STATE, 9);

  assert.equal(reducedState.multiballCount, 1);
  assert.equal(expandedState.multiballCount, 5);
});
