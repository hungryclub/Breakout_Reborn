export const INPUT_ZONE_RATIO = 0.35;

export const INPUT_SENSITIVITY_PRESETS = {
  precise: 0.82,
  default: 0.96,
  fast: 1.1,
} as const;

export type InputSensitivityPreset = keyof typeof INPUT_SENSITIVITY_PRESETS;

export const DEFAULT_INPUT_SENSITIVITY: InputSensitivityPreset = "default";
