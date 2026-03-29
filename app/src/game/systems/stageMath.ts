import type { BrickLayoutItem } from "./brickMath.ts";
import { createCenteredBrickLayout } from "./brickMath.ts";

export function createStageLayout(stage: number): BrickLayoutItem[] {
  const base = createCenteredBrickLayout(1080, 250, 6, 4, 132, 48, 16);

  return base.map((item) => {
    if (stage === 1) {
      if (item.row === 0) {
        return { ...item, type: "normal", durability: 1 };
      }
      return item;
    }

    if (stage === 2) {
      if (item.row <= 1 && item.column % 2 === 0) {
        return { ...item, type: "hard", durability: 3 };
      }
      if (item.row === 2 && item.column % 3 === 1) {
        return { ...item, type: "item", durability: 1 };
      }
      return { ...item, type: "normal", durability: 1 };
    }

    if (stage === 3) {
      if (item.row === 1 || item.row === 2) {
        return { ...item, type: "explosive", durability: 1 };
      }
      return item;
    }

    if (item.column % 2 === 0) {
      return { ...item, type: "hard", durability: 3 };
    }

    return { ...item, type: "explosive", durability: 1 };
  });
}
