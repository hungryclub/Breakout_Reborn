import Phaser from "phaser";

import { TEXTURE_KEYS } from "../config/assetKeys";

export const PADDLE_WIDTH = 240;
export const PADDLE_HEIGHT = 36;
export const PADDLE_BASE_TINT = 0x43d17a;

export class Paddle extends Phaser.GameObjects.Image {
  private baseTint = PADDLE_BASE_TINT;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEXTURE_KEYS.paddle);

    this.setOrigin(0.5);
    this.setDisplaySize(PADDLE_WIDTH, PADDLE_HEIGHT);

    scene.physics.add.existing(this, true);

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(PADDLE_WIDTH, PADDLE_HEIGHT);
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
