import Phaser from "phaser";

import { TEXTURE_KEYS } from "../config/assetKeys.ts";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig.ts";
import {
  INPUT_SENSITIVITY_PRESETS,
  type InputSensitivityPreset,
} from "../config/inputConfig.ts";
import { STAGE_PRESENTATION_PROFILES } from "../config/presentationConfig.ts";
import {
  loadRuntimeSettings,
  saveRuntimeSettings,
  type RuntimeSettings,
} from "../config/settings.ts";
import { SceneKeys } from "../core/SceneKeys.ts";

export class MenuScene extends Phaser.Scene {
  private attractBall?: Phaser.GameObjects.Image;
  private attractPaddle?: Phaser.GameObjects.Image;
  private attractBallGlow?: Phaser.GameObjects.Arc;
  private attractAttached = true;
  private attractLoopTimer?: Phaser.Time.TimerEvent;
  private readonly attractBounds = { left: GAME_WIDTH / 2 - 320, right: GAME_WIDTH / 2 + 320 };
  private runtimeSettings: RuntimeSettings = loadRuntimeSettings();
  private layoutSnapshot = {
    isMobile: false,
    gameHeight: 0,
    backdropCenterY: 0,
    contentTop: 0,
    backdropBottom: 0,
    optionsBottom: 0,
    contentBottom: 0,
  };

  constructor() {
    super(SceneKeys.Menu);
  }

