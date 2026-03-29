import Phaser from "phaser";

import { BALL_HITBOX_RADIUS, BALL_RADIUS } from "../config/ballConfig.ts";
import { STAGE_FRAME_TEXTURE_KEYS } from "../config/assetKeys.ts";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig.ts";
import { INPUT_SENSITIVITY_PRESETS, DEFAULT_INPUT_SENSITIVITY } from "../config/inputConfig.ts";
import { loadRuntimeSettings, type RuntimeSettings } from "../config/settings.ts";
import {
  PLAYFIELD_BOTTOM,
  PLAYFIELD_HEIGHT,
  PLAYFIELD_LEFT,
  PLAYFIELD_TOP,
  PLAYFIELD_WIDTH,
} from "../config/playfieldConfig.ts";
import type { PowerupType } from "../config/powerupConfig.ts";
import {
  STAGE_BACKGROUND_COLORS,
  STAGE_PRESENTATION_PROFILES,
} from "../config/presentationConfig.ts";
import { STAGE_COUNT } from "../config/stageConfig.ts";
import { SceneKeys } from "../core/SceneKeys.ts";
import { Ball } from "../entities/Ball.ts";
import { Brick } from "../entities/Brick.ts";
import { Paddle } from "../entities/Paddle.ts";
import { BallSystem } from "../systems/BallSystem.ts";
import { BrickSystem } from "../systems/BrickSystem.ts";
import { ComboSystem } from "../systems/ComboSystem.ts";
import { InputSystem } from "../systems/InputSystem.ts";
import { MetaSystem } from "../systems/MetaSystem.ts";
import { AudioCueSystem } from "../systems/AudioCueSystem.ts";
import { MusicSystem } from "../systems/MusicSystem.ts";
import { PaddleSystem } from "../systems/PaddleSystem.ts";
import { PowerupEffectSystem } from "../systems/PowerupEffectSystem.ts";
import { PowerupSystem } from "../systems/PowerupSystem.ts";
import { getBallPulseScale, getTrailStyle } from "../systems/presentationMath.ts";
import type { BrickType } from "../entities/Brick.ts";
import { shouldForcePaddleBounce, shouldProcessPaddleBounce } from "../systems/reflectionMath.ts";
import { createRewardChoices, type RewardChoice } from "../systems/rewardMath.ts";
import { TelemetrySystem } from "../systems/TelemetrySystem.ts";

interface TapCandidate {
  pointerId: number;
  startX: number;
  startY: number;
  moved: boolean;
}

export class GameScene extends Phaser.Scene {
  private inputSystem?: InputSystem;
  private paddleSystem?: PaddleSystem;
  private primaryBallSystem?: BallSystem;
  private readonly ballSystems: BallSystem[] = [];
  private brickSystem?: BrickSystem;
  private comboSystem?: ComboSystem;
  private powerupSystem?: PowerupSystem;
  private powerupEffectSystem?: PowerupEffectSystem;
  private metaSystem?: MetaSystem;
  private telemetrySystem?: TelemetrySystem;
  private audioCueSystem?: AudioCueSystem;
  private musicSystem?: MusicSystem;
  private instructionText?: Phaser.GameObjects.Text;
  private stageBackdrop?: Phaser.GameObjects.Container;
  private pendingStartRewardTimer?: Phaser.Time.TimerEvent;
  private tapCandidate?: TapCandidate;
  private score = 0;
  private currentStage = 1;
  private lives = 3;
  private pendingRewardReason: "stage_clear" | "start_bonus" | null = null;
  private firstComboTracked = false;
  private runEnding = false;
  private lastBallTrailAt = 0;
  private lastPowerupTrailAt = 0;
  private lastBloomPulseAt = 0;
  private botMode = false;
  private debugHeartbeat = 0;

  constructor() {
    super(SceneKeys.Game);
  }

  create(): void {
    const runtimeSettings = loadRuntimeSettings();
    this.botMode = Boolean(this.registry.get("botMode"));
    this.cameras.main.setBackgroundColor(STAGE_BACKGROUND_COLORS[this.currentStage]);
    this.physics.world.setBounds(PLAYFIELD_LEFT, PLAYFIELD_TOP, PLAYFIELD_WIDTH, PLAYFIELD_HEIGHT);
    this.physics.world.setBoundsCollision(true, true, true, false);
    this.audioCueSystem = new AudioCueSystem(this.sound, this.cache.audio);
    this.musicSystem = new MusicSystem(this, this.sound, this.cache.audio);
    this.audioCueSystem.setEnabled(this.botMode ? false : runtimeSettings.sfxEnabled);
    this.musicSystem.setEnabled(this.botMode ? false : runtimeSettings.bgmEnabled);
    this.renderStageBackdrop(this.currentStage);

    this.add.rectangle(
      PLAYFIELD_LEFT + PLAYFIELD_WIDTH / 2,
      PLAYFIELD_TOP + PLAYFIELD_HEIGHT / 2,
      PLAYFIELD_WIDTH,
      PLAYFIELD_HEIGHT,
      0x12233c,
      0.9,
    );
    this.add
      .text(GAME_WIDTH / 2, 580, "PRE-LAUNCH", {
        color: "#6dd7ff",
        fontFamily: "Trebuchet MS",
        fontSize: "36px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 880, "Drag, then tap to launch", {
        color: "#f4f7fb",
        fontFamily: "Trebuchet MS",
        fontSize: "62px",
        fontStyle: "bold",
        align: "center",
      })
      .setOrigin(0.5);

    const paddleY = PLAYFIELD_BOTTOM - 142;
    const instructionY = Math.min(GAME_HEIGHT - 180, PLAYFIELD_BOTTOM + 110);
    const paddle = new Paddle(this, GAME_WIDTH / 2, paddleY);
    this.add.existing(paddle);
    this.paddleSystem = new PaddleSystem(paddle);
    this.applyStagePresentation(this.currentStage);

    this.brickSystem = new BrickSystem(this);
    this.comboSystem = new ComboSystem();
    this.powerupSystem = new PowerupSystem(this);
    this.powerupEffectSystem = new PowerupEffectSystem();
    this.metaSystem = new MetaSystem();
    this.telemetrySystem = new TelemetrySystem();

    const meta = this.metaSystem.load();
    this.resetBallsToSingleAttached();
    this.spawnStageBricks();

    this.inputSystem = new InputSystem(
      this,
      INPUT_SENSITIVITY_PRESETS[runtimeSettings.sensitivity ?? DEFAULT_INPUT_SENSITIVITY],
    );

    this.bindInputHandlers();
    this.bindLifecycleEvents();

    this.game.events.emit("launch-prompt-visible", true);
    this.game.events.emit("score-changed", this.score);
    this.game.events.emit("combo-changed", { comboCount: 0, feedbackTier: "basic" });
    this.game.events.emit("powerup-state-changed", this.powerupEffectSystem.getState());
    this.game.events.emit("stage-changed", this.currentStage);
    this.game.events.emit("life-changed", this.lives);

    this.queueStartingChoices(meta.startingChoiceCount);

    this.instructionText = this.add
      .text(
        GAME_WIDTH / 2,
        instructionY,
        "하단 35% 영역에서 드래그해 패들을 움직여 보세요.\n탭 한 번이면 공이 패들 위에서 즉시 발사됩니다.",
        {
          align: "center",
          color: "#9db7d8",
          fontFamily: "Trebuchet MS",
          fontSize: "30px",
          wordWrap: { width: 720 },
        },
      )
      .setOrigin(0.5);
  }

