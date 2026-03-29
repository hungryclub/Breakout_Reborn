export interface BrickLayoutItem {
  x: number;
  y: number;
  column: number;
  row: number;
  type: "normal" | "hard" | "explosive" | "item";
  durability: number;
}

export interface BrickHitResult {
  remainingDurability: number;
  destroyed: boolean;
  scoreAwarded: number;
}

export function createStageBrickType(
  row: number,
  column: number,
): BrickLayoutItem["type"] {
  if (row === 0 && column % 3 === 1) {
    return "hard";
  }

  if (row === 1 && column % 3 === 2) {
    return "explosive";
  }

  if (row === 2 && column % 3 === 0) {
    return "item";
  }

  return "normal";
}

export function createCenteredBrickLayout(
  playfieldWidth: number,
  startY: number,
  columns: number,
  rows: number,
  brickWidth: number,
  brickHeight: number,
  gap: number,
): BrickLayoutItem[] {
  const totalWidth = columns * brickWidth + (columns - 1) * gap;
  const startX = (playfieldWidth - totalWidth) / 2 + brickWidth / 2;
  const layout: BrickLayoutItem[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      layout.push({
        x: startX + column * (brickWidth + gap),
        y: startY + row * (brickHeight + gap),
        column,
        row,
        type: createStageBrickType(row, column),
        durability: createStageBrickType(row, column) === "hard" ? 3 : 1,
      });
    }
  }

  return layout;
}

export function resolveBrickHit(
  currentDurability: number,
  baseScore: number,
): BrickHitResult {
  const remainingDurability = Math.max(0, currentDurability - 1);
  const destroyed = remainingDurability === 0;

  return {
    remainingDurability,
    destroyed,
    scoreAwarded: destroyed ? baseScore : 0,
  };
}

export function isNeighborBrick(
  sourceColumn: number,
  sourceRow: number,
  targetColumn: number,
  targetRow: number,
  radius: number,
): boolean {
  return (
    Math.abs(sourceColumn - targetColumn) <= radius &&
    Math.abs(sourceRow - targetRow) <= radius &&
    !(sourceColumn === targetColumn && sourceRow === targetRow)
  );
}
