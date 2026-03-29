import Phaser from "phaser";

import type { PowerupType } from "../config/powerupConfig.ts";
import { Powerup } from "../entities/Powerup.ts";
import { Paddle } from "../entities/Paddle.ts";
import { pickPowerupType } from "./powerupMath.ts";

export interface CollectedPowerupResult {
  type: PowerupType;
}

export class PowerupSystem {
  private readonly scene: Phaser.Scene;
  private readonly powerups: Powerup[] = [];
  private dropSeed = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  spawnDrop(x: number, y: number): Powerup {
    const powerupType = pickPowerupType(this.dropSeed);
    this.dropSeed += 1;

    const powerup = new Powerup(this.scene, x, y, powerupType);
    this.scene.add.existing(powerup);
    this.powerups.push(powerup);

    return powerup;
  }

  collect(powerup: Powerup): CollectedPowerupResult {
    const result = {
      type: powerup.powerupType,
    };

    powerup.destroy();
    return result;
  }

  cleanupOffscreen(limitY: number): void {
    this.powerups.forEach((powerup) => {
      if (powerup.active && powerup.y > limitY) {
        powerup.destroy();
      }
    });
  }

  clearAll(): void {
    this.powerups.forEach((powerup) => {
      if (powerup.active) {
        powerup.destroy();
      }
    });
    this.powerups.length = 0;
  }

  getActivePowerups(): Powerup[] {
    return this.powerups.filter((powerup) => powerup.active);
  }

  bindToPaddle(
    powerup: Powerup,
    paddle: Paddle,
    onCollected: (result: CollectedPowerupResult) => void,
  ): void {
    this.scene.physics.add.overlap(powerup, paddle, () => {
      if (!powerup.active) {
        return;
      }

      onCollected(this.collect(powerup));
    });
  }
}
