import test from "node:test";
import assert from "node:assert/strict";

import {
  beginRelativeDrag,
  endRelativeDrag,
  isPointerInInputZone,
  updateRelativeDrag,
} from "../src/game/systems/InputSystem.ts";
import { clampPaddleX } from "../src/game/systems/paddleMath.ts";

test("하단 35% 입력 구역 안쪽만 입력 시작을 허용한다", () => {
  assert.equal(isPointerInInputZone(1500, 1920), true);
  assert.equal(isPointerInInputZone(900, 1920), false);
});

test("플레이필드 바깥에서는 드래그 시작을 허용하지 않는다", () => {
  const outside = beginRelativeDrag(1, 40, 1800, 1920, 1);
  const inside = beginRelativeDrag(1, 400, 1800, 1920, 1);

  assert.equal(outside.active, false);
  assert.equal(inside.active, true);
});

test("상대 드래그는 절대 좌표가 아니라 이동량 기준으로 계산된다", () => {
  const started = beginRelativeDrag(1, 400, 1800, 1920, 1);
  const result = updateRelativeDrag(started, 1, 460, 1800, 1920);

  assert.equal(result.frame.active, true);
  assert.equal(result.frame.deltaX, 60);
});

test("감도 프리셋은 상대 이동량에 배율로 적용된다", () => {
  const started = beginRelativeDrag(1, 400, 1800, 1920, 0.85);
  const result = updateRelativeDrag(started, 1, 500, 1800, 1920);

  assert.equal(result.frame.deltaX, 85);
});

test("입력이 종료되면 active 상태가 해제된다", () => {
  const started = beginRelativeDrag(1, 400, 1800, 1920, 1);
  const ended = endRelativeDrag(started);

  assert.equal(ended.active, false);
  assert.equal(ended.pointerId, null);
});

test("드래그 중 입력 허용 구역을 벗어나면 이동이 즉시 중단된다", () => {
  const started = beginRelativeDrag(1, 400, 1800, 1920, 1);
  const result = updateRelativeDrag(started, 1, 460, 900, 1920);

  assert.equal(result.frame.active, false);
  assert.equal(result.state.active, false);
});

test("드래그 중 가로 화면 경계를 벗어나면 이동이 즉시 중단된다", () => {
  const started = beginRelativeDrag(1, 400, 1800, 1920, 1);
  const result = updateRelativeDrag(started, 1, 1200, 1800, 1920);

  assert.equal(result.frame.active, false);
  assert.equal(result.state.active, false);
});

test("패들은 화면 경계를 넘지 않도록 clamp 된다", () => {
  assert.equal(clampPaddleX(540, 1000, 120), 880);
  assert.equal(clampPaddleX(540, -1000, 120), 200);
});

test("확장된 패들도 좌우 플레이필드 경계를 넘지 않도록 다시 clamp 된다", () => {
  assert.equal(clampPaddleX(940, 0, 160.8), 839.2);
  assert.equal(clampPaddleX(140, 0, 160.8), 240.8);
});
