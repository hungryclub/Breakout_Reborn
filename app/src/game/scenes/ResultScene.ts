import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig.ts";
import { SceneKeys } from "../core/SceneKeys.ts";

export class ResultScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Result);
  }

  create(): void {
    const panel = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 760, 520, 0x08101d, 0.94);
    panel.setVisible(false);

    const text = this.add
      .text(panel.x, panel.y, "Result Placeholder", {
        color: "#f4f7fb",
        fontFamily: "Trebuchet MS",
        fontSize: "54px",
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.events.on("wake", () => {
      panel.setVisible(true);
      text.setVisible(true);
    });

    this.events.on("sleep", () => {
      panel.setVisible(false);
      text.setVisible(false);
    });
  }
}
