import type Phaser from "phaser";

import { AUDIO_CUE_KEYS } from "../config/assetKeys.ts";

type CueKind = keyof typeof AUDIO_CUE_KEYS;
interface AudioPlayOptions {
  rate?: number;
  volumeMultiplier?: number;
}

const MOBILE_EFFECTS_TRIM = 0.9;

const CUE_CONFIG: Record<CueKind, Phaser.Types.Sound.SoundConfig> = {
  launch: { volume: 0.2 },
  "paddle-bounce": { volume: 0.14 },
  "brick-hit": { volume: 0.12 },
  "combo-peak": { volume: 0.18 },
  "reward-selected": { volume: 0.22 },
  "laser-burst": { volume: 0.17 },
  "multiball-split": { volume: 0.18 },
  "magnet-catch": { volume: 0.14 },
  "ball-lost": { volume: 0.18 },
  failure: { volume: 0.22 },
  clear: { volume: 0.24 },
  "stage-shift": { volume: 0.16 },
};

export class AudioCueSystem {
  private enabled = true;
  private readonly sound: Phaser.Sound.BaseSoundManager;
  private readonly audioCache: Phaser.Cache.BaseCache;

  constructor(sound: Phaser.Sound.BaseSoundManager, audioCache: Phaser.Cache.BaseCache) {
    this.sound = sound;
    this.audioCache = audioCache;
  }

  unlock(): void {
    // Phaser handles browser gesture gating internally once a user interacts.
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  play(cue: CueKind, options: AudioPlayOptions = {}): void {
    if (!this.enabled) {
      return;
    }

    const key = AUDIO_CUE_KEYS[cue];
    if (!key) {
      return;
    }

    if (!this.audioCache.exists(key)) {
      return;
    }

    const baseConfig = CUE_CONFIG[cue];
    this.sound.play(key, {
      ...baseConfig,
      rate: options.rate ?? baseConfig.rate,
      volume: (baseConfig.volume ?? 1) * (options.volumeMultiplier ?? 1) * MOBILE_EFFECTS_TRIM,
    });
  }
}
