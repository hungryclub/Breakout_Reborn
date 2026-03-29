import type { PowerupType } from "../config/powerupConfig.ts";

export function pickPowerupType(seedIndex: number): PowerupType {
  const types: PowerupType[] = ["expand", "laser", "multiball", "magnet"];
  return types[seedIndex % types.length] ?? "expand";
}
