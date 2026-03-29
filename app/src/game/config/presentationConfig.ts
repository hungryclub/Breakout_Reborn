export interface StagePresentationProfile {
  backgroundColor: string;
  panelColor: number;
  accentColor: string;
  accentNumber: number;
  comboBasicColor: string;
  comboPeakColor: string;
  stageLabel: string;
  mood: string;
}

export const STAGE_PRESENTATION_PROFILES: Record<number, StagePresentationProfile> = {
  1: {
    backgroundColor: "#09111f",
    panelColor: 0x0e1a2c,
    accentColor: "#6dd7ff",
    accentNumber: 0x6dd7ff,
    comboBasicColor: "#6dd7ff",
    comboPeakColor: "#ffd166",
    stageLabel: "ARCADE SURGE",
    mood: "즉시 시원함",
  },
  2: {
    backgroundColor: "#0d1526",
    panelColor: 0x111f34,
    accentColor: "#8cc8ff",
    accentNumber: 0x8cc8ff,
    comboBasicColor: "#71d0ff",
    comboPeakColor: "#ffb366",
    stageLabel: "CONTROL GRID",
    mood: "정밀 제어",
  },
  3: {
    backgroundColor: "#151428",
    panelColor: 0x191933,
    accentColor: "#ff8f66",
    accentNumber: 0xff8f66,
    comboBasicColor: "#ffb266",
    comboPeakColor: "#ffd166",
    stageLabel: "CHAIN REACTOR",
    mood: "연쇄 폭발",
  },
  4: {
    backgroundColor: "#1b1120",
    panelColor: 0x24152a,
    accentColor: "#ff6fb4",
    accentNumber: 0xff6fb4,
    comboBasicColor: "#ff8fc8",
    comboPeakColor: "#ffe27a",
    stageLabel: "CHAOS CIRCUIT",
    mood: "혼돈 속 통제",
  },
};

export const STAGE_BACKGROUND_COLORS: Record<number, string> = Object.fromEntries(
  Object.entries(STAGE_PRESENTATION_PROFILES).map(([stage, profile]) => [Number(stage), profile.backgroundColor]),
) as Record<number, string>;
