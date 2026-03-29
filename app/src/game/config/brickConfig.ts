import { PLAYFIELD_TOP } from "./playfieldConfig.ts";

export const BRICK_COLUMNS = 6;
export const BRICK_ROWS = 4;
export const BRICK_WIDTH = 132;
export const BRICK_HEIGHT = 48;
export const BRICK_HITBOX_WIDTH = 128;
export const BRICK_HITBOX_HEIGHT = 40;
export const BRICK_HITBOX_OFFSET_Y = -2;
export const BRICK_GAP = 16;
export const BRICK_TOP_PADDING = 16;
export const BRICK_START_Y = PLAYFIELD_TOP + BRICK_TOP_PADDING + BRICK_HEIGHT / 2;
export const BASIC_BRICK_SCORE = 100;
export const HARD_BRICK_DURABILITY = 3;
export const EXPLOSION_RADIUS = 1;

export const BRICK_TYPE_COLORS = {
  normal: 0xff8f5a,
  hard: 0x5ab3ff,
  explosive: 0xff5a7a,
  item: 0xf2d95c,
} as const;
