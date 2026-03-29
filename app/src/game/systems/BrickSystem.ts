import Phaser from "phaser";

import { BRICK_DEBRIS_TEXTURE_KEYS } from "../config/assetKeys.ts";
import {
  BASIC_BRICK_SCORE,
  BRICK_COLUMNS,
  BRICK_GAP,
  BRICK_ROWS,
  BRICK_START_Y,
  EXPLOSION_RADIUS,
  HARD_BRICK_DURABILITY,
} from "../config/brickConfig.ts";
import { PLAYFIELD_GAME_WIDTH } from "../config/playfieldConfig.ts";
import { Brick, type BrickType } from "../entities/Brick.ts";
import {
  createCenteredBrickLayout,
  isNeighborBrick,
  resolveBrickHit,
} from "./brickMath.ts";
import { createStageLayout } from "./stageMath.ts";

export interface BrickHitEventResult {
  awardedScore: number;
  destroyedCount: number;
  dropRequested: boolean;
  brickType: BrickType;
}

export class BrickSystem {
  private readonly scene: Phaser.Scene;
  private readonly bricks: Brick[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createBricksForStage(stage: number): Brick[] {
    this.clearAll();
    const layout =
      stage === 1
        ? createCenteredBrickLayout(
            PLAYFIELD_GAME_WIDTH,
            BRICK_START_Y,
            BRICK_COLUMNS,
            BRICK_ROWS,
            132,
            48,
            BRICK_GAP,
          ).map((item) => ({ ...item, type: "normal" as const, durability: 1 }))
        : createStageLayout(stage);

    layout.forEach((item) => {
      const brick = new Brick(
        this.scene,
        item.x,
        item.y,
        item.type,
        item.type === "hard" ? HARD_BRICK_DURABILITY : item.durability,
        item.column,
        item.row,
        stage,
      );
      this.scene.add.existing(brick);
      this.bricks.push(brick);
    });

    return this.bricks;
  }

  private clearAll(): void {
    this.bricks.forEach((brick) => {
      if (brick.active) {
        brick.destroy();
      }
    });
    this.bricks.length = 0;
  }

  handleBallHit(brick: Brick): BrickHitEventResult {
    const result = resolveBrickHit(brick.getDurability(), BASIC_BRICK_SCORE);
    brick.setDurability(result.remainingDurability);

    if (!result.destroyed) {
      return {
        awardedScore: 0,
        destroyedCount: 0,
        dropRequested: false,
        brickType: brick.getBrickType(),
      };
    }

    const brickType = brick.getBrickType();
    let awardedScore = result.scoreAwarded;
    let dropRequested = false;
    let destroyedCount = 1;
    const botMode = Boolean(this.scene.registry.get("botMode"));

    if (!botMode) {
      const flash = this.scene.add.rectangle(
        brick.x,
        brick.y,
        brick.displayWidth,
        brick.displayHeight,
        brickType === "hard" ? 0xfff1c7 : brickType === "explosive" ? 0xffa85d : brickType === "item" ? 0x8ce8ff : 0xffe2cc,
        brickType === "explosive" ? 0.78 : 0.65,
      );
      const ring = this.scene.add.circle(
        brick.x,
        brick.y,
        brickType === "explosive" ? 34 : 22,
        brickType === "hard" ? 0xffd27d : brickType === "item" ? 0x74d7ff : 0xffa86b,
        0.22,
      ).setStrokeStyle(3, 0xf8f7ff, 0.82);

      this.scene.tweens.add({
        targets: [flash, ring],
        alpha: 0,
        scaleX: brickType === "explosive" ? 1.36 : 1.12,
        scaleY: brickType === "explosive" ? 1.36 : 1.12,
        duration: brickType === "hard" ? 120 : 90,
        onComplete: () => {
          flash.destroy();
          ring.destroy();
        },
      });
      this.spawnDebris(brick.x, brick.y, brickType);
    }

    if (brickType === "explosive") {
      const explosionResult = this.applyExplosion(brick);
      awardedScore += explosionResult.awardedScore;
      destroyedCount += explosionResult.destroyedCount;
    }

    if (brickType === "item") {
      dropRequested = true;
    }

    brick.destroy();

    return {
      awardedScore,
      destroyedCount,
      dropRequested,
      brickType,
    };
  }

  remainingCount(): number {
    return this.bricks.filter((brick) => brick.active).length;
  }

  getActiveBricks(): Brick[] {
    return this.bricks.filter((brick) => brick.active);
  }

  private applyExplosion(sourceBrick: Brick): {
    awardedScore: number;
    destroyedCount: number;
  } {
    const sourcePosition = sourceBrick.getGridPosition();
    let awardedScore = 0;
    let destroyedCount = 0;

    this.bricks.forEach((candidate) => {
      if (!candidate.active) {
        return;
      }

      const candidatePosition = candidate.getGridPosition();
      if (
        !isNeighborBrick(
          sourcePosition.column,
          sourcePosition.row,
          candidatePosition.column,
          candidatePosition.row,
          EXPLOSION_RADIUS,
        )
      ) {
        return;
      }

      const result = resolveBrickHit(candidate.getDurability(), BASIC_BRICK_SCORE);
      candidate.setDurability(result.remainingDurability);

      if (result.destroyed) {
        awardedScore += result.scoreAwarded;
        destroyedCount += 1;
        candidate.destroy();
      }
    });

    return {
      awardedScore,
      destroyedCount,
    };
  }

  private spawnDebris(x: number, y: number, brickType: BrickType): void {
    const debrisKey = BRICK_DEBRIS_TEXTURE_KEYS[brickType];
    const pieceCount = brickType === "explosive" ? 5 : brickType === "hard" ? 4 : 3;
    const sceneAny = this.scene as Phaser.Scene & {
      registry: Phaser.Data.DataManager;
    };
    const stageAccent = (sceneAny.registry.get("stageAccentColor") as number | undefined) ?? 0xffffff;

    for (let index = 0; index < pieceCount; index += 1) {
      const angle = (-50 + index * (100 / Math.max(pieceCount - 1, 1))) * (Math.PI / 180);
      const distance = brickType === "explosive" ? 42 : 28;
      const shard = this.scene.add
        .image(x, y, debrisKey)
        .setDisplaySize(16, 16)
        .setRotation(Phaser.Math.FloatBetween(-0.7, 0.7))
        .setTint(index % 2 === 0 ? stageAccent : 0xffffff);
      const spark = this.scene.add.circle(x, y, brickType === "explosive" ? 5 : 3, stageAccent, 0.28);

      this.scene.tweens.add({
        targets: shard,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance - 10,
        angle: Phaser.Math.Between(-80, 80),
        alpha: 0,
        scaleX: 0.6,
        scaleY: 0.6,
        duration: brickType === "explosive" ? 220 : 160,
        onComplete: () => {
          shard.destroy();
        },
      });
      this.scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * (distance * 0.7),
        y: y + Math.sin(angle) * (distance * 0.7),
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: brickType === "explosive" ? 200 : 130,
        onComplete: () => {
          spark.destroy();
        },
      });
    }
  }
}
