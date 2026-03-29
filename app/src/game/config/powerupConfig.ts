export const POWERUP_SIZE = 36;
export const POWERUP_FALL_SPEED = 250;
export const POWERUP_TYPES = ["expand", "laser", "multiball", "magnet"] as const;

export type PowerupType = (typeof POWERUP_TYPES)[number];

export const POWERUP_COLORS: Record<PowerupType, number> = {
  expand: 0x53d28f,
  laser: 0xff6474,
  multiball: 0x6db8ff,
  magnet: 0xf2cf5b,
};
