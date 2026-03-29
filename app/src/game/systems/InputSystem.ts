import type Phaser from "phaser";

import { INPUT_ZONE_RATIO } from "../config/inputConfig.ts";
import { isPointerWithinHorizontalBounds } from "./paddleMath.ts";

export interface InputRuntimeState {
  active: boolean;
  pointerId: number | null;
  lastX: number;
  sensitivity: number;
}

export interface InputFrame {
  active: boolean;
  deltaX: number;
}

export function isPointerInInputZone(
  pointerY: number,
  sceneHeight: number,
  zoneRatio = INPUT_ZONE_RATIO,
): boolean {
  return pointerY >= sceneHeight * (1 - zoneRatio);
}

export function beginRelativeDrag(
  pointerId: number,
  pointerX: number,
  pointerY: number,
  sceneHeight: number,
  sensitivity: number,
): InputRuntimeState {
  if (!isPointerInInputZone(pointerY, sceneHeight) || !isPointerWithinHorizontalBounds(pointerX)) {
    return {
      active: false,
      pointerId: null,
      lastX: pointerX,
      sensitivity,
    };
  }

  return {
    active: true,
    pointerId,
    lastX: pointerX,
    sensitivity,
  };
}

export function updateRelativeDrag(
  state: InputRuntimeState,
  pointerId: number,
  pointerX: number,
  pointerY: number,
  sceneHeight: number,
): { state: InputRuntimeState; frame: InputFrame } {
  if (!state.active || state.pointerId !== pointerId) {
    return {
      state,
      frame: { active: false, deltaX: 0 },
    };
  }

  if (!isPointerInInputZone(pointerY, sceneHeight) || !isPointerWithinHorizontalBounds(pointerX)) {
    return {
      state: endRelativeDrag(state),
      frame: { active: false, deltaX: 0 },
    };
  }

  const deltaX = (pointerX - state.lastX) * state.sensitivity;

  return {
    state: {
      ...state,
      lastX: pointerX,
    },
    frame: {
      active: true,
      deltaX,
    },
  };
}

export function endRelativeDrag(state: InputRuntimeState): InputRuntimeState {
  return {
    ...state,
    active: false,
    pointerId: null,
  };
}

export class InputSystem {
  private readonly scene: Phaser.Scene;
  private state: InputRuntimeState;

  constructor(scene: Phaser.Scene, sensitivity: number) {
    this.scene = scene;
    this.state = {
      active: false,
      pointerId: null,
      lastX: 0,
      sensitivity,
    };
  }

  setSensitivity(sensitivity: number): void {
    this.state = {
      ...this.state,
      sensitivity,
    };
  }

  begin(pointer: Phaser.Input.Pointer): boolean {
    this.state = beginRelativeDrag(
      pointer.id,
      pointer.x,
      pointer.y,
      this.scene.scale.height,
      this.state.sensitivity,
    );

    return this.state.active;
  }

  update(pointer: Phaser.Input.Pointer): InputFrame {
    const result = updateRelativeDrag(
      this.state,
      pointer.id,
      pointer.x,
      pointer.y,
      this.scene.scale.height,
    );
    this.state = result.state;
    return result.frame;
  }

  end(): InputFrame {
    this.state = endRelativeDrag(this.state);

    return {
      active: false,
      deltaX: 0,
    };
  }
}
