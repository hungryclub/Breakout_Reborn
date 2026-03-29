import { Paddle } from "../entities/Paddle.ts";
import { clampPaddleX } from "./paddleMath";

export class PaddleSystem {
  private readonly paddle: Paddle;

  constructor(paddle: Paddle) {
    this.paddle = paddle;
  }

  moveBy(deltaX: number): void {
    this.paddle.x = clampPaddleX(this.paddle.x, deltaX, this.paddle.displayWidth / 2);
    this.syncBody();
  }

  moveTo(targetX: number): void {
    this.paddle.x = clampPaddleX(targetX, 0, this.paddle.displayWidth / 2);
    this.syncBody();
  }

  stop(): void {
    // Relative drag has no inertia, so stop is an explicit no-op hook.
  }

  clampWithinBounds(): void {
    this.paddle.x = clampPaddleX(this.paddle.x, 0, this.paddle.displayWidth / 2);
    this.syncBody();
  }

  getView(): Paddle {
    return this.paddle;
  }

  private syncBody(): void {
    const body = this.paddle.body as Phaser.Physics.Arcade.StaticBody | undefined;
    body?.updateFromGameObject();
  }
}
