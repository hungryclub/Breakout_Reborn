import Phaser from "phaser";

import { SceneKeys } from "../core/SceneKeys.ts";
import { GAME_HEIGHT, GAME_WIDTH } from "./runtimeDimensions.ts";
import { BootScene } from "../scenes/BootScene.ts";
import { GameScene } from "../scenes/GameScene.ts";
import { MenuScene } from "../scenes/MenuScene.ts";
import { PreloadScene } from "../scenes/PreloadScene.ts";
import { ResultScene } from "../scenes/ResultScene.ts";
import { UIScene } from "../scenes/UIScene.ts";

export { GAME_HEIGHT, GAME_WIDTH } from "./runtimeDimensions.ts";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-mount",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#09111f",
  render: {
    antialias: true,
    pixelArt: false,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.NO_CENTER,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  scene: [
    BootScene,
    PreloadScene,
    MenuScene,
    GameScene,
    UIScene,
    ResultScene,
  ],
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  input: {
    activePointers: 3,
  },
  callbacks: {
    postBoot: (game) => {
      game.registry.set("sceneKeys", SceneKeys);
    },
  },
};
