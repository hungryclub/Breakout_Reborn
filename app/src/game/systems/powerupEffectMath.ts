import type { PowerupType } from "../config/powerupConfig.ts";

export interface PowerupState {
  expandStacks: number;
  laserCharges: number;
  multiballCount: number;
  magnetCharges: number;
}

export const INITIAL_POWERUP_STATE: PowerupState = {
  expandStacks: 0,
  laserCharges: 0,
  multiballCount: 1,
  magnetCharges: 0,
};

export function applyPowerupState(
  state: PowerupState,
  type: PowerupType,
): PowerupState {
  switch (type) {
    case "expand":
      return {
        ...state,
        expandStacks: Math.min(3, state.expandStacks + 1),
      };
    case "laser":
      return {
        ...state,
        laserCharges: Math.min(3, state.laserCharges + 1),
      };
    case "multiball":
      return {
        ...state,
        multiballCount: Math.min(5, state.multiballCount + 1),
      };
    case "magnet":
      return {
        ...state,
        magnetCharges: Math.min(3, state.magnetCharges + 1),
      };
  }
}

export function consumeLaserCharge(state: PowerupState): PowerupState {
  return {
    ...state,
    laserCharges: Math.max(0, state.laserCharges - 1),
  };
}

export function consumeMagnetCharge(state: PowerupState): PowerupState {
  return {
    ...state,
    magnetCharges: Math.max(0, state.magnetCharges - 1),
  };
}

export function syncActiveMultiballCount(
  state: PowerupState,
  activeBallCount: number,
): PowerupState {
  return {
    ...state,
    multiballCount: Math.max(1, Math.min(5, activeBallCount)),
  };
}
