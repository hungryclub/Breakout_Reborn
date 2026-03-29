import Phaser from "phaser";

import { SceneKeys } from "../core/SceneKeys";

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Boot);
  }

  create(): void {
    this.scale.lockOrientation?.("portrait");
    this.scene.start(SceneKeys.Preload);
  }
}
