import Phaser from "phaser";

import {
  AUDIO_CUE_KEYS,
  BGM_TRACK_KEYS,
  BRICK_DEBRIS_TEXTURE_KEYS,
  BRICK_TEXTURE_KEYS,
  POWERUP_TEXTURE_KEYS,
  STAGE_FRAME_TEXTURE_KEYS,
  TEXTURE_KEYS,
  UI_ICON_TEXTURE_KEYS,
} from "../config/assetKeys";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig";
import { SceneKeys } from "../core/SceneKeys";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Preload);
  }

  preload(): void {
    const progressBar = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 86, 0, 12, 0x6dd7ff, 1).setOrigin(0.5);
    const progressTrack = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 86, 380, 12, 0xffffff, 0.14)
      .setOrigin(0.5);

    this.load.svg(TEXTURE_KEYS.ball, "assets/textures/ball.svg");
    this.load.svg(TEXTURE_KEYS.paddle, "assets/textures/paddle.svg");
    this.load.svg(TEXTURE_KEYS.menuBackdrop, "assets/textures/menu-backdrop.svg");
    this.load.svg(TEXTURE_KEYS.resultBackdrop, "assets/textures/result-backdrop.svg");
    Object.entries(STAGE_FRAME_TEXTURE_KEYS).forEach(([, key]) => {
      this.load.svg(key, `assets/textures/${key}.svg`);
    });

    Object.entries(BRICK_TEXTURE_KEYS).forEach(([, key]) => {
      this.load.svg(key, `assets/textures/${key}.svg`);
    });

    Object.entries(BRICK_DEBRIS_TEXTURE_KEYS).forEach(([, key]) => {
      this.load.svg(key, `assets/textures/${key}.svg`);
    });

    Object.entries(POWERUP_TEXTURE_KEYS).forEach(([, key]) => {
      this.load.svg(key, `assets/textures/${key}.svg`);
    });

    Object.entries(UI_ICON_TEXTURE_KEYS).forEach(([, key]) => {
      this.load.svg(key, `assets/textures/${key}.svg`);
    });

    Object.entries(AUDIO_CUE_KEYS).forEach(([, key]) => {
      const fileName = key.replace("sfx-", "");
      this.load.audio(key, `assets/audio/${fileName}.wav`);
    });

    Object.entries(BGM_TRACK_KEYS).forEach(([, key]) => {
      this.load.audio(key, `assets/audio/${key}.wav`);
    });

    this.load.on("progress", (value: number) => {
      progressBar.width = 380 * value;
    });

    this.load.once("complete", () => {
      progressBar.destroy();
      progressTrack.destroy();
    });
  }

  create(): void {
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "Loading...", {
        color: "#f4f7fb",
        fontFamily: "Verdana",
        fontSize: "48px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 34, "Commercial art and audio pack", {
        color: "#90a8c5",
        fontFamily: "Verdana",
        fontSize: "20px",
      })
      .setOrigin(0.5);

    this.time.delayedCall(120, () => {
      this.scene.start(SceneKeys.Menu);
    });
  }
}