  create(): void {
    const stageProfile = STAGE_PRESENTATION_PROFILES[4];
    const isMobile = this.scale.parentSize.width <= 480;
    type MenuLayout = {
      backdropWidth: number;
      backdropHeight: number;
      backdropCenterY: number;
      heroOuterY: number;
      heroOuterWidth: number;
      heroOuterHeight: number;
      heroInnerWidth: number;
      heroInnerHeight: number;
      bricksY1: number;
      bricksY2: number;
      trailY: number;
      attractBallX: number;
      attractBallY: number;
      attractPaddleX: number;
      attractPaddleY: number;
      attractLaunchTargetX: number;
      attractLaunchTargetY: number;
      titleY: number;
      eyebrowY: number;
      titleFontSize: string;
      eyebrowFontSize: string;
      eyebrowSpacing: number;
      subtitleY: number;
      subtitleFontSize: string;
      bodyY: number;
      bodyFontSize: string;
      bodyLineSpacing: number;
      startButtonY: number;
      startButtonWidth: number;
      startButtonHeight: number;
      startButtonFontSize: string;
      labelsY: number;
      labelsFontSize: string;
      microHintY: number;
      microHintFontSize: string;
      bodyFooterY: number;
      bodyFooterFontSize: string;
      optionsTitleY: number;
      optionsTitleFontSize: string;
      optionsPanelY: number;
      optionsPanelWidth: number;
      optionsPanelHeight: number;
      optionsButtonsY: number;
      pointerZoneMinY: number;
      pointerZoneMaxY: number;
    };

    const layout: MenuLayout = isMobile
      ? {
          backdropWidth: 980,
          backdropHeight: 1640,
          backdropCenterY: GAME_HEIGHT / 2,
          heroOuterY: 1178,
          heroOuterWidth: 860,
          heroOuterHeight: 560,
          heroInnerWidth: 820,
          heroInnerHeight: 520,
          bricksY1: 1022,
          bricksY2: 1098,
          trailY: 1258,
          attractBallX: GAME_WIDTH / 2 + 88,
          attractBallY: 1234,
          attractPaddleX: GAME_WIDTH / 2 - 60,
          attractPaddleY: 1406,
          attractLaunchTargetX: GAME_WIDTH / 2 - 116,
          attractLaunchTargetY: 1336,
          titleY: 478,
          eyebrowY: 318,
          titleFontSize: "88px",
          eyebrowFontSize: "18px",
          eyebrowSpacing: 2,
          subtitleY: 816,
          subtitleFontSize: "28px",
          bodyY: 896,
          bodyFontSize: "20px",
          bodyLineSpacing: 6,
          startButtonY: 1434,
          startButtonWidth: 540,
          startButtonHeight: 140,
          startButtonFontSize: "54px",
          labelsY: 1560,
          labelsFontSize: "16px",
          microHintY: 1668,
          microHintFontSize: "16px",
          bodyFooterY: 1756,
          bodyFooterFontSize: "26px",
          optionsTitleY: 1824,
          optionsTitleFontSize: "20px",
          optionsPanelY: 1890,
          optionsPanelWidth: 860,
          optionsPanelHeight: 184,
          optionsButtonsY: 1930,
          pointerZoneMinY: 994,
          pointerZoneMaxY: 1584,
        }
      : {
          backdropWidth: 860,
          backdropHeight: 1260,
          backdropCenterY: GAME_HEIGHT / 2,
          heroOuterY: 960,
          heroOuterWidth: 760,
          heroOuterHeight: 420,
          heroInnerWidth: 720,
          heroInnerHeight: 380,
          bricksY1: 826,
          bricksY2: 890,
          trailY: 994,
          attractBallX: GAME_WIDTH / 2 + 88,
          attractBallY: 968,
          attractPaddleX: GAME_WIDTH / 2 - 60,
          attractPaddleY: 1118,
          attractLaunchTargetX: GAME_WIDTH / 2 - 116,
          attractLaunchTargetY: 1088,
          titleY: 320,
          eyebrowY: 208,
          titleFontSize: "104px",
          eyebrowFontSize: "22px",
          eyebrowSpacing: 3,
          subtitleY: 640,
          subtitleFontSize: "34px",
          bodyY: 728,
          bodyFontSize: "24px",
          bodyLineSpacing: 8,
          startButtonY: 1080,
          startButtonWidth: 520,
          startButtonHeight: 150,
          startButtonFontSize: "58px",
          labelsY: 1214,
          labelsFontSize: "18px",
          microHintY: 1282,
          microHintFontSize: "18px",
          bodyFooterY: 1340,
          bodyFooterFontSize: "28px",
          optionsTitleY: 1404,
          optionsTitleFontSize: "22px",
          optionsPanelY: 1460,
          optionsPanelWidth: 720,
          optionsPanelHeight: 164,
          optionsButtonsY: 1482,
          pointerZoneMinY: 820,
          pointerZoneMaxY: 1260,
        };

    if (isMobile) {
      const mobileContentTop = layout.eyebrowY;
      const mobileContentBottom = layout.optionsPanelY + layout.optionsPanelHeight / 2;
      const mobileContentCenter = (mobileContentTop + mobileContentBottom) / 2;
      const mobileCenterShift = layout.backdropCenterY - mobileContentCenter;

      layout.heroOuterY += mobileCenterShift;
      layout.bricksY1 += mobileCenterShift;
      layout.bricksY2 += mobileCenterShift;
      layout.trailY += mobileCenterShift;
      layout.attractBallY += mobileCenterShift;
      layout.attractPaddleY += mobileCenterShift;
      layout.attractLaunchTargetY += mobileCenterShift;
      layout.titleY += mobileCenterShift;
      layout.eyebrowY += mobileCenterShift;
      layout.subtitleY += mobileCenterShift;
      layout.bodyY += mobileCenterShift;
      layout.startButtonY += mobileCenterShift;
      layout.labelsY += mobileCenterShift;
      layout.microHintY += mobileCenterShift;
      layout.bodyFooterY += mobileCenterShift;
      layout.optionsTitleY += mobileCenterShift;
      layout.optionsPanelY += mobileCenterShift;
      layout.optionsButtonsY += mobileCenterShift;
      layout.pointerZoneMinY += mobileCenterShift;
      layout.pointerZoneMaxY += mobileCenterShift;
    }

    this.add
      .image(GAME_WIDTH / 2, layout.backdropCenterY, TEXTURE_KEYS.menuBackdrop)
      .setDisplaySize(layout.backdropWidth, layout.backdropHeight)
      .setAlpha(0.98);
    this.add.rectangle(GAME_WIDTH / 2, layout.backdropCenterY, layout.backdropWidth, layout.backdropHeight, 0x10233e, 0.18);
    this.add.ellipse(GAME_WIDTH / 2, 430, 520, 220, 0x6dd7ff, 0.08);
    this.add.rectangle(GAME_WIDTH / 2, layout.heroOuterY, layout.heroOuterWidth, layout.heroOuterHeight, 0x0d1830, 0.42).setStrokeStyle(2, 0x6dd7ff, 0.18);
    this.add.rectangle(GAME_WIDTH / 2, layout.heroOuterY, layout.heroInnerWidth, layout.heroInnerHeight, 0x0a1325, 0.34);

    const attractBricks = [
      { x: GAME_WIDTH / 2 - 180, y: layout.bricksY1, tint: 0x8fdcff },
      { x: GAME_WIDTH / 2 - 10, y: layout.bricksY1, tint: 0xffb366 },
      { x: GAME_WIDTH / 2 + 160, y: layout.bricksY1, tint: 0xff7db4 },
      { x: GAME_WIDTH / 2 - 95, y: layout.bricksY2, tint: 0xd0eaff },
      { x: GAME_WIDTH / 2 + 75, y: layout.bricksY2, tint: 0xb68cff },
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

    const attractTrail = this.add.rectangle(GAME_WIDTH / 2 + 70, layout.trailY, 240, 6, 0xffffff, 0.08).setAngle(-38);
    this.tweens.add({
      targets: attractTrail,
      alpha: { from: 0.02, to: 0.18 },
      scaleX: { from: 0.8, to: 1.1 },
      duration: 760,
      yoyo: true,
      repeat: -1,
    });

    this.attractBall = this.add
      .image(layout.attractBallX, layout.attractBallY, TEXTURE_KEYS.ball)
      .setDisplaySize(40, 40)
      .setTint(0xffffff);
    this.attractPaddle = this.add
      .image(layout.attractPaddleX, layout.attractPaddleY, TEXTURE_KEYS.paddle)
      .setDisplaySize(240, 36)
      .setTint(0x43d17a);
    this.attractBallGlow = this.add.circle(this.attractBall.x, this.attractBall.y, 30, stageProfile.accentNumber, 0.12);

    this.tweens.add({
      targets: [this.attractBall, this.attractBallGlow],
      x: layout.attractLaunchTargetX,
      y: layout.attractLaunchTargetY,
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
        .text(GAME_WIDTH / 2 - 240 + index * 160, layout.labelsY, label, {
          color: index % 2 === 0 ? "#8fdcff" : "#ffd166",
          fontFamily: "Verdana",
          fontSize: layout.labelsFontSize,
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
      .text(GAME_WIDTH / 2, layout.titleY, "BREAKOUT\nREBORN", {
        align: "center",
        color: "#f4f7fb",
        fontFamily: "Verdana",
        fontSize: layout.titleFontSize,
        fontStyle: "bold",
        lineSpacing: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, layout.eyebrowY, "COMMERCIAL ARCADE PREVIEW", {
        align: "center",
        color: "#8edcff",
        fontFamily: "Verdana",
        fontSize: layout.eyebrowFontSize,
        fontStyle: "bold",
        letterSpacing: layout.eyebrowSpacing,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, layout.subtitleY, "One-hand vertical breaker with fast replay energy", {
        align: "center",
        color: "#93b9e7",
        fontFamily: "Verdana",
        fontSize: layout.subtitleFontSize,
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        layout.bodyY,
        "Multiball, laser, chain bricks, and instant retries.\nBuilt to feel like a compact commercial arcade run.",
        {
          align: "center",
          color: "#d6e5f5",
          fontFamily: "Verdana",
          fontSize: layout.bodyFontSize,
          lineSpacing: layout.bodyLineSpacing,
        },
      )
      .setOrigin(0.5);

    const microHint = this.add
      .text(GAME_WIDTH / 2, layout.microHintY, "PREVIEW AREA: DRAG THE PADDLE, TAP TO SPLIT THE BALL", {
        align: "center",
        color: "#8fdcff",
        fontFamily: "Verdana",
        fontSize: layout.microHintFontSize,
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

    const optionsPanel = this.add.rectangle(GAME_WIDTH / 2, layout.optionsPanelY, layout.optionsPanelWidth, layout.optionsPanelHeight, 0x0d1830, 0.56).setStrokeStyle(
      2,
      0x8fdcff,
      0.16,
    );
    this.add
      .text(GAME_WIDTH / 2, layout.optionsTitleY, "OPTIONS", {
        color: "#f4f7fb",
        fontFamily: "Verdana",
        fontSize: layout.optionsTitleFontSize,
        fontStyle: "bold",
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    const sensitivityButton = this.createOptionButton(
      GAME_WIDTH / 2 - 220,
      layout.optionsButtonsY,
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
      layout.optionsButtonsY,
      () => `SFX ${this.runtimeSettings.sfxEnabled ? "ON" : "OFF"}`,
      () => {
        this.runtimeSettings.sfxEnabled = !this.runtimeSettings.sfxEnabled;
        this.persistSettings();
      },
    );
    const bgmButton = this.createOptionButton(
      GAME_WIDTH / 2 + 220,
      layout.optionsButtonsY,
      () => `BGM ${this.runtimeSettings.bgmEnabled ? "ON" : "OFF"}`,
      () => {
        this.runtimeSettings.bgmEnabled = !this.runtimeSettings.bgmEnabled;
        this.persistSettings();
      },
    );
    optionsPanel.setDataEnabled();
    optionsPanel.data?.set("buttons", [sensitivityButton, sfxButton, bgmButton]);

    const startButton = this.add
      .rectangle(GAME_WIDTH / 2, layout.startButtonY, layout.startButtonWidth, layout.startButtonHeight, 0x43d17a, 1)
      .setInteractive({ useHandCursor: true });
    const startGlow = this.add.rectangle(GAME_WIDTH / 2, layout.startButtonY, layout.startButtonWidth + 28, layout.startButtonHeight + 20, 0x43d17a, 0.18);
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
        fontSize: layout.startButtonFontSize,
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, layout.bodyFooterY, "No menus to dig through. Drop straight into play.", {
        align: "center",
        color: "#d5e2f5",
        fontFamily: "Verdana",
        fontSize: layout.bodyFooterFontSize,
      })
      .setOrigin(0.5);

    this.layoutSnapshot = {
      isMobile,
      gameHeight: GAME_HEIGHT,
      backdropCenterY: layout.backdropCenterY,
      contentTop: layout.eyebrowY,
      backdropBottom: layout.backdropCenterY + layout.backdropHeight / 2,
      optionsBottom: layout.optionsPanelY + layout.optionsPanelHeight / 2,
      contentBottom: Math.max(
        layout.optionsPanelY + layout.optionsPanelHeight / 2,
        layout.bodyFooterY + 24,
        layout.microHintY + 16,
      ),
    };

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!this.attractPaddle || !this.attractBall || pointer.y < layout.pointerZoneMinY || pointer.y > layout.pointerZoneMaxY) {
        return;
      }

      const nextX = Phaser.Math.Clamp(pointer.x, this.attractBounds.left, this.attractBounds.right);
      this.attractPaddle.x = nextX;
      if (this.attractAttached) {
        this.attractBall.x = nextX + 72;
        this.attractBall.y = layout.attractLaunchTargetY - 12;
        if (this.attractBallGlow) {
          this.attractBallGlow.x = this.attractBall.x;
          this.attractBallGlow.y = this.attractBall.y;
        }
      }
    });

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.y >= layout.pointerZoneMinY && pointer.y <= layout.pointerZoneMaxY) {
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
      this.attractBall.y = this.attractPaddle.y - 42;
      this.attractBallGlow.x = this.attractBall.x;
      this.attractBallGlow.y = this.attractBall.y;
      this.attractBallGlow.setAlpha(0.12);
      this.attractBallGlow.setScale(1);
    });
  }

  getDebugLayout(): {
    isMobile: boolean;
    backdropBottom: number;
    optionsBottom: number;
    contentBottom: number;
  } {
    return this.layoutSnapshot;
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
