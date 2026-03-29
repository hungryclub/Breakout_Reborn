import Phaser from "phaser";

import { gameConfig } from "../config/gameConfig";
import { registerDebugApi } from "../testing/debugApi";

export const game = new Phaser.Game(gameConfig);

registerDebugApi(game);
