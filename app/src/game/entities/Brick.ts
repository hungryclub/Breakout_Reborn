import Phaser from "phaser";

import { BRICK_TEXTURE_KEYS } from "../config/assetKeys.ts";
import {
  BRICK_HEIGHT,
  BRICK_HITBOX_HEIGHT,
  BRICK_HITBOX_OFFSET_Y,
  BRICK_HITBOX_WIDTH,
  BRICK_WIDTH,
} from "../config/brickConfig.ts";

export type BrickType = "normal" | "hard" | "explosive" | "item";

export class Brick extends Phaser.GameObjects.Image {
  private durability: number;
  private readonly brickType: BrickType;
  private readonly gridColumn: number;
  private readonly gridRow: number;
  private readonly stage: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    brickType: BrickType,
    durability = 1,
    gridColumn = 0,
    gridRow = 0,
    stage = 1,
  ) {
    super(scene, x, y, BRICK_TEXTURE_KEYS[brickType]);

    this.durability = durability;
    this.brickType = brickType;
    this.gridColumn = gridColumn;
    this.gridRow = gridRow;
    this.stage = stage;

    this.setOrigin(0.5);
    this.setDisplaySize(BRICK_WIDTH, BRICK_HEIGHT);
    this.applyTypeStyle();

    scene.physics.add.existing(this, true);

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(BRICK_HITBOX_WIDTH, BRICK_HITBOX_HEIGHT);
    body.setOffset(
      (BRICK_WIDTH - BRICK_HITBOX_WIDTH) / 2,
      (BRICK_HEIGHT - BRICK_HITBOX_HEIGHT) / 2 + BRICK_HITBOX_OFFSET_Y,
    );
    body.updateFromGameObject();
  }

  getDurability(): number {
    return this.durability;
  }

  setDurability(durability: number): void {
    this.durability = durability;
    this.applyTypeStyle();
  }

  getBrickType(): BrickType {
    return this.brickType;
  }

  getGridPosition(): { column: number; row: number } {
    return {
      column: this.gridColumn,
      row: this.gridRow,
    };
  }

  private applyTypeStyle(): void {
    const stagePalette: Record<number, Record<BrickType, number>> = {
      1: { normal: 0xffffff, hard: 0xdff3ff, explosive: 0xfff0d5, item: 0xe2fff0 },
      2: { normal: 0xe6f3ff, hard: 0xc5dfff, explosive: 0xffe8cc, item: 0xdff1ff },
      3: { normal: 0xffe2cf, hard: 0xf3d8ff, explosive: 0xffc58a, item: 0xfff1bf },
      4: { normal: 0xffd9f1, hard: 0xf1d4ff, explosive: 0xffb0c8, item: 0xd4e4ff },
    };
    this.setTint(stagePalette[this.stage]?.[this.brickType] ?? 0xffffff);

    if (this.brickType === "hard") {
      this.setAlpha(0.48 + (this.durability / 3) * 0.52);
      this.setScale(this.stage >= 3 ? 1.01 : 1);
      return;
    }

    if (this.brickType === "explosive") {
      this.setScale(this.stage >= 3 ? 1.06 : 1.02);
      return;
    }

    this.setAlpha(1);
    this.setScale(this.brickType === "item" && this.stage >= 4 ? 1.03 : 1);
  }
}
