import type Phaser from "phaser";

import {
  BALL_ATTACH_OFFSET,
  BALL_HITBOX_RADIUS,
  BALL_LAUNCH_HORIZONTAL_RATIO,
  BALL_LAUNCH_LOCK_MS,
  BALL_MAX_BOUNCE_ANGLE,
  BALL_MIN_BOUNCE_ANGLE,
  BALL_PADDLE_COLLISION_LOCK_MS,
  BALL_RADIUS,
  BALL_START_SPEED,
} from "../config/ballConfig.ts";
import { Ball } from "../entities/Ball.ts";
import { Paddle } from "../entities/Paddle.ts";
import {
  createInitialLaunchVector,
  getAttachedBallPosition,
} from "./ballMath.ts";
import {
  computePaddleBounceVelocity,
  getPaddleImpactRatio,
  isCollisionLocked,
} from "./reflectionMath.ts";

export class BallSystem {
  private readonly ball: Ball;
  private attached = true;
  private lastLaunchAt = Number.NEGATIVE_INFINITY;
  private lastPaddleBounceAt = Number.NEGATIVE_INFINITY;

  constructor(ball: Ball) {
    this.ball = ball;

    const body = this.ball.body as Phaser.Physics.Arcade.Body;
    body.setBounce(1, 1);
    body.setCollideWorldBounds(true, 1, 1);
    body.checkCollision.down = false;
  }

  attachToPaddle(paddle: Paddle): void {
    const body = this.ball.body as Phaser.Physics.Arcade.Body;
    const attachedPosition = getAttachedBallPosition(
      paddle.x,
      paddle.y,
      paddle.displayHeight,
      BALL_HITBOX_RADIUS,
      BALL_ATTACH_OFFSET,
    );

    this.attached = true;
    body.stop();
    body.setVelocity(0, 0);
    body.reset(attachedPosition.x, attachedPosition.y);
  }

  syncAttachedToPaddle(paddle: Paddle): void {
    if (!this.attached) {
      return;
    }

    const attachedPosition = getAttachedBallPosition(
      paddle.x,
      paddle.y,
      paddle.displayHeight,
      BALL_HITBOX_RADIUS,
      BALL_ATTACH_OFFSET,
    );

    const body = this.ball.body as Phaser.Physics.Arcade.Body;
    body.reset(attachedPosition.x, attachedPosition.y);
  }

  tryLaunch(now: number): boolean {
    if (!this.attached || now - this.lastLaunchAt < BALL_LAUNCH_LOCK_MS) {
      return false;
    }

    const launchVector = createInitialLaunchVector(
      BALL_START_SPEED,
      BALL_LAUNCH_HORIZONTAL_RATIO,
    );
    return this.launchWithVelocity(launchVector.x, launchVector.y, now);
  }

  launchWithVelocity(velocityX: number, velocityY: number, now: number): boolean {
    if (!this.attached || now - this.lastLaunchAt < BALL_LAUNCH_LOCK_MS) {
      return false;
    }

    const body = this.ball.body as Phaser.Physics.Arcade.Body;
    this.attached = false;
    this.lastLaunchAt = now;
    body.setVelocity(velocityX, velocityY);
    return true;
  }

  isAttached(): boolean {
    return this.attached;
  }

  bounceOffPaddle(paddle: Paddle, now: number): boolean {
    if (this.attached || isCollisionLocked(now, this.lastPaddleBounceAt, BALL_PADDLE_COLLISION_LOCK_MS)) {
      return false;
    }

    const body = this.ball.body as Phaser.Physics.Arcade.Body;
    const speed = Math.max(body.velocity.length(), BALL_START_SPEED);
    const impactRatio = getPaddleImpactRatio(
      this.ball.x,
      paddle.x,
      paddle.displayWidth,
    );
    const reflection = computePaddleBounceVelocity(
      impactRatio,
      speed,
      body.velocity.x,
      BALL_MIN_BOUNCE_ANGLE,
      BALL_MAX_BOUNCE_ANGLE,
    );

    this.lastPaddleBounceAt = now;
    this.ball.y = paddle.y - paddle.displayHeight / 2 - BALL_HITBOX_RADIUS - 2;
    body.setVelocity(reflection.x, reflection.y);

    return true;
  }

  getView(): Ball {
    return this.ball;
  }
}
