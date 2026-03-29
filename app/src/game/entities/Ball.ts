import Phaser from "phaser";

import { TEXTURE_KEYS } from "../config/assetKeys";
import {
  BALL_RADIUS,
  BALL_STROKE_ALPHA,
  BALL_STROKE_COLOR,
} from "../config/ballConfig.ts";

export class Ball extends Phaser.GameObjects.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEXTURE_KEYS.ball);

    this.setOrigin(0.5);
    this.setDisplaySize(BALL_RADIUS * 2, BALL_RADIUS * 2);

    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(BALL_RADIUS);
    body.setAllowGravity(false);
  }

  applyHighlight(isPrimary: boolean): void {
    this.setTint(isPrimary ? 0xffffff : 0xd2e9ff);
    this.setAlpha(isPrimary ? 1 : BALL_STROKE_ALPHA);
    this.setScale(isPrimary ? 1 : 0.94);
    if (isPrimary) {
      this.clearTint();
    } else {
      this.setTint(BALL_STROKE_COLOR);
    }
  }
}
