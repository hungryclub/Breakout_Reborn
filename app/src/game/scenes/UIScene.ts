import Phaser from "phaser";

import { TEXTURE_KEYS, UI_ICON_TEXTURE_KEYS } from "../config/assetKeys.ts";
import type { InputSensitivityPreset } from "../config/inputConfig.ts";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig.ts";
import { STAGE_PRESENTATION_PROFILES } from "../config/presentationConfig.ts";
import { loadRuntimeSettings, saveRuntimeSettings, type RuntimeSettings } from "../config/settings.ts";
import { SceneKeys } from "../core/SceneKeys.ts";
import {
  getComboPresentation,
  getFailureOverlayAlpha,
  getRewardCardAccentAlpha,
  getResultTransitionProfile,
} from "../systems/presentationMath.ts";
import type { RewardChoice } from "../systems/rewardMath.ts";

export class UIScene extends Phaser.Scene {
  private launchPrompt?: Phaser.GameObjects.Text;
  private lifeText?: Phaser.GameObjects.Text;
  private scoreText?: Phaser.GameObjects.Text;
  private stageText?: Phaser.GameObjects.Text;
  private comboText?: Phaser.GameObjects.Text;
  private powerupToast?: Phaser.GameObjects.Text;
  private powerupStateText?: Phaser.GameObjects.Text;
  private rewardOverlay?: Phaser.GameObjects.Container;
  private resultOverlay?: Phaser.GameObjects.Container;
  private interruptOverlay?: Phaser.GameObjects.Container;
  private hudPanel?: Phaser.GameObjects.Rectangle;
  private comboGlow?: Phaser.GameObjects.Rectangle;
  private currentStageAccent = STAGE_PRESENTATION_PROFILES[1].accentColor;
  private transitionVeil?: Phaser.GameObjects.Rectangle;
  private runtimeSettings: RuntimeSettings = loadRuntimeSettings();

  constructor() {
    super(SceneKeys.UI);
  }

