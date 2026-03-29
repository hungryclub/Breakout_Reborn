import Phaser from "phaser";

import { POWERUP_TEXTURE_KEYS } from "../config/assetKeys";
import {
  POWERUP_FALL_SPEED,
  POWERUP_SIZE,
  type PowerupType,
} from "../config/powerupConfig.ts";

export class Powerup extends Phaser.GameObjects.Image {
  readonly powerupType: PowerupType;

  constructor(scene: Phaser.Scene, x: number, y: number, powerupType: PowerupType) {
    super(scene, x, y, POWERUP_TEXTURE_KEYS[powerupType]);

    this.powerupType = powerupType;
    this.setOrigin(0.5);
    this.setDisplaySize(POWERUP_SIZE, POWERUP_SIZE);

    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocity(0, POWERUP_FALL_SPEED);
    body.setSize(POWERUP_SIZE, POWERUP_SIZE);
  }
}
