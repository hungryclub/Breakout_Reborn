import Phaser from "phaser";

import { gameConfig } from "../config/gameConfig.ts";
import { registerDebugApi } from "../testing/debugApi.ts";

export const game = new Phaser.Game(gameConfig);

registerDebugApi(game);