  create(): void {
    const stageProfile = STAGE_PRESENTATION_PROFILES[1];
    this.hudPanel = this.add.rectangle(GAME_WIDTH / 2, 90, 920, 120, stageProfile.panelColor, 0.82);
    this.comboGlow = this.add
      .rectangle(GAME_WIDTH / 2, 148, 280, 56, stageProfile.accentNumber, 0.1)
      .setOrigin(0.5);
    this.add.image(78, 90, UI_ICON_TEXTURE_KEYS.life).setDisplaySize(28, 28);
    this.add.image(GAME_WIDTH / 2 - 126, 90, UI_ICON_TEXTURE_KEYS.stage).setDisplaySize(28, 28);
    this.add.image(GAME_WIDTH - 220, 90, UI_ICON_TEXTURE_KEYS.score).setDisplaySize(28, 28);
    this.add.image(GAME_WIDTH / 2 - 96, 150, UI_ICON_TEXTURE_KEYS.combo).setDisplaySize(24, 24);

    this.lifeText = this.add
      .text(110, 90, "생명 x3", {
        color: "#f4f7fb",
        fontFamily: "Verdana",
        fontSize: "32px",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5);

    this.stageText = this.add
      .text(GAME_WIDTH / 2, 90, "STAGE 1", {
        color: stageProfile.accentColor,
        fontFamily: "Verdana",
        fontSize: "30px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.scoreText = this.add
      .text(GAME_WIDTH - 110, 90, "점수 0000", {
        color: "#cfdcf0",
        fontFamily: "Verdana",
        fontSize: "28px",
      })
      .setOrigin(1, 0.5);

    this.comboText = this.add
      .text(GAME_WIDTH / 2, 150, "COMBO 0", {
        color: stageProfile.comboBasicColor,
        fontFamily: "Verdana",
        fontSize: "26px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.powerupToast = this.add
      .text(GAME_WIDTH / 2, 220, "", {
        color: "#f4f7fb",
        fontFamily: "Verdana",
        fontSize: "28px",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.powerupStateText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 40, "", {
        color: "#cfdcf0",
        fontFamily: "Verdana",
        fontSize: "22px",
      })
      .setOrigin(0.5);

    this.launchPrompt = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 156, "탭해서 시작", {
        color: stageProfile.accentColor,
        fontFamily: "Verdana",
        fontSize: "42px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.game.events.on("launch-prompt-visible", this.handleLaunchPromptVisible, this);
    this.game.events.on("score-changed", this.handleScoreChanged, this);
    this.game.events.on("combo-changed", this.handleComboChanged, this);
    this.game.events.on("powerup-collected", this.handlePowerupCollected, this);
    this.game.events.on("powerup-state-changed", this.handlePowerupStateChanged, this);
    this.game.events.on("stage-changed", this.handleStageChanged, this);
    this.game.events.on("life-changed", this.handleLifeChanged, this);
    this.game.events.on("reward-offered", this.handleRewardOffered, this);
    this.game.events.on("result-shown", this.handleResultShown, this);
    this.game.events.on("interrupt-shown", this.handleInterruptShown, this);
    this.game.events.on("telemetry-updated", this.handleTelemetryUpdated, this);
    this.game.events.on("impact-event", this.handleImpactEvent, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off("launch-prompt-visible", this.handleLaunchPromptVisible, this);
      this.game.events.off("score-changed", this.handleScoreChanged, this);
      this.game.events.off("combo-changed", this.handleComboChanged, this);
      this.game.events.off("powerup-collected", this.handlePowerupCollected, this);
      this.game.events.off("powerup-state-changed", this.handlePowerupStateChanged, this);
      this.game.events.off("stage-changed", this.handleStageChanged, this);
      this.game.events.off("life-changed", this.handleLifeChanged, this);
      this.game.events.off("reward-offered", this.handleRewardOffered, this);
      this.game.events.off("result-shown", this.handleResultShown, this);
      this.game.events.off("interrupt-shown", this.handleInterruptShown, this);
      this.game.events.off("telemetry-updated", this.handleTelemetryUpdated, this);
      this.game.events.off("impact-event", this.handleImpactEvent, this);
    });
  }

  private handleLaunchPromptVisible(visible: boolean): void {
    if (!this.launchPrompt) {
      return;
    }

    this.tweens.killTweensOf(this.launchPrompt);

    if (visible) {
      this.launchPrompt.setVisible(true);
      this.launchPrompt.setAlpha(1);
      return;
    }

    this.tweens.add({
      targets: this.launchPrompt,
      alpha: 0,
      duration: 120,
      onComplete: () => {
        this.launchPrompt?.setVisible(false);
      },
    });
  }

  private handleScoreChanged(score: number): void {
    this.scoreText?.setText(`점수 ${score.toString().padStart(4, "0")}`);
  }

  private handleComboChanged(payload: { comboCount: number; feedbackTier: string }): void {
    this.comboText?.setText(`COMBO ${payload.comboCount}`);

    if (!this.comboText || !this.comboGlow) {
      return;
    }

    const stageProfile = STAGE_PRESENTATION_PROFILES[this.extractStageFromLabel()];
    const color =
      payload.feedbackTier === "peak"
        ? stageProfile.comboPeakColor
        : payload.feedbackTier === "emphasis"
          ? "#ff9f6e"
          : stageProfile.comboBasicColor;
    const presentation = getComboPresentation(payload.comboCount, payload.feedbackTier);

    this.comboText.setColor(color);
    this.comboText.setScale(presentation.scale);
    this.comboGlow.setFillStyle(Phaser.Display.Color.HexStringToColor(color).color, presentation.glowAlpha);
    this.tweens.killTweensOf(this.comboGlow);
    this.comboGlow.setScale(0.92);
    this.tweens.add({
      targets: this.comboGlow,
      scaleX: payload.feedbackTier === "peak" ? 1.34 : 1.08,
      scaleY: payload.feedbackTier === "peak" ? 1.22 : 1.02,
      alpha: 1,
      duration: payload.feedbackTier === "peak" ? 180 : 120,
      yoyo: true,
    });
  }

  private handlePowerupCollected(payload: { type: string }): void {
    if (!this.powerupToast) {
      return;
    }

    const labelMap: Record<string, string> = {
      expand: "와이드 패들 활성화",
      laser: "듀얼 레이저 준비",
      multiball: "스플릿 샷 활성화",
      magnet: "마그넷 락 활성화",
    };

    this.powerupToast.setText(labelMap[payload.type] ?? "파워업 획득");
    this.powerupToast.setAlpha(1);
    this.tweens.killTweensOf(this.powerupToast);
    this.tweens.add({
      targets: this.powerupToast,
      alpha: 0,
      y: 192,
      scaleX: 1.06,
      scaleY: 1.06,
      duration: 760,
      onStart: () => {
        this.powerupToast?.setY(220);
        this.powerupToast?.setScale(1);
      },
    });
  }

  private handlePowerupStateChanged(payload: {
    expandStacks: number;
    laserCharges: number;
    multiballCount: number;
    magnetCharges: number;
  }): void {
    const hints: string[] = [];
    if (payload.laserCharges > 0) {
      hints.push("발사 중 탭: 레이저");
    }
    if (payload.magnetCharges > 0) {
      hints.push("패들 반사 시 1회 재부착");
    }

    const hintText = hints.length > 0 ? ` | ${hints.join(" / ")}` : "";
    this.powerupStateText?.setText(
      `EXP ${payload.expandStacks} | LAS ${payload.laserCharges} | MB ${payload.multiballCount} | MAG ${payload.magnetCharges}${hintText}`,
    );
  }

  private handleStageChanged(stage: number): void {
    const profile = STAGE_PRESENTATION_PROFILES[stage];
    this.currentStageAccent = profile.accentColor;
    this.stageText?.setText(`STAGE ${stage} · ${profile.stageLabel}`);
    this.stageText?.setColor(profile.accentColor);
    this.launchPrompt?.setColor(profile.accentColor);
    this.comboText?.setColor(profile.comboBasicColor);
    this.hudPanel?.setFillStyle(profile.panelColor, 0.82);
    this.comboGlow?.setFillStyle(profile.accentNumber, 0.1);
  }

  private handleLifeChanged(lives: number): void {
    this.lifeText?.setText(`생명 x${lives}`);
  }

  private handleRewardOffered(payload: {
    reason: "stage_clear" | "start_bonus";
    choices: RewardChoice[];
  }): void {
    this.rewardOverlay?.destroy(true);

    const container = this.add.container(GAME_WIDTH / 2, GAME_WIDTH / 2);
    const bg = this.add.rectangle(0, 420, 900, 680, 0x08111d, 0.96);
    const frame = this.add.rectangle(0, 420, 912, 692, 0x000000, 0).setStrokeStyle(2, 0x6dd7ff, 0.35);
    const title = this.add
      .text(
        0,
        164,
        payload.reason === "start_bonus" ? "시작 보너스 선택" : "보상 선택",
        {
          color: "#f4f7fb",
          fontFamily: "Verdana",
          fontSize: "42px",
          fontStyle: "bold",
        },
      )
      .setOrigin(0.5);
    const subtitle = this.add
      .text(0, 220, payload.reason === "start_bonus" ? "첫 런의 스타일을 고르세요" : "다음 스테이지의 우세를 선택하세요", {
        color: "#a8c2e4",
        fontFamily: "Verdana",
        fontSize: "24px",
      })
      .setOrigin(0.5);

    container.add([bg, frame, title, subtitle]);
    container.setAlpha(0);
    container.setScale(0.97);

    payload.choices.forEach((choice, index) => {
      const offsetX =
        payload.choices.length === 3
          ? (index - 1) * 250
          : index === 0
            ? -170
            : 170;
      const rarityTone =
        choice.rarity === "epic" ? 0xffd166 : choice.rarity === "rare" ? 0xb68cff : 0x6dd7ff;
      const rarityLabel = choice.rarity === "epic" ? "EPIC" : choice.rarity === "rare" ? "RARE" : "STANDARD";
      const cardShadow = this.add.rectangle(offsetX, 444, 254, 294, 0x040913, 0.4);
      const card = this.add
        .rectangle(offsetX, 430, 248, 288, choice.rarity === "epic" ? 0x1f1c2c : choice.rarity === "rare" ? 0x171731 : 0x12233d, 1)
        .setStrokeStyle(2, rarityTone, 0.95)
        .setInteractive({ useHandCursor: true });
      const accent = this.add.rectangle(
        offsetX,
        316,
        248,
        48,
        rarityTone,
        getRewardCardAccentAlpha(false),
      );
      const rarityPill = this.add
        .text(offsetX, 336, rarityLabel, {
          color: "#f4f7fb",
          fontFamily: "Verdana",
          fontSize: "14px",
          fontStyle: "bold",
          letterSpacing: 2,
        })
        .setOrigin(0.5);
      const iconPlate = this.add.circle(
        offsetX,
        378,
        28,
        Phaser.Display.Color.HexStringToColor(choice.accentColor).color,
        0.18,
      );
      const gloss = this.add
        .rectangle(offsetX - 82, 430, 42, 248, 0xffffff, choice.rarity === "epic" ? 0.18 : choice.rarity === "rare" ? 0.13 : 0.09)
        .setAngle(18);
      const icon = this.add
        .image(offsetX, 378, choice.textureKey)
        .setDisplaySize(42, 42);
      const headline = this.add
        .text(offsetX, 432, choice.headline, {
          color: "#f4f7fb",
          fontFamily: "Verdana",
          fontSize: "28px",
          fontStyle: "bold",
          align: "center",
          wordWrap: { width: 186 },
        })
        .setOrigin(0.5);
      const impact = this.add
        .text(offsetX, 480, choice.impactTag.toUpperCase(), {
          color: choice.accentColor,
          fontFamily: "Verdana",
          fontSize: "18px",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
      const text = this.add
        .text(offsetX, 534, choice.subcopy, {
          color: "#bfd0e6",
          fontFamily: "Verdana",
          fontSize: "20px",
          align: "center",
          wordWrap: { width: 190 },
        })
        .setOrigin(0.5);

      [cardShadow, card, accent, rarityPill, iconPlate, gloss, icon, headline, impact, text].forEach((node) => {
        node.setAlpha(0);
      });
      cardShadow.setY(cardShadow.y + 12);
      card.setY(card.y + 14);
      accent.setY(accent.y + 10);
      rarityPill.setY(rarityPill.y + 10);
      iconPlate.setY(iconPlate.y + 10);
      gloss.setY(gloss.y + 10);
      icon.setY(icon.y + 10);
      headline.setY(headline.y + 10);
      impact.setY(impact.y + 10);
      text.setY(text.y + 10);

      card.on("pointerover", () => {
        accent.setAlpha(getRewardCardAccentAlpha(true));
        card.setScale(1.03);
        cardShadow.setAlpha(0.54);
        gloss.setAlpha(choice.rarity === "epic" ? 0.26 : choice.rarity === "rare" ? 0.18 : 0.12);
      });

      card.on("pointerout", () => {
        accent.setAlpha(getRewardCardAccentAlpha(false));
        card.setScale(1);
        cardShadow.setAlpha(0.4);
        gloss.setAlpha(choice.rarity === "epic" ? 0.18 : choice.rarity === "rare" ? 0.13 : 0.09);
      });

      card.on("pointerdown", () => {
        accent.setAlpha(getRewardCardAccentAlpha(true));
        this.tweens.add({
          targets: [card, cardShadow, accent, headline, impact, text, icon, gloss],
          scaleX: 1.04,
          scaleY: 1.04,
          alpha: 1,
          duration: 120,
          yoyo: true,
          onComplete: () => {
            this.tweens.add({
              targets: container,
              alpha: 0,
              scaleX: 0.96,
              scaleY: 0.96,
              y: container.y - 12,
              duration: 140,
              onComplete: () => {
                this.rewardOverlay?.destroy(true);
                this.rewardOverlay = undefined;
                this.game.events.emit("reward-selected", choice);
              },
            });
          },
        });
      });

      container.add([cardShadow, card, accent, rarityPill, iconPlate, gloss, icon, headline, impact, text]);

      this.tweens.add({
        targets: [cardShadow, card, accent, rarityPill, iconPlate, gloss, icon, headline, impact, text],
        alpha: 1,
        y: "-=10",
        delay: 80 + index * 65,
        duration: 180,
        ease: "Cubic.easeOut",
      });
      this.tweens.add({
        targets: gloss,
        x: offsetX + 84,
        alpha:
          choice.rarity === "epic"
            ? { from: 0.08, to: 0.28 }
            : choice.rarity === "rare"
              ? { from: 0.06, to: 0.2 }
              : { from: 0.05, to: 0.12 },
        delay: 260 + index * 80,
        duration: choice.rarity === "epic" ? 820 : 680,
        repeat: -1,
        repeatDelay: choice.rarity === "epic" ? 520 : 760,
        yoyo: false,
        ease: "Sine.easeInOut",
        onRepeat: () => {
          gloss.setX(offsetX - 82);
        },
      });

      const sparkleCount = choice.rarity === "epic" ? 4 : choice.rarity === "rare" ? 3 : 2;
      for (let sparkleIndex = 0; sparkleIndex < sparkleCount; sparkleIndex += 1) {
        const sparkle = this.add
          .circle(
            offsetX + Phaser.Math.Between(-88, 88),
            344 + Phaser.Math.Between(-24, 110),
            choice.rarity === "epic" ? 3 : 2,
            rarityTone,
            choice.rarity === "epic" ? 0.9 : 0.72,
          )
          .setAlpha(0);
        container.add(sparkle);
        this.tweens.add({
          targets: sparkle,
          alpha: { from: 0, to: choice.rarity === "epic" ? 0.9 : 0.72 },
          scaleX: { from: 0.4, to: 1.22 },
          scaleY: { from: 0.4, to: 1.22 },
          y: sparkle.y - Phaser.Math.Between(8, 18),
          delay: 320 + index * 80 + sparkleIndex * 140,
          duration: choice.rarity === "epic" ? 520 : 420,
          repeat: -1,
          repeatDelay: choice.rarity === "epic" ? 620 : 860,
          yoyo: true,
          ease: "Sine.easeInOut",
        });
      }
    });

    this.rewardOverlay = container;
    this.tweens.add({
      targets: container,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 160,
      ease: "Cubic.easeOut",
    });
  }

  private handleResultShown(payload: {
    title: string;
    cta: string;
    mode: string;
    subtitle?: string;
    stats?: string;
    statCards?: Array<{ label: string; value: string }>;
  }): void {
    this.resultOverlay?.destroy(true);
    this.transitionVeil?.destroy();

    const transitionProfile = getResultTransitionProfile(payload.mode === "cleared" ? "cleared" : "failed");
    const veil = this.add
      .rectangle(GAME_WIDTH / 2, GAME_WIDTH, GAME_WIDTH, GAME_WIDTH * 2.2, 0x040913, 0)
      .setScrollFactor(0);
    this.transitionVeil = veil;

    const container = this.add.container(GAME_WIDTH / 2, GAME_WIDTH / 2);
    const bgImage = this.add
      .image(0, 460, TEXTURE_KEYS.resultBackdrop)
      .setDisplaySize(860, 540)
      .setAlpha(0.98);
    const bg = this.add.rectangle(0, 460, 860, 540, 0x08111d, getFailureOverlayAlpha(0.76));
    const accentBar = this.add.rectangle(
      0,
      262,
      860,
      14,
      Phaser.Display.Color.HexStringToColor(this.currentStageAccent).color,
      0.84,
    );
    const title = this.add
      .text(0, 352, payload.title, {
        color: transitionProfile.titleColor,
        fontFamily: "Verdana",
        fontSize: "48px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const subtitle = this.add
      .text(0, 418, payload.subtitle ?? "", {
        color: "#bfd0e6",
        fontFamily: "Verdana",
        fontSize: "24px",
        align: "center",
      })
      .setOrigin(0.5);
    const stats = this.add
      .text(0, 462, payload.stats ?? "", {
        color: this.currentStageAccent,
        fontFamily: "Verdana",
        fontSize: "20px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const statCardNodes: Phaser.GameObjects.GameObject[] = [];
    payload.statCards?.forEach((card, index) => {
      const offsetX = (index - 1) * 210;
      const plate = this.add.rectangle(offsetX, 508, 180, 82, 0x10233d, 0.92).setStrokeStyle(
        2,
        Phaser.Display.Color.HexStringToColor(this.currentStageAccent).color,
        0.3,
      );
      const labelText = this.add
        .text(offsetX, 490, card.label, {
          color: "#8fb0cf",
          fontFamily: "Verdana",
          fontSize: "16px",
        })
        .setOrigin(0.5);
      const valueText = this.add
        .text(offsetX, 523, card.value, {
          color: "#f4f7fb",
          fontFamily: "Verdana",
          fontSize: "24px",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
      statCardNodes.push(plate, labelText, valueText);
    });
    const button = this.add
      .rectangle(0, 612, 400, 112, 0x43d17a, 1)
      .setInteractive({ useHandCursor: true });
    const label = this.add
      .text(0, 612, payload.cta, {
        color: "#08111d",
        fontFamily: "Verdana",
        fontSize: "42px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    button.on("pointerdown", () => {
      if (!this.resultOverlay) {
        return;
      }

      this.tweens.add({
        targets: [container, veil],
        alpha: 0,
        scaleX: 0.96,
        scaleY: 0.96,
        y: container.y + 10,
        duration: 140,
        ease: "Cubic.easeIn",
        onComplete: () => {
          this.resultOverlay?.destroy(true);
          this.resultOverlay = undefined;
          this.transitionVeil?.destroy();
          this.transitionVeil = undefined;
          this.game.events.emit("retry-run", { mode: payload.mode });
        },
      });
    });

    container.add([bgImage, bg, accentBar, title, subtitle, stats, ...statCardNodes, button, label]);
    container.setAlpha(0);
    container.setScale(transitionProfile.introScale);
    container.setY(container.y + transitionProfile.introOffsetY);
    this.resultOverlay = container;

    this.tweens.add({
      targets: veil,
      alpha: transitionProfile.veilAlpha,
      duration: 120,
      ease: "Quad.easeOut",
    });
    this.tweens.add({
      targets: container,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      y: container.y - transitionProfile.introOffsetY,
      duration: payload.mode === "cleared" ? 220 : 180,
      ease: payload.mode === "cleared" ? "Back.easeOut" : "Cubic.easeOut",
    });
    this.tweens.add({
      targets: accentBar,
      alpha: transitionProfile.accentAlpha,
      scaleX: payload.mode === "cleared" ? 1.02 : 1,
      duration: 180,
      yoyo: payload.mode === "cleared",
    });
    this.tweens.add({
      targets: title,
      scaleX: payload.mode === "cleared" ? 1.06 : 1.03,
      scaleY: payload.mode === "cleared" ? 1.06 : 1.03,
      duration: payload.mode === "cleared" ? 160 : 120,
      yoyo: true,
    });
  }

  private handleInterruptShown(visible: boolean): void {
    if (!visible) {
      this.interruptOverlay?.destroy(true);
      this.interruptOverlay = undefined;
      return;
    }

    this.interruptOverlay?.destroy(true);
    const container = this.add.container(GAME_WIDTH / 2, GAME_WIDTH / 2);
    const bg = this.add.rectangle(0, 500, 760, 360, 0x08111d, 0.94);
    const title = this.add
      .text(0, 440, "일시 중단", {
        color: "#f4f7fb",
        fontFamily: "Verdana",
        fontSize: "42px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const button = this.add
      .rectangle(0, 560, 320, 96, 0x6dd7ff, 1)
      .setInteractive({ useHandCursor: true });
    const label = this.add
      .text(0, 560, "재개", {
        color: "#08111d",
        fontFamily: "Verdana",
        fontSize: "36px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    button.on("pointerdown", () => {
      this.game.events.emit("resume-run");
      this.handleInterruptShown(false);
    });

    container.add([bg, title, button, label]);
    this.interruptOverlay = container;
  }

  private handleTelemetryUpdated(payload: { name: string }): void {
    if (!this.powerupStateText) {
      return;
    }

    const base = this.powerupStateText.text.split(" | EVT ")[0] ?? "";
    this.powerupStateText.setText(`${base} | EVT ${payload.name}`);
  }

  private handleImpactEvent(payload: { kind: string; accentColor?: string; title?: string }): void {
    if (payload.kind === "combo-peak" && this.comboText) {
      this.tweens.add({
        targets: this.comboText,
        scaleX: this.comboText.scaleX * 1.06,
        scaleY: this.comboText.scaleY * 1.06,
        duration: 100,
        yoyo: true,
      });
    }

    if (payload.kind === "reward-selected" && this.powerupToast) {
      this.powerupToast.setText(payload.title ?? "강화 선택 완료");
      this.powerupToast.setColor(payload.accentColor ?? "#f4f7fb");
      this.powerupToast.setAlpha(1);
      this.tweens.add({
        targets: this.powerupToast,
        alpha: 0,
        duration: 760,
      });
    }

    if ((payload.kind === "run-failed" || payload.kind === "run-cleared") && this.comboGlow) {
      const color = Phaser.Display.Color.HexStringToColor(payload.accentColor ?? this.currentStageAccent).color;
      this.comboGlow.setFillStyle(color, payload.kind === "run-cleared" ? 0.28 : 0.22);
      this.tweens.add({
        targets: this.comboGlow,
        scaleX: payload.kind === "run-cleared" ? 2.4 : 2.1,
        scaleY: payload.kind === "run-cleared" ? 1.8 : 1.6,
        alpha: 0,
        duration: 260,
        ease: "Quad.easeOut",
        onComplete: () => {
          this.comboGlow?.setScale(1);
          this.comboGlow?.setAlpha(1);
          this.comboGlow?.setFillStyle(
            STAGE_PRESENTATION_PROFILES[this.extractStageFromLabel()].accentNumber,
            0.1,
          );
        },
      });
    }
  }

  private extractStageFromLabel(): number {
    const match = this.stageText?.text.match(/STAGE\s+(\d+)/);
    return match ? Number(match[1]) : 1;
  }
}
