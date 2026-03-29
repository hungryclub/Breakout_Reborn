import type Phaser from "phaser";

import { BGM_TRACK_KEYS } from "../config/assetKeys";

export class MusicSystem {
  private currentTrack?: Phaser.Sound.BaseSound;
  private currentStage?: number;
  private unlocked = false;
  private enabled = true;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly sound: Phaser.Sound.BaseSoundManager,
    private readonly audioCache: Phaser.Cache.BaseCache,
  ) {}

  unlock(): void {
    this.unlocked = true;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  playStageLoop(stage: number): void {
    if (!this.enabled || !this.unlocked || this.currentStage === stage) {
      return;
    }

    const key = BGM_TRACK_KEYS[stage];
    if (!key || !this.audioCache.exists(key)) {
      return;
    }

    this.stop();
    this.currentStage = stage;
    this.currentTrack = this.sound.add(key, {
      loop: true,
      volume: stage === 4 ? 0.22 : stage === 3 ? 0.2 : 0.18,
    });
    this.currentTrack.play();
  }

  duckForResult(mode: "failed" | "cleared"): void {
    if (!this.currentTrack) {
      return;
    }

    const target = mode === "cleared" ? 0.12 : 0.08;
    this.scene.tweens.add({
      targets: this.currentTrack,
      volume: target,
      duration: 220,
      ease: "Quad.easeOut",
    });
  }

  restoreStageVolume(): void {
    if (!this.currentTrack || this.currentStage === undefined) {
      return;
    }

    const target = this.currentStage === 4 ? 0.22 : this.currentStage === 3 ? 0.2 : 0.18;
    this.scene.tweens.add({
      targets: this.currentTrack,
      volume: target,
      duration: 180,
      ease: "Quad.easeOut",
    });
  }

  stop(): void {
    if (this.currentTrack) {
      this.currentTrack.stop();
      this.currentTrack.destroy();
      this.currentTrack = undefined;
    }
  }
}
