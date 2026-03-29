import { PLAYFIELD_LEFT, PLAYFIELD_RIGHT } from "../config/playfieldConfig.ts";

export function clampPaddleX(
  currentX: number,
  deltaX: number,
  halfWidth: number,
  minX = PLAYFIELD_LEFT,
  maxX = PLAYFIELD_RIGHT,
): number {
  const nextX = currentX + deltaX;
  return Math.max(minX + halfWidth, Math.min(maxX - halfWidth, nextX));
}

export function isPointerWithinHorizontalBounds(
  pointerX: number,
  minX = PLAYFIELD_LEFT,
  maxX = PLAYFIELD_RIGHT,
): boolean {
  return pointerX >= minX && pointerX <= maxX;
}
