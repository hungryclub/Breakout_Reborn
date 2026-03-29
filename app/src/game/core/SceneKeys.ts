export const SceneKeys = {
  Boot: "BootScene",
  Preload: "PreloadScene",
  Menu: "MenuScene",
  Game: "GameScene",
  UI: "UIScene",
  Result: "ResultScene",
} as const;

export type SceneKey = (typeof SceneKeys)[keyof typeof SceneKeys];
