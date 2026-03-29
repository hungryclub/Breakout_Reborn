import type Phaser from "phaser";

import type { PowerupType } from "../config/powerupConfig.ts";
import { SceneKeys } from "../core/SceneKeys.ts";
import type { GameScene } from "../scenes/GameScene.ts";
import type { MenuScene } from "../scenes/MenuScene.ts";

declare global {
  interface Window {
    __breakoutTestApi?: BreakoutTestApi;
  }
}

export interface BreakoutTestApi {
  startGame(): boolean;
  resetMeta(): void;
  setBotMode(enabled: boolean): void;
  getSnapshot(): ReturnType<GameScene["getDebugSnapshot"]> | null;
  getMenuLayout(): ReturnType<MenuScene["getDebugLayout"]> | null;
  botStep(stepIndex: number): ReturnType<GameScene["getDebugSnapshot"]> | null;
  chooseReward(type: PowerupType): boolean;
  grantPowerup(type: PowerupType): boolean;
  launchPrimaryBall(): boolean;
  setBallState(
    index: number,
    state: { x?: number; y?: number; velocityX?: number; velocityY?: number },
  ): boolean;
  forceBallLoss(index?: number): boolean;
  retryRun(): void;
  fireLaser(): boolean;
  movePaddleTo(x: number): boolean;
}

function getGameScene(game: Phaser.Game): GameScene | null {
  const scene = game.scene.getScene(SceneKeys.Game);
  if (!scene || !scene.scene.isActive()) {
    return null;
  }

  return scene as GameScene;
}

function getMenuScene(game: Phaser.Game): MenuScene | null {
  const scene = game.scene.getScene(SceneKeys.Menu);
  if (!scene || !scene.scene.isActive()) {
    return null;
  }

  return scene as MenuScene;
}

export function registerDebugApi(game: Phaser.Game): void {
  if (typeof window === "undefined") {
    return;
  }

  window.__breakoutTestApi = {
    startGame() {
      const botMode = Boolean(game.registry.get("botMode"));
      const gameScene = game.scene.getScene(SceneKeys.Game);
      if (botMode && gameScene && gameScene.scene && gameScene.scene.isActive()) {
        game.scene.stop(SceneKeys.Game);
      }

      const nextGameScene = game.scene.getScene(SceneKeys.Game);
      if (!nextGameScene || !nextGameScene.scene || !nextGameScene.scene.isActive()) {
        game.scene.start(SceneKeys.Game);
      }

      const uiScene = game.scene.getScene(SceneKeys.UI);
      if (botMode) {
        if (uiScene && uiScene.scene && uiScene.scene.isActive()) {
          game.scene.stop(SceneKeys.UI);
        }
      } else if (!uiScene || !uiScene.scene || !uiScene.scene.isActive()) {
        game.scene.run(SceneKeys.UI);
      }

      return true;
    },
    resetMeta() {
      window.localStorage.removeItem("breakout-reborn-meta");
    },
    setBotMode(enabled) {
      game.registry.set("botMode", enabled);
    },
    getSnapshot() {
      return getGameScene(game)?.getDebugSnapshot() ?? null;
    },
    getMenuLayout() {
      return getMenuScene(game)?.getDebugLayout() ?? null;
    },
    botStep(stepIndex) {
      return getGameScene(game)?.debugBotStep(stepIndex) ?? null;
    },
    chooseReward(type) {
      return getGameScene(game)?.debugChooseReward(type) ?? false;
    },
    grantPowerup(type) {
      return getGameScene(game)?.debugGrantPowerup(type) ?? false;
    },
    launchPrimaryBall() {
      return getGameScene(game)?.debugLaunchPrimaryBall() ?? false;
    },
    setBallState(index, state) {
      return getGameScene(game)?.debugSetBallState(index, state) ?? false;
    },
    forceBallLoss(index) {
      return getGameScene(game)?.debugForceBallLoss(index) ?? false;
    },
    retryRun() {
      getGameScene(game)?.debugRetryRun();
    },
    fireLaser() {
      return getGameScene(game)?.debugFireLaser() ?? false;
    },
    movePaddleTo(x) {
      return getGameScene(game)?.debugMovePaddleTo(x) ?? false;
    },
  };
}
