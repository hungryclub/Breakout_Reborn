import type { BrickType } from "../entities/Brick";
import type { PowerupType } from "./powerupConfig";

export const TEXTURE_KEYS = {
  ball: "ball-core",
  paddle: "paddle-core",
  menuBackdrop: "menu-backdrop",
  resultBackdrop: "result-backdrop",
} as const;

export const UI_ICON_TEXTURE_KEYS = {
  life: "ui-life",
  score: "ui-score",
  stage: "ui-stage",
  combo: "ui-combo",
} as const;

export const STAGE_FRAME_TEXTURE_KEYS: Record<number, string> = {
  1: "playfield-frame-stage-1",
  2: "playfield-frame-stage-2",
  3: "playfield-frame-stage-3",
  4: "playfield-frame-stage-4",
};

export const BRICK_TEXTURE_KEYS: Record<BrickType, string> = {
  normal: "brick-normal",
  hard: "brick-hard",
  explosive: "brick-explosive",
  item: "brick-item",
};

export const BRICK_DEBRIS_TEXTURE_KEYS: Record<BrickType, string> = {
  normal: "debris-normal",
  hard: "debris-hard",
  explosive: "debris-explosive",
  item: "debris-item",
};

export const POWERUP_TEXTURE_KEYS: Record<PowerupType, string> = {
  expand: "powerup-expand",
  laser: "powerup-laser",
  multiball: "powerup-multiball",
  magnet: "powerup-magnet",
};

export const AUDIO_CUE_KEYS = {
  launch: "sfx-launch",
  "paddle-bounce": "sfx-paddle-bounce",
  "brick-hit": "sfx-brick-hit",
  "combo-peak": "sfx-combo-peak",
  "reward-selected": "sfx-reward-selected",
  "laser-burst": "sfx-laser-burst",
  "multiball-split": "sfx-multiball-split",
  "magnet-catch": "sfx-magnet-catch",
  "ball-lost": "sfx-ball-lost",
  failure: "sfx-failure",
  clear: "sfx-clear",
  "stage-shift": "sfx-stage-shift",
} as const;

export const BGM_TRACK_KEYS: Record<number, string> = {
  1: "bgm-stage-1",
  2: "bgm-stage-2",
  3: "bgm-stage-3",
  4: "bgm-stage-4",
};