  update(): void {
    this.debugHeartbeat += 1;

    const paddle = this.paddleSystem?.getView();
    if (paddle && this.ballSystems.length > 0) {
      this.ballSystems.forEach((ballSystem) => {
        ballSystem.syncAttachedToPaddle(paddle);
      });
      this.powerupSystem?.cleanupOffscreen(GAME_HEIGHT + 80);
    }

    for (const ballSystem of [...this.ballSystems]) {
      const ball = ballSystem.getView();
      const body = ball.body as Phaser.Physics.Arcade.Body;
      ball.setScale(getBallPulseScale(this.time.now));
      ball.applyHighlight(ballSystem === this.primaryBallSystem);

      if (this.applyManualPaddleBounce(ballSystem)) {
        continue;
      }

      if (body.top > PLAYFIELD_BOTTOM) {
        this.handleBallLost(ballSystem);
      }
    }

    this.renderBallTrails();
    this.renderPowerupTrails();
    this.renderStageBloomPulse();
  }

  private bindLifecycleEvents(): void {
    this.game.events.on("reward-selected", this.handleRewardSelected, this);
    this.game.events.on("retry-run", this.handleRetryRun, this);
    this.game.events.on("resume-run", this.handleResumeRun, this);
    this.game.events.on("runtime-settings-changed", this.handleRuntimeSettingsChanged, this);

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.pendingStartRewardTimer?.remove(false);
      this.pendingStartRewardTimer = undefined;
      this.game.events.off("reward-selected", this.handleRewardSelected, this);
      this.game.events.off("retry-run", this.handleRetryRun, this);
      this.game.events.off("resume-run", this.handleResumeRun, this);
      this.game.events.off("runtime-settings-changed", this.handleRuntimeSettingsChanged, this);
      this.musicSystem?.stop();
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", this.handleVisibilityChange);
      }
    });
  }

  private bindInputHandlers(): void {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.audioCueSystem?.unlock();
      if (!this.botMode) {
        this.musicSystem?.unlock();
        this.musicSystem?.playStageLoop(this.currentStage);
      }
      this.inputSystem?.begin(pointer);
      this.tapCandidate = this.isPointerInsidePlayfield(pointer)
        ? { pointerId: pointer.id, startX: pointer.x, startY: pointer.y, moved: false }
        : undefined;
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      const frame = this.inputSystem?.update(pointer);
      if (frame?.active && frame.deltaX !== 0) {
        this.paddleSystem?.moveBy(frame.deltaX);
        const paddle = this.paddleSystem?.getView();
        if (paddle) {
          this.ballSystems.forEach((ballSystem) => {
            ballSystem.syncAttachedToPaddle(paddle);
          });
        }
      } else if (frame && !frame.active) {
        this.tapCandidate = undefined;
        this.paddleSystem?.stop();
      }

      if (
        this.tapCandidate &&
        this.tapCandidate.pointerId === pointer.id &&
        (Math.abs(pointer.x - this.tapCandidate.startX) > 12 ||
          Math.abs(pointer.y - this.tapCandidate.startY) > 12)
      ) {
        this.tapCandidate.moved = true;
      }
    });

    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (this.tapCandidate && this.tapCandidate.pointerId === pointer.id && !this.tapCandidate.moved) {
        if (this.tryFireLaserBurst()) {
          const paddle = this.paddleSystem?.getView();
          if (paddle) {
            this.game.events.emit("powerup-state-changed", this.powerupEffectSystem?.getState());
          }
        } else if (this.primaryBallSystem?.tryLaunch(this.time.now)) {
          this.playStageCue("launch");
          this.hideLaunchInstruction();
          this.syncMultiballGameplay();
        }
      }

      this.tapCandidate = undefined;
      this.inputSystem?.end();
      this.paddleSystem?.stop();
    });

    this.input.on("gameout", () => {
      this.tapCandidate = undefined;
      this.inputSystem?.end();
      this.paddleSystem?.stop();
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off("pointerdown");
      this.input.off("pointermove");
      this.input.off("pointerup");
      this.input.off("gameout");
    });
  }

  private spawnStageBricks(): void {
    const bricks = this.brickSystem?.createBricksForStage(this.currentStage) ?? [];
    if (this.botMode) {
      bricks.forEach((brick) => {
        brick.setAlpha(1);
        brick.setScale(1);
      });
    } else {
      this.animateStageIntro(bricks);
    }
    this.ballSystems.forEach((ballSystem) => {
      const ball = ballSystem.getView();
      bricks.forEach((brick) => {
        this.physics.add.collider(ball, brick, () => {
          this.handleBrickHit(brick);
        });
      });
    });
  }

  private hideLaunchInstruction(): void {
    this.game.events.emit("launch-prompt-visible", false);

    if (!this.instructionText) {
      return;
    }

    this.tweens.killTweensOf(this.instructionText);
    this.tweens.add({
      targets: this.instructionText,
      alpha: 0,
      duration: 120,
    });
  }

  private handlePaddleBounce(ballSystem: BallSystem): void {
    const paddle = this.paddleSystem?.getView();
    if (!paddle) {
      return;
    }

    if (this.powerupEffectSystem?.consumeMagnetCharge()) {
      ballSystem.attachToPaddle(paddle);
      this.game.events.emit("powerup-state-changed", this.powerupEffectSystem.getState());
      this.emitImpactEvent("magnet-catch", STAGE_PRESENTATION_PROFILES[this.currentStage].accentColor);
      return;
    }

    if (!ballSystem.bounceOffPaddle(paddle, this.time.now)) {
      return;
    }

    if (!this.botMode) {
      this.tweens.killTweensOf(paddle);
      paddle.setScale(paddle.scaleX * 1.02, 1);
      this.tweens.add({
        targets: paddle,
        scaleX: paddle.scaleX / 1.02,
        duration: 90,
      });
      this.cameras.main.shake(60, 0.0028, true);
    }
    this.emitImpactEvent("paddle-bounce", STAGE_PRESENTATION_PROFILES[this.currentStage].accentColor);
  }

  private handleBrickHit(brick: Brick): void {
    if (!brick.active) {
      return;
    }

    const result = this.brickSystem?.handleBallHit(brick);
    if (!result || (result.awardedScore === 0 && !result.dropRequested)) {
      return;
    }

    let scoreDelta = result.awardedScore;
    let comboPayload = { comboCount: 0, feedbackTier: "basic" };

    for (let index = 0; index < result.destroyedCount; index += 1) {
      const comboResult = this.comboSystem?.registerBrickBreak(100);
      if (comboResult) {
        comboPayload = {
          comboCount: comboResult.comboCount,
          feedbackTier: comboResult.feedbackTier,
        };
        scoreDelta += comboResult.totalScore - 100;

        if (comboResult.comboCount >= 3 && !this.firstComboTracked) {
          this.firstComboTracked = true;
          this.telemetrySystem?.track("first_combo", { stage: this.currentStage });
          this.emitTelemetry("first_combo");
        }
      }
    }

    this.score += scoreDelta;
    this.game.events.emit("score-changed", this.score);
    this.game.events.emit("combo-changed", comboPayload);
    this.emitImpactEvent(
      comboPayload.feedbackTier === "peak" ? "combo-peak" : "brick-hit",
      this.getBrickAccentColor(result.brickType),
    );

    if (!this.botMode && comboPayload.feedbackTier === "peak") {
      this.cameras.main.shake(90, 0.0036, true);
    }

    if (result.dropRequested) {
      const powerup = this.powerupSystem?.spawnDrop(brick.x, brick.y);
      const paddle = this.paddleSystem?.getView();
      if (powerup && paddle) {
        this.powerupSystem?.bindToPaddle(powerup, paddle, (collected) => {
          this.game.events.emit("powerup-collected", collected);
          const nextState = this.powerupEffectSystem?.apply(collected.type, paddle);
          if (nextState) {
            this.paddleSystem?.clampWithinBounds();
            if (collected.type === "multiball") {
              this.syncMultiballGameplay();
            }
            this.game.events.emit("powerup-state-changed", nextState);
          }
        });
      }
    }

    if ((this.brickSystem?.remainingCount() ?? 1) === 0) {
      this.offerStageClearReward();
    }
  }

  private readonly handleVisibilityChange = (): void => {
    if (typeof document !== "undefined" && document.hidden) {
      this.physics.pause();
      this.game.events.emit("interrupt-shown", true);
      this.telemetrySystem?.track("run_abandoned", { stage: this.currentStage });
      this.emitTelemetry("run_abandoned");
    }
  };

  private handleBallLost(ballSystem: BallSystem): void {
    if (this.runEnding) {
      return;
    }

    if (this.ballSystems.length > 1) {
      this.removeBallSystem(ballSystem);
      return;
    }

    this.comboSystem?.reset();
    this.game.events.emit("combo-changed", { comboCount: 0, feedbackTier: "basic" });
    this.telemetrySystem?.track("ball_lost", { stage: this.currentStage });
    this.emitTelemetry("ball_lost");

    if (this.lives > 1) {
      this.lives -= 1;
      this.game.events.emit("life-changed", this.lives);
      this.resetBallsToSingleAttached();
      this.game.events.emit("launch-prompt-visible", true);
      this.emitImpactEvent("ball-lost", "#ffd166");
      return;
    }

    this.runEnding = true;
    this.physics.pause();
    this.musicSystem?.duckForResult("failed");
    if (!this.botMode) {
      this.cameras.main.flash(180, 255, 110, 110, true);
    }
    this.emitImpactEvent("run-failed", "#ff8f8f", "RUN FAILED");
    this.playStageCue("failure", 1.08);
    this.time.delayedCall(90, () => {
      if (this.runEnding) {
        this.playStageCue("ball-lost", 0.78);
      }
    });
    this.time.delayedCall(170, () => {
      if (this.runEnding) {
        this.playStageCue("stage-shift", 0.56);
      }
    });
    this.time.delayedCall(180, () => {
      const meta = this.metaSystem?.completeRun();
      this.game.events.emit("meta-updated", meta);
      this.game.events.emit("result-shown", {
        title: "실패",
        cta: "다시 하기",
        mode: "failed",
        subtitle: "리듬은 좋았습니다. 다음 런에서 더 빠르게 피크를 만드세요.",
        stats: `STAGE ${this.currentStage} · SCORE ${this.score} · LIVES 0`,
        statCards: [
          { label: "도달 스테이지", value: `STAGE ${this.currentStage}` },
          { label: "최종 점수", value: `${this.score}` },
          { label: "남은 생명", value: "0" },
        ],
      });
    });
  }

  private offerStageClearReward(): void {
    this.pendingRewardReason = "stage_clear";
    this.physics.pause();
    this.game.events.emit("reward-offered", {
      reason: "stage_clear",
      choices: createRewardChoices(2),
    });
  }

  private offerStartingChoices(count: number): void {
    this.pendingRewardReason = "start_bonus";
    this.physics.pause();
    this.game.events.emit("reward-offered", {
      reason: "start_bonus",
      choices: createRewardChoices(count),
    });
  }

  private queueStartingChoices(count: number): void {
    this.pendingStartRewardTimer?.remove(false);
    this.pendingStartRewardTimer = this.time.delayedCall(0, () => {
      this.pendingStartRewardTimer = undefined;
      this.offerStartingChoices(count);
    });
  }

  private handleRewardSelected(choice: RewardChoice): void {
    this.audioCueSystem?.unlock();
    const paddle = this.paddleSystem?.getView();
    if (paddle) {
      const nextState = this.powerupEffectSystem?.apply(choice.type, paddle);
      if (nextState) {
        this.paddleSystem?.clampWithinBounds();
        this.game.events.emit("powerup-state-changed", nextState);
      }
    }

    this.telemetrySystem?.track("reward_selected", {
      stage: this.currentStage,
      type: choice.type,
      reason: this.pendingRewardReason,
    });
    this.emitTelemetry("reward_selected");
    this.emitImpactEvent("reward-selected", choice.accentColor, choice.headline);

    if (this.pendingRewardReason === "stage_clear") {
      if (this.currentStage < STAGE_COUNT) {
        this.currentStage += 1;
        this.cameras.main.setBackgroundColor(STAGE_BACKGROUND_COLORS[this.currentStage]);
        this.applyStagePresentation(this.currentStage);
        if (!this.botMode) {
          this.musicSystem?.playStageLoop(this.currentStage);
          this.musicSystem?.restoreStageVolume();
        }
        this.game.events.emit("stage-changed", this.currentStage);
        this.resetBallsToSingleAttached();
        this.spawnStageBricks();
        this.game.events.emit("launch-prompt-visible", true);
        this.physics.resume();
      } else {
        this.runEnding = true;
        this.musicSystem?.duckForResult("cleared");
        const meta = this.metaSystem?.completeRun();
        this.game.events.emit("meta-updated", meta);
        this.playStageCue("clear", 1.12);
        this.emitImpactEvent("run-cleared", "#ffe27a", "STAGE MASTERED");
        this.time.delayedCall(70, () => {
          if (this.runEnding) {
            this.playStageCue("combo-peak", 0.84);
          }
        });
        this.time.delayedCall(150, () => {
          if (this.runEnding) {
            this.playStageCue("reward-selected", 0.72);
          }
        });
        this.game.events.emit("result-shown", {
          title: "클리어",
          cta: "다시 하기",
          mode: "cleared",
          subtitle: "짧지만 강한 아케이드 런을 완주했습니다.",
          stats: `MAX STAGE ${this.currentStage} · SCORE ${this.score} · PERFECT FINISH`,
          statCards: [
            { label: "완주 스테이지", value: `STAGE ${this.currentStage}` },
            { label: "최종 점수", value: `${this.score}` },
            { label: "결과", value: "PERFECT" },
          ],
        });
      }
    } else {
      this.physics.resume();
    }

    this.pendingRewardReason = null;
  }

  private handleRetryRun(): void {
    this.telemetrySystem?.track("retry_clicked", { stage: this.currentStage });
    this.emitTelemetry("retry_clicked");
    this.runEnding = false;
    this.currentStage = 1;
    this.lives = 3;
    this.score = 0;
    this.firstComboTracked = false;
    this.comboSystem?.reset();
    this.pendingRewardReason = null;
    this.game.events.emit("score-changed", this.score);
    this.game.events.emit("combo-changed", { comboCount: 0, feedbackTier: "basic" });
    this.game.events.emit("stage-changed", this.currentStage);
    this.game.events.emit("life-changed", this.lives);
    this.cameras.main.setBackgroundColor(STAGE_BACKGROUND_COLORS[this.currentStage]);
    this.applyStagePresentation(this.currentStage);
    this.musicSystem?.playStageLoop(this.currentStage);
    this.musicSystem?.restoreStageVolume();
    this.powerupSystem?.clearAll();
    const paddle = this.paddleSystem?.getView();
    if (paddle) {
      const nextState = this.powerupEffectSystem?.reset(paddle);
      if (nextState) {
        this.paddleSystem?.clampWithinBounds();
        this.game.events.emit("powerup-state-changed", nextState);
      }
    }
    this.resetBallsToSingleAttached();
    this.spawnStageBricks();
    const meta = this.metaSystem?.getState();
    this.queueStartingChoices(meta?.startingChoiceCount ?? 2);
  }

  private handleResumeRun(): void {
    this.physics.resume();
    this.game.events.emit("interrupt-shown", false);
    this.telemetrySystem?.track("session_resume", { stage: this.currentStage });
    this.emitTelemetry("session_resume");
  }

  private handleRuntimeSettingsChanged(settings: RuntimeSettings): void {
    this.inputSystem?.setSensitivity(INPUT_SENSITIVITY_PRESETS[settings.sensitivity ?? DEFAULT_INPUT_SENSITIVITY]);
    this.audioCueSystem?.setEnabled(settings.sfxEnabled);
    this.musicSystem?.setEnabled(settings.bgmEnabled);
    if (settings.bgmEnabled) {
      if (!this.botMode) {
        this.musicSystem?.unlock();
        this.musicSystem?.playStageLoop(this.currentStage);
        this.musicSystem?.restoreStageVolume();
      }
    }
  }

  private emitTelemetry(name: string): void {
    this.game.events.emit("telemetry-updated", { name });
  }

  private emitImpactEvent(kind: string, accentColor?: string, title?: string): void {
    if (this.botMode) {
      return;
    }

    const cueMap: Record<string, Parameters<AudioCueSystem["play"]>[0]> = {
      "paddle-bounce": "paddle-bounce",
      "brick-hit": "brick-hit",
      "combo-peak": "combo-peak",
      "reward-selected": "reward-selected",
      "laser-burst": "laser-burst",
      "multiball-split": "multiball-split",
      "magnet-catch": "magnet-catch",
      "ball-lost": "ball-lost",
      "stage-identity-shift": "stage-shift",
    };
    const cue = cueMap[kind];
    if (cue) {
      this.playStageCue(cue, kind === "combo-peak" ? 1.08 : 1);
    }

    this.game.events.emit("impact-event", { kind, accentColor, title });
  }

  private renderBallTrails(): void {
    if (this.botMode) {
      return;
    }

    if (this.time.now - this.lastBallTrailAt < 48) {
      return;
    }

    this.lastBallTrailAt = this.time.now;
    const powerupState = this.powerupEffectSystem?.getState();
    const laserActive = (powerupState?.laserCharges ?? 0) > 0;
    const multiballActive = this.ballSystems.length > 1 || (powerupState?.multiballCount ?? 1) > 1;

    this.ballSystems.forEach((ballSystem) => {
      if (ballSystem.isAttached()) {
        return;
      }

      const ball = ballSystem.getView();
      const body = ball.body as Phaser.Physics.Arcade.Body;
      if (body.speed < 140) {
        return;
      }

      const style = getTrailStyle(
        laserActive ? "laser-ball" : multiballActive ? "multiball" : "primary-ball",
      );
      const ghost = this.add
        .image(ball.x, ball.y, ball.texture.key)
        .setDisplaySize(ball.displayWidth * style.scale, ball.displayHeight * style.scale)
        .setAlpha(style.alpha)
        .setTint(style.tint);

      this.tweens.add({
        targets: ghost,
        alpha: 0,
        scaleX: ghost.scaleX * 0.82,
        scaleY: ghost.scaleY * 0.82,
        duration: 220,
        ease: "Quad.easeOut",
        onComplete: () => {
          ghost.destroy();
        },
      });
    });
  }

  private renderPowerupTrails(): void {
    if (this.botMode) {
      return;
    }

    if (this.time.now - this.lastPowerupTrailAt < 92) {
      return;
    }

    this.lastPowerupTrailAt = this.time.now;
    const powerups = this.powerupSystem?.getActivePowerups() ?? [];
    powerups.forEach((powerup) => {
      const style = getTrailStyle(
        `powerup-${powerup.powerupType}` as
          | "powerup-expand"
          | "powerup-laser"
          | "powerup-multiball"
          | "powerup-magnet",
      );
      const ghost = this.add
        .image(powerup.x, powerup.y, powerup.texture.key)
        .setDisplaySize(powerup.displayWidth * style.scale, powerup.displayHeight * style.scale)
        .setAlpha(style.alpha)
        .setTint(style.tint);

      this.tweens.add({
        targets: ghost,
        alpha: 0,
        y: ghost.y + 18,
        scaleX: ghost.scaleX * 0.86,
        scaleY: ghost.scaleY * 0.86,
        duration: 260,
        ease: "Quad.easeOut",
        onComplete: () => {
          ghost.destroy();
        },
      });
    });
  }

  private renderStageBloomPulse(): void {
    if (this.botMode) {
      return;
    }

    if (this.time.now - this.lastBloomPulseAt < 240) {
      return;
    }

    this.lastBloomPulseAt = this.time.now;
    const profile = STAGE_PRESENTATION_PROFILES[this.currentStage];
    const accent = Phaser.Display.Color.HexStringToColor(profile.accentColor).color;

    const primaryBall = this.primaryBallSystem?.getView();
    if (primaryBall && !this.primaryBallSystem?.isAttached()) {
      const ring = this.add.circle(primaryBall.x, primaryBall.y, 24, accent, 0.12);
      this.tweens.add({
        targets: ring,
        alpha: 0,
        scaleX: 1.42,
        scaleY: 1.42,
        duration: 220,
        ease: "Quad.easeOut",
        onComplete: () => ring.destroy(),
      });
    }

    const paddle = this.paddleSystem?.getView();
    if (paddle) {
      const plate = this.add.rectangle(paddle.x, paddle.y, paddle.displayWidth + 22, paddle.displayHeight + 12, accent, 0.08);
      this.tweens.add({
        targets: plate,
        alpha: 0,
        scaleX: 1.08,
        scaleY: 1.16,
        duration: 240,
        ease: "Quad.easeOut",
        onComplete: () => plate.destroy(),
      });
    }

    const activeBricks = this.brickSystem?.getActiveBricks() ?? [];
    if (activeBricks.length > 0) {
      const brick = activeBricks[Math.floor(this.time.now / 240) % activeBricks.length];
      const pulse = this.add.rectangle(brick.x, brick.y, brick.displayWidth + 14, brick.displayHeight + 10, accent, 0.1);
      this.tweens.add({
        targets: pulse,
        alpha: 0,
        scaleX: 1.12,
        scaleY: 1.18,
        duration: 220,
        ease: "Quad.easeOut",
        onComplete: () => pulse.destroy(),
      });
    }
  }

  private playStageCue(cue: Parameters<AudioCueSystem["play"]>[0], volumeMultiplier = 1): void {
    const rateByStage: Record<number, number> = {
      1: 1,
      2: 0.98,
      3: 1.04,
      4: 1.08,
    };

    this.audioCueSystem?.play(cue, {
      rate: rateByStage[this.currentStage] ?? 1,
      volumeMultiplier,
    });
  }

  getDebugSnapshot(): {
    heartbeat: number;
    currentStage: number;
    lives: number;
    score: number;
    runEnding: boolean;
    physicsPaused: boolean;
    pendingRewardReason: "stage_clear" | "start_bonus" | null;
    activeBrickCount: number;
    ballCount: number;
    balls: Array<{
      x: number;
      y: number;
      velocityX: number;
      velocityY: number;
      attached: boolean;
    }>;
    paddle: {
      x: number;
      width: number;
    } | null;
    powerupState: ReturnType<PowerupEffectSystem["getState"]> | undefined;
  } {
    const paddle = this.paddleSystem?.getView();
    return {
      heartbeat: this.debugHeartbeat,
      currentStage: this.currentStage,
      lives: this.lives,
      score: this.score,
      runEnding: this.runEnding,
      physicsPaused: this.physics.world.isPaused,
      pendingRewardReason: this.pendingRewardReason,
      activeBrickCount: this.brickSystem?.remainingCount() ?? 0,
      ballCount: this.ballSystems.length,
      balls: this.ballSystems.map((ballSystem) => {
        const ball = ballSystem.getView();
        const body = ball.body as Phaser.Physics.Arcade.Body;
        return {
          x: ball.x,
          y: ball.y,
          velocityX: body.velocity.x,
          velocityY: body.velocity.y,
          attached: ballSystem.isAttached(),
        };
      }),
      paddle: paddle
        ? {
            x: paddle.x,
            width: paddle.displayWidth,
          }
        : null,
      powerupState: this.powerupEffectSystem?.getState(),
    };
  }

  debugBotStep(stepIndex: number): ReturnType<GameScene["getDebugSnapshot"]> {
    const snapshot = this.getDebugSnapshot();

    if (snapshot.runEnding) {
      this.debugRetryRun();
      return this.getDebugSnapshot();
    }

    if (snapshot.pendingRewardReason) {
      const rewardType = this.chooseBotRewardType(snapshot);
      this.debugChooseReward(rewardType);
      return this.getDebugSnapshot();
    }

    if (snapshot.balls.some((ball) => ball.attached)) {
      this.debugLaunchPrimaryBall();
      return this.getDebugSnapshot();
    }

    const targetBall = [...snapshot.balls]
      .filter((ball) => !ball.attached)
      .sort((left, right) => right.y - left.y)[0];

    if (targetBall) {
      this.debugMovePaddleTo(targetBall.x);
    }

    if ((snapshot.powerupState?.laserCharges ?? 0) > 0 && stepIndex % 12 === 0) {
      this.debugFireLaser();
    }

    return this.getDebugSnapshot();
  }

  debugLaunchPrimaryBall(): boolean {
    if (this.primaryBallSystem?.tryLaunch(this.time.now)) {
      this.playStageCue("launch");
      this.hideLaunchInstruction();
      this.syncMultiballGameplay();
      return true;
    }

    return false;
  }

  debugChooseReward(type: PowerupType): boolean {
    if (!this.pendingRewardReason) {
      return false;
    }

    const previewChoice = createRewardChoices(4).find((choice) => choice.type === type);
    this.handleRewardSelected({
      id: `debug-${type}`,
      label: previewChoice?.label ?? type,
      headline: previewChoice?.headline ?? type,
      subcopy: previewChoice?.subcopy ?? type,
      impactTag: previewChoice?.impactTag ?? type,
      icon: previewChoice?.icon ?? "•",
      textureKey: previewChoice?.textureKey ?? "",
      accentColor: previewChoice?.accentColor ?? "#6dd7ff",
      rarity: previewChoice?.rarity ?? "standard",
      type,
    });
    return true;
  }

  debugGrantPowerup(type: PowerupType): boolean {
    const paddle = this.paddleSystem?.getView();
    if (!paddle) {
      return false;
    }

    const nextState = this.powerupEffectSystem?.apply(type, paddle);
    if (!nextState) {
      return false;
    }

    this.paddleSystem?.clampWithinBounds();

    if (type === "multiball") {
      this.syncMultiballGameplay();
    }

    this.game.events.emit("powerup-state-changed", nextState);
    return true;
  }

  debugSetBallState(
    index: number,
    state: {
      x?: number;
      y?: number;
      velocityX?: number;
      velocityY?: number;
    },
  ): boolean {
    const ballSystem = this.ballSystems[index];
    if (!ballSystem) {
      return false;
    }

    const ball = ballSystem.getView();
    const body = ball.body as Phaser.Physics.Arcade.Body;
    if (typeof state.x === "number") {
      ball.x = state.x;
    }
    if (typeof state.y === "number") {
      ball.y = state.y;
    }
    body.updateFromGameObject();
    body.setVelocity(state.velocityX ?? body.velocity.x, state.velocityY ?? body.velocity.y);
    return true;
  }

  debugForceBallLoss(index = 0): boolean {
    const ballSystem = this.ballSystems[index];
    if (!ballSystem) {
      return false;
    }

    const body = ballSystem.getView().body as Phaser.Physics.Arcade.Body;
    return this.debugSetBallState(index, {
      y: PLAYFIELD_BOTTOM + BALL_RADIUS + 6,
      velocityY: Math.abs(body.velocity.y) || 700,
    });
  }

  debugRetryRun(): void {
    this.handleRetryRun();
  }

  debugFireLaser(): boolean {
    const fired = this.tryFireLaserBurst();
    if (fired) {
      this.game.events.emit("powerup-state-changed", this.powerupEffectSystem?.getState());
    }

    return fired;
  }

  debugMovePaddleTo(targetX: number): boolean {
    const paddle = this.paddleSystem?.getView();
    if (!paddle) {
      return false;
    }

    this.paddleSystem?.moveTo(targetX);
    this.ballSystems.forEach((ballSystem) => {
      if (ballSystem.isAttached()) {
        ballSystem.syncAttachedToPaddle(paddle);
      }
    });
    return true;
  }

  private chooseBotRewardType(
    snapshot: ReturnType<GameScene["getDebugSnapshot"]>,
  ): PowerupType {
    if ((snapshot.powerupState?.multiballCount ?? 1) < 2) {
      return "multiball";
    }
    if ((snapshot.powerupState?.laserCharges ?? 0) === 0) {
      return "laser";
    }
    if (snapshot.lives <= 1 && (snapshot.powerupState?.magnetCharges ?? 0) === 0) {
      return "magnet";
    }

    return "expand";
  }

  private isPointerInsidePlayfield(pointer: Phaser.Input.Pointer): boolean {
    return (
      pointer.x >= PLAYFIELD_LEFT &&
      pointer.x <= PLAYFIELD_LEFT + PLAYFIELD_WIDTH &&
      pointer.y >= PLAYFIELD_TOP &&
      pointer.y <= PLAYFIELD_BOTTOM
    );
  }

  private applyManualPaddleBounce(ballSystem: BallSystem): boolean {
    if (ballSystem.isAttached()) {
      return false;
    }

    const paddle = this.paddleSystem?.getView();
    if (!paddle) {
      return false;
    }

    const ball = ballSystem.getView();
    const ballBody = ball.body as Phaser.Physics.Arcade.Body;
    const paddleBody = paddle.body as Phaser.Physics.Arcade.StaticBody;

    if (
      !shouldForcePaddleBounce(
        ball.x,
        ballBody.top,
        ballBody.bottom,
        ballBody.velocity.y,
        paddle.x,
        paddleBody.top,
        paddleBody.bottom,
        paddle.displayWidth,
        BALL_HITBOX_RADIUS,
      )
    ) {
      return false;
    }

    this.handlePaddleBounce(ballSystem);
    return true;
  }

  private createBallSystem(x: number, y: number): BallSystem {
    const ball = new Ball(this, x, y);
    this.add.existing(ball);

    const ballSystem = new BallSystem(ball);
    this.ballSystems.push(ballSystem);

    const paddle = this.paddleSystem?.getView();
    if (paddle) {
      this.physics.add.collider(
        ball,
        paddle,
        () => {
          this.handlePaddleBounce(ballSystem);
        },
        (gameObject1, gameObject2) => {
          const ballView = gameObject1 as Ball;
          const paddleView = gameObject2 as Paddle;
          const ballBody = ballView.body as Phaser.Physics.Arcade.Body;
          const paddleBody = paddleView.body as Phaser.Physics.Arcade.StaticBody;

          return shouldProcessPaddleBounce(
            ballView.y,
            ballBody.bottom,
            ballBody.velocity.y,
            paddleView.y,
            paddleBody.top,
          );
        },
        this,
      );
    }

    this.brickSystem?.getActiveBricks().forEach((brick) => {
      this.physics.add.collider(ball, brick, () => {
        this.handleBrickHit(brick);
      });
    });

    return ballSystem;
  }

  private resetBallsToSingleAttached(): void {
    this.ballSystems.forEach((ballSystem) => {
      ballSystem.getView().destroy();
    });
    this.ballSystems.length = 0;

    const primaryBallSystem = this.createBallSystem(GAME_WIDTH / 2, 1460);
    this.primaryBallSystem = primaryBallSystem;

    const paddle = this.paddleSystem?.getView();
    if (paddle) {
      primaryBallSystem.attachToPaddle(paddle);
    }
  }

  private removeBallSystem(ballSystem: BallSystem): void {
    const index = this.ballSystems.indexOf(ballSystem);
    if (index >= 0) {
      this.ballSystems.splice(index, 1);
    }

    ballSystem.getView().destroy();

    if (this.primaryBallSystem === ballSystem) {
      this.primaryBallSystem = this.ballSystems[0];
    }
  }

  private tryFireLaserBurst(): boolean {
    if (this.primaryBallSystem?.isAttached()) {
      return false;
    }

    const paddle = this.paddleSystem?.getView();
    const bricks = this.brickSystem?.getActiveBricks() ?? [];
    if (!paddle || bricks.length === 0) {
      return false;
    }

    const laneTargets = [paddle.x - paddle.displayWidth * 0.2, paddle.x + paddle.displayWidth * 0.2].map(
      (targetX) =>
        [...bricks]
          .sort((left, right) => left.y - right.y || Math.abs(left.x - targetX) - Math.abs(right.x - targetX))
          .find((brick) => brick.active),
    );

    const uniqueTargets = laneTargets.filter(
      (brick, index, array): brick is Brick => Boolean(brick) && array.indexOf(brick) === index,
    );

    if (uniqueTargets.length === 0) {
      return false;
    }

    if (!this.powerupEffectSystem?.consumeLaserCharge()) {
      return false;
    }

    uniqueTargets.forEach((brick) => {
      if (!this.botMode) {
        const beam = this.add.rectangle(brick.x, (paddle.y + brick.y) / 2, 10, paddle.y - brick.y, 0xff6474, 0.5);
        this.tweens.add({
          targets: beam,
          alpha: 0,
          duration: 90,
          onComplete: () => {
            beam.destroy();
          },
        });
      }
      this.handleBrickHit(brick);
    });

    if (!this.botMode) {
      this.cameras.main.flash(90, 255, 110, 125, true);
    }
    this.emitImpactEvent("laser-burst", "#ff6b7d");

    return true;
  }

  private syncMultiballGameplay(): void {
    const targetCount = this.powerupEffectSystem?.getState().multiballCount ?? 1;
    const sourceSystem = this.primaryBallSystem ?? this.ballSystems[0];
    if (!sourceSystem || sourceSystem.isAttached() || targetCount <= this.ballSystems.length) {
      return;
    }

    const sourceBall = sourceSystem.getView();
    const sourceBody = sourceBall.body as Phaser.Physics.Arcade.Body;
    const speed = Math.max(sourceBody.velocity.length(), 560);
    const baseAngle = Phaser.Math.Angle.Between(0, 0, sourceBody.velocity.x, sourceBody.velocity.y);
    const angleOffsets = [-0.32, 0.32, -0.54, 0.54];
    const spawnOffsets = [-28, 28, -52, 52];

    for (let index = this.ballSystems.length; index < targetCount; index += 1) {
      const ballSystem = this.createBallSystem(sourceBall.x + (spawnOffsets[index - 1] ?? 0), sourceBall.y);
      const angle = baseAngle + (angleOffsets[index - 1] ?? 0);
      ballSystem.launchWithVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed, this.time.now);
    }

    this.emitImpactEvent("multiball-split", "#6dd7ff");
  }

  private animateStageIntro(bricks: Brick[]): void {
    const profile = STAGE_PRESENTATION_PROFILES[this.currentStage];
    const accent = Phaser.Display.Color.HexStringToColor(profile.accentColor).color;

    bricks.forEach((brick, index) => {
      const rowDelay = brick.getGridPosition().row * 36;
      const columnDelay = brick.getGridPosition().column * 18;
      const delay = rowDelay + columnDelay + index * 4;
      const startY = brick.y - 26;

      brick.setAlpha(0);
      brick.setScale(0.92);
      brick.setY(startY);

      const streak = this.add.rectangle(brick.x, startY - 12, brick.displayWidth * 0.72, 10, accent, 0.12);
      this.tweens.add({
        targets: [brick, streak],
        delay,
        alpha: { from: 0, to: 1 },
        y: brick.y,
        scaleX: 1,
        scaleY: 1,
        duration: 180,
        ease: "Cubic.easeOut",
        onComplete: () => {
          this.tweens.add({
            targets: streak,
            alpha: 0,
            scaleX: 1.18,
            duration: 120,
            onComplete: () => {
              streak.destroy();
            },
          });
        },
      });
    });
  }

  private applyStagePresentation(stage: number): void {
    const paddle = this.paddleSystem?.getView();
    const profile = STAGE_PRESENTATION_PROFILES[stage];
    if (!profile) {
      return;
    }

    this.registry.set("stageAccentColor", Phaser.Display.Color.HexStringToColor(profile.accentColor).color);
    this.renderStageBackdrop(stage);
    if (!paddle) {
      return;
    }

    const strokeColor =
      stage === 1 ? 0xbef7d2 : stage === 2 ? 0xc9e5ff : stage === 3 ? 0xffd2a6 : 0xffb4da;
    const fillColor =
      stage === 1 ? 0x43d17a : stage === 2 ? 0x57a8ff : stage === 3 ? 0xff8d57 : 0xd96baf;

    paddle.applyStageAccent(fillColor, strokeColor);
    this.emitImpactEvent("stage-identity-shift", profile.accentColor, profile.stageLabel);
  }

  private renderStageBackdrop(stage: number): void {
    this.stageBackdrop?.destroy(true);

    const profile = STAGE_PRESENTATION_PROFILES[stage];
    const accentColor = Phaser.Display.Color.HexStringToColor(profile.accentColor).color;
    const container = this.add.container(0, 0);
    const frame = this.add
      .image(
        PLAYFIELD_LEFT + PLAYFIELD_WIDTH / 2,
        PLAYFIELD_TOP + PLAYFIELD_HEIGHT / 2,
        STAGE_FRAME_TEXTURE_KEYS[stage],
      )
      .setDisplaySize(PLAYFIELD_WIDTH, PLAYFIELD_HEIGHT)
      .setAlpha(0.42);
    const halo = this.add.ellipse(GAME_WIDTH / 2, 960, 860, 1320, accentColor, 0.06);
    const topBand = this.add.rectangle(GAME_WIDTH / 2, 248, 820, 96, accentColor, 0.08);
    const bottomBand = this.add.rectangle(GAME_WIDTH / 2, 1650, 760, 120, accentColor, 0.05);
    const leftRail = this.add.rectangle(88, 960, 6, 1420, accentColor, 0.08);
    const rightRail = this.add.rectangle(GAME_WIDTH - 88, 960, 6, 1420, accentColor, 0.08);
    const stageChip = this.add
      .text(GAME_WIDTH / 2, 210, profile.stageLabel, {
        color: profile.accentColor,
        fontFamily: "Verdana",
        fontSize: "22px",
        fontStyle: "bold",
        letterSpacing: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0.32);

    container.add([halo, frame, topBand, bottomBand, leftRail, rightRail, stageChip]);
    container.setDepth(-10);
    this.stageBackdrop = container;

    if (!this.botMode) {
      this.tweens.add({
        targets: [halo, topBand, bottomBand],
        alpha: { from: 0.2, to: 0.38 },
        duration: 1600,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  private getBrickAccentColor(type: BrickType): string {
    if (type === "hard") {
      return "#ffd27d";
    }
    if (type === "explosive") {
      return "#ff9f5d";
    }
    if (type === "item") {
      return "#74d7ff";
    }

    return STAGE_PRESENTATION_PROFILES[this.currentStage].accentColor;
  }
}
