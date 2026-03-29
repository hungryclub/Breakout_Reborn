import test from "node:test";
import assert from "node:assert/strict";

import { evolveMetaState, INITIAL_META_STATE } from "../src/game/systems/metaMath.ts";

test("메타 진행은 3회차 이후 시작 선택지를 3개로 확장한다", () => {
  let state = INITIAL_META_STATE;
  state = evolveMetaState(state);
  state = evolveMetaState(state);
  state = evolveMetaState(state);

  assert.equal(state.runsCompleted, 3);
  assert.equal(state.startingChoiceCount, 3);
});
