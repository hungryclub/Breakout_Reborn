import type { InputSensitivityPreset } from "./inputConfig";

export interface RuntimeSettings {
  sensitivity: InputSensitivityPreset;
  sfxEnabled: boolean;
  bgmEnabled: boolean;
}

export const DEFAULT_RUNTIME_SETTINGS: RuntimeSettings = {
  sensitivity: "default",
  sfxEnabled: true,
  bgmEnabled: true,
};

const STORAGE_KEY = "breakout-reborn-settings";

export function loadRuntimeSettings(): RuntimeSettings {
  if (typeof localStorage === "undefined") {
    return DEFAULT_RUNTIME_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_RUNTIME_SETTINGS;
    }

    const parsed = JSON.parse(raw) as Partial<RuntimeSettings>;
    return {
      sensitivity:
        parsed.sensitivity === "precise" || parsed.sensitivity === "fast" || parsed.sensitivity === "default"
          ? parsed.sensitivity
          : DEFAULT_RUNTIME_SETTINGS.sensitivity,
      sfxEnabled: typeof parsed.sfxEnabled === "boolean" ? parsed.sfxEnabled : DEFAULT_RUNTIME_SETTINGS.sfxEnabled,
      bgmEnabled: typeof parsed.bgmEnabled === "boolean" ? parsed.bgmEnabled : DEFAULT_RUNTIME_SETTINGS.bgmEnabled,
    };
  } catch {
    return DEFAULT_RUNTIME_SETTINGS;
  }
}

export function saveRuntimeSettings(settings: RuntimeSettings): void {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
