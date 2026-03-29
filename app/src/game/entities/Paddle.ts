import Phaser from "phaser";

import { TEXTURE_KEYS } from "../config/assetKeys.ts";

export const PADDLE_WIDTH = 240;
export const PADDLE_HEIGHT = 36;
export const PADDLE_HITBOX_WIDTH = 236;
export const PADDLE_HITBOX_HEIGHT = 24;
export const PADDLE_HITBOX_OFFSET_Y = -2;
export const PADDLE_BASE_TINT = 0x43d17a;

export class Paddle extends Phaser.GameObjects.Image {
  private baseTint = PADDLE_BASE_TINT;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEXTURE_KEYS.paddle);

    this.setOrigin(0.5);
    this.setDisplaySize(PADDLE_WIDTH, PADDLE_HEIGHT);

    scene.physics.add.existing(this, true);

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(PADDLE_HITBOX_WIDTH, PADDLE_HITBOX_HEIGHT);
    body.setOffset(
      (PADDLE_WIDTH - PADDLE_HITBOX_WIDTH) / 2,
      (PADDLE_HEIGHT - PADDLE_HITBOX_HEIGHT) / 2 + PADDLE_HITBOX_OFFSET_Y,
    );
    body.updateFromGameObject();

    this.setTint(this.baseTint);
  }

  applyStageAccent(fillColor: number, _strokeColor: number): void {
    this.baseTint = fillColor;
    this.setTint(fillColor);
  }

  applyPowerTint(activeTint?: number): void {
    this.setTint(activeTint ?? this.baseTint);
  }
}
