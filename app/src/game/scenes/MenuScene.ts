import Phaser from "phaser";

import { TEXTURE_KEYS } from "../config/assetKeys";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig";
import {
  INPUT_SENSITIVITY_PRESETS,
  type InputSensitivityPreset,
} from "../config/inputConfig";
import { STAGE_PRESENTATION_PROFILES } from "../config/presentationConfig";
import {
  loadRuntimeSettings,
  saveRuntimeSettings,
  type RuntimeSettings,
} from "../config/settings";
import { SceneKeys } from "../core/SceneKeys";

export class MenuScene extends Phaser.Scene {
  private attractBall?: Phaser.GameObjects.Image;
  private attractPaddle?: Phaser.GameObjects.Image;
  private attractBallGlow?: Phaser.GameObjects.Arc;
  private attractAttached = true;
  private attractLoopTimer?: Phaser.Time.TimerEvent;
  private readonly attractBounds = { left: GAME_WIDTH / 2 - 320, right: GAME_WIDTH / 2 + 320 };
  private runtimeSettings: RuntimeSettings = loadRuntimeSettings();

  constructor() {
    super(SceneKeys.Menu);
  }

  create(): void {
    const stageProfile = STAGE_PRESENTATION_PROFILES[4];

    this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, TEXTURE_KEYS.menuBackdrop)
      .setDisplaySize(860, 1260)
      .setAlpha(0.98);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 860, 1260, 0x10233e, 0.18);
    this.add.ellipse(GAME_WIDTH / 2, 430, 520, 220, 0x6dd7ff, 0.08);
    this.add.rectangle(GAME_WIDTH / 2, 960, 760, 420, 0x0d1830, 0.42).setStrokeStyle(2, 0x6dd7ff, 0.18);
    this.add.rectangle(GAME_WIDTH / 2, 960, 720, 380, 0x0a1325, 0.34);

    const attractBricks = [
      { x: GAME_WIDTH / 2 - 180, y: 826, tint: 0x8fdcff },
      { x: GAME_WIDTH / 2 - 10, y: 826, tint: 0xffb366 },
      { x: GAME_WIDTH / 2 + 160, y: 826, tint: 0xff7db4 },
      { x: GAME_WIDTH / 2 - 95, y: 890, tint: 0xd0eaff },
      { x: GAME_WIDTH / 2 + 75, y: 890, tint: 0xb68cff },
    ];

    attractBricks.forEach((brick, index) => {
      const node = this.add
        .image(brick.x, brick.y, TEXTURE_KEYS.paddle)
        .setDisplaySize(132, 34)
        .setTint(brick.tint)
        .setAlpha(0.92);
      this.tweens.add({
        targets: node,
        alpha: { from: 0.72, to: 1 },
        scaleX: { from: 0.98, to: 1.03 },
        scaleY: { from: 0.98, to: 1.03 },
        duration: 880 + index * 70,
        yoyo: true,
        repeat: -1,
        delay: index * 90,
      });
    });

    const attractTrail = this.add.rectangle(GAME_WIDTH / 2 + 70, 994, 240, 6, 0xffffff, 0.08).setAngle(-38);
    this.tweens.add({
      targets: attractTrail,
      alpha: { from: 0.02, to: 0.18 },
      scaleX: { from: 0.8, to: 1.1 },
      duration: 760,
      yoyo: true,
      repeat: -1,
    });

    this.attractBall = this.add
      .image(GAME_WIDTH / 2 + 88, 968, TEXTURE_KEYS.ball)
      .setDisplaySize(40, 40)
      .setTint(0xffffff);
    this.attractPaddle = this.add
      .image(GAME_WIDTH / 2 - 60, 1118, TEXTURE_KEYS.paddle)
      .setDisplaySize(240, 36)
      .setTint(0x43d17a);
    this.attractBallGlow = this.add.circle(this.attractBall.x, this.attractBall.y, 30, stageProfile.accentNumber, 0.12);

    this.tweens.add({
      targets: [this.attractBall, this.attractBallGlow],
      x: GAME_WIDTH / 2 - 116,
      y: 1088,
      duration: 1180,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });
    this.tweens.add({
      targets: this.attractBallGlow,
      alpha: { from: 0.06, to: 0.2 },
      scaleX: { from: 0.8, to: 1.22 },
      scaleY: { from: 0.8, to: 1.22 },
      duration: 980,
      yoyo: true,
      repeat: -1,
    });
    this.tweens.add({
      targets: this.attractPaddle,
      x: GAME_WIDTH / 2 + 74,
      duration: 1360,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });

    ["MULTIBALL", "LASER", "CHAIN", "MAGNET"].forEach((label, index) => {
      const pill = this.add
        .text(GAME_WIDTH / 2 - 240 + index * 160, 1214, label, {
          color: index % 2 === 0 ? "#8fdcff" : "#ffd166",
          fontFamily: "Verdana",
          fontSize: "18px",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setAlpha(0.82);
      this.tweens.add({
        targets: pill,
        alpha: { from: 0.36, to: 0.92 },
        y: pill.y - 8,
        duration: 920 + index * 80,
        yoyo: true,
        repeat: -1,
        delay: index * 70,
      });
    });

    this.add
      .text(GAME_WIDTH / 2, 320, "BREAKOUT\nREBORN", {
        align: "center",
        color: "#f4f7fb",
        fontFamily: "Verdana",
        fontSize: "104px",
        fontStyle: "bold",
        lineSpacing: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 208, "COMMERCIAL ARCADE PREVIEW", {
        align: "center",
        color: "#8edcff",
        fontFamily: "Verdana",
        fontSize: "22px",
        fontStyle: "bold",
        letterSpacing: 3,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 640, "One-hand vertical breaker with fast replay energy", {
        align: "center",
        color: "#93b9e7",
        fontFamily: "Verdana",
        fontSize: "34px",
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        728,
        "Multiball, laser, chain bricks, and instant retries.\nBuilt to feel like a compact commercial arcade run.",
        {
          align: "center",
          color: "#d6e5f5",
          fontFamily: "Verdana",
          fontSize: "24px",
          lineSpacing: 8,
        },
      )
      .setOrigin(0.5);

    const microHint = this.add
      .text(GAME_WIDTH / 2, 1282, "PREVIEW AREA: DRAG THE PADDLE, TAP TO SPLIT THE BALL", {
        align: "center",
        color: "#8fdcff",
        fontFamily: "Verdana",
        fontSize: "18px",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAlpha(0.82);
    this.tweens.add({
      targets: microHint,
      alpha: { from: 0.4, to: 0.9 },
      duration: 980,
      yoyo: true,
      repeat: -1,
    });

    const optionsPanel = this.add.rectangle(GAME_WIDTH / 2, 1460, 720, 164, 0x0d1830, 0.56).setStrokeStyle(
      2,
      0x8fdcff,
      0.16,
    );
    this.add
      .text(GAME_WIDTH / 2, 1404, "OPTIONS", {
        color: "#f4f7fb",
        fontFamily: "Verdana",
        fontSize: "22px",
        fontStyle: "bold",
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    const sensitivityButton = this.createOptionButton(
      GAME_WIDTH / 2 - 220,
      1482,
      () => `SENS ${this.runtimeSettings.sensitivity.toUpperCase()}`,
      () => {
        const presets = Object.keys(INPUT_SENSITIVITY_PRESETS) as InputSensitivityPreset[];
        const currentIndex = presets.indexOf(this.runtimeSettings.sensitivity);
        this.runtimeSettings.sensitivity = presets[(currentIndex + 1) % presets.length];
        this.persistSettings();
      },
    );
    const sfxButton = this.createOptionButton(
      GAME_WIDTH / 2,
      1482,
      () => `SFX ${this.runtimeSettings.sfxEnabled ? "ON" : "OFF"}`,
      () => {
        this.runtimeSettings.sfxEnabled = !this.runtimeSettings.sfxEnabled;
        this.persistSettings();
      },
    );
    const bgmButton = this.createOptionButton(
      GAME_WIDTH / 2 + 220,
      1482,
      () => `BGM ${this.runtimeSettings.bgmEnabled ? "ON" : "OFF"}`,
      () => {
        this.runtimeSettings.bgmEnabled = !this.runtimeSettings.bgmEnabled;
        this.persistSettings();
      },
    );
    optionsPanel.setDataEnabled();
    optionsPanel.data?.set("buttons", [sensitivityButton, sfxButton, bgmButton]);

    const startButton = this.add
      .rectangle(GAME_WIDTH / 2, 1080, 520, 150, 0x43d17a, 1)
      .setInteractive({ useHandCursor: true });
    const startGlow = this.add.rectangle(GAME_WIDTH / 2, 1080, 548, 170, 0x43d17a, 0.18);
    this.tweens.add({
      targets: startGlow,
      alpha: { from: 0.08, to: 0.28 },
      scaleX: { from: 0.96, to: 1.02 },
      scaleY: { from: 0.96, to: 1.02 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
    });

    this.add
      .text(startButton.x, startButton.y, "START", {
        color: "#0b1320",
        fontFamily: "Verdana",
        fontSize: "58px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 1340, "No menus to dig through. Drop straight into play.", {
        align: "center",
        color: "#d5e2f5",
        fontFamily: "Verdana",
        fontSize: "28px",
      })
      .setOrigin(0.5);

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!this.attractPaddle || !this.attractBall || pointer.y < 820 || pointer.y > 1260) {
        return;
      }

      const nextX = Phaser.Math.Clamp(pointer.x, this.attractBounds.left, this.attractBounds.right);
      this.attractPaddle.x = nextX;
      if (this.attractAttached) {
        this.attractBall.x = nextX + 72;
        this.attractBall.y = 1076;
        if (this.attractBallGlow) {
          this.attractBallGlow.x = this.attractBall.x;
          this.attractBallGlow.y = this.attractBall.y;
        }
      }
    });

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.y >= 820 && pointer.y <= 1260) {
        if (pointer.y > 1000 && this.attractPaddle) {
          this.tweens.killTweensOf(this.attractPaddle);
          this.tweens.add({
            targets: this.attractPaddle,
            scaleX: 1.08,
            scaleY: 1.12,
            duration: 90,
            yoyo: true,
          });
        }
        this.triggerAttractLaunch(stageProfile.accentNumber);
      }
    });

    startButton.on("pointerdown", () => {
      this.registry.set("runState", "launch_ready");
      if (!this.scene.isActive(SceneKeys.UI)) {
        this.scene.launch(SceneKeys.UI);
      }
      this.scene.start(SceneKeys.Game);
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.attractLoopTimer?.remove(false);
      this.input.removeAllListeners("pointermove");
      this.input.removeAllListeners("pointerdown");
    });
  }

  private triggerAttractLaunch(accentColor: number): void {
    if (!this.attractBall || !this.attractBallGlow || !this.attractPaddle || !this.attractAttached) {
      return;
    }

    this.attractAttached = false;
    const startX = this.attractBall.x;
    const startY = this.attractBall.y;

    const splitGhostLeft = this.add
      .image(startX - 14, startY, TEXTURE_KEYS.ball)
      .setDisplaySize(26, 26)
      .setTint(0x8fdcff)
      .setAlpha(0.86);
    const splitGhostRight = this.add
      .image(startX + 14, startY, TEXTURE_KEYS.ball)
      .setDisplaySize(26, 26)
      .setTint(0xffd166)
      .setAlpha(0.86);
    const burst = this.add.circle(startX, startY, 18, accentColor, 0.24);

    this.tweens.add({
      targets: this.attractBall,
      x: startX + 142,
      y: startY - 188,
      duration: 420,
      ease: "Sine.easeOut",
    });
    this.tweens.add({
      targets: this.attractBallGlow,
      x: startX + 142,
      y: startY - 188,
      alpha: 0,
      scaleX: 1.6,
      scaleY: 1.6,
      duration: 420,
      ease: "Quad.easeOut",
    });
    this.tweens.add({
      targets: splitGhostLeft,
      x: startX - 126,
      y: startY - 170,
      alpha: 0,
      duration: 400,
      ease: "Sine.easeOut",
      onComplete: () => splitGhostLeft.destroy(),
    });
    this.tweens.add({
      targets: splitGhostRight,
      x: startX + 182,
      y: startY - 156,
      alpha: 0,
      duration: 400,
      ease: "Sine.easeOut",
      onComplete: () => splitGhostRight.destroy(),
    });
    this.tweens.add({
      targets: burst,
      alpha: 0,
      scaleX: 2.2,
      scaleY: 2.2,
      duration: 260,
      onComplete: () => burst.destroy(),
    });

    this.attractLoopTimer?.remove(false);
    this.attractLoopTimer = this.time.delayedCall(620, () => {
      if (!this.attractBall || !this.attractBallGlow || !this.attractPaddle) {
        return;
      }

      this.attractAttached = true;
      this.attractBall.x = this.attractPaddle.x + 72;
      this.attractBall.y = 1076;
      this.attractBallGlow.x = this.attractBall.x;
      this.attractBallGlow.y = this.attractBall.y;
      this.attractBallGlow.setAlpha(0.12);
      this.attractBallGlow.setScale(1);
    });
  }

  private createOptionButton(
    x: number,
    y: number,
    labelFactory: () => string,
    onPress: () => void,
  ): Phaser.GameObjects.Container {
    const bg = this.add.rectangle(0, 0, 180, 56, 0x12233d, 0.96).setStrokeStyle(2, 0x8fdcff, 0.22);
    const label = this.add
      .text(0, 0, labelFactory(), {
        color: "#dff3ff",
        fontFamily: "Verdana",
        fontSize: "20px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const container = this.add.container(x, y, [bg, label]);
    const hit = this.add
      .rectangle(x, y, 180, 56, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true });

    hit.on("pointerdown", () => {
      onPress();
      label.setText(labelFactory());
      this.tweens.add({
        targets: container,
        scaleX: 1.04,
        scaleY: 1.04,
        duration: 90,
        yoyo: true,
      });
    });
    hit.on("pointerover", () => {
      bg.setStrokeStyle(2, 0x8fdcff, 0.42);
    });
    hit.on("pointerout", () => {
      bg.setStrokeStyle(2, 0x8fdcff, 0.22);
    });

    return container;
  }

  private persistSettings(): void {
    saveRuntimeSettings(this.runtimeSettings);
    this.registry.set("runtimeSettings", this.runtimeSettings);
  }
}
