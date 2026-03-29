import type Phaser from "phaser";

import type { PowerupType } from "../config/powerupConfig.ts";
import { Paddle } from "../entities/Paddle.ts";
import {
  applyPowerupState,
  consumeLaserCharge,
  consumeMagnetCharge,
  INITIAL_POWERUP_STATE,
  syncActiveMultiballCount,
  type PowerupState,
} from "./powerupEffectMath.ts";

export class PowerupEffectSystem {
  private state: PowerupState = INITIAL_POWERUP_STATE;

  apply(type: PowerupType, paddle: Paddle): PowerupState {
    this.state = applyPowerupState(this.state, type);
    this.applyPaddleState(paddle);

    return this.state;
  }

  consumeLaserCharge(): boolean {
    if (this.state.laserCharges <= 0) {
      return false;
    }

    this.state = consumeLaserCharge(this.state);

    return true;
  }

  consumeMagnetCharge(): boolean {
    if (this.state.magnetCharges <= 0) {
      return false;
    }

    this.state = consumeMagnetCharge(this.state);

    return true;
  }

  syncMultiballCount(activeBallCount: number): PowerupState {
    this.state = syncActiveMultiballCount(this.state, activeBallCount);

    return this.state;
  }

  reset(paddle: Paddle): PowerupState {
    this.state = INITIAL_POWERUP_STATE;
    this.applyPaddleState(paddle);

    return this.state;
  }

  getState(): PowerupState {
    return this.state;
  }

  private applyPaddleState(paddle: Paddle): void {
    const scaleX = 1 + this.state.expandStacks * 0.12;
    paddle.setScale(scaleX, 1);
    const body = paddle.body as Phaser.Physics.Arcade.StaticBody | undefined;
    body?.updateFromGameObject();

    if (this.state.laserCharges > 0) {
      paddle.applyPowerTint(0xff6474);
      return;
    }

    paddle.applyPowerTint();
  }
}
