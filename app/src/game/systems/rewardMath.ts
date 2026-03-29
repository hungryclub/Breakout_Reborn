import type { PowerupType } from "../config/powerupConfig.ts";
import { POWERUP_TEXTURE_KEYS } from "../config/assetKeys.ts";

export interface RewardChoice {
  id: string;
  type: PowerupType;
  label: string;
  headline: string;
  subcopy: string;
  impactTag: string;
  icon: string;
  textureKey: string;
  accentColor: string;
  rarity: "standard" | "rare" | "epic";
}

const REWARD_CATALOG: Record<
  PowerupType,
  Omit<RewardChoice, "id">
> = {
  expand: {
    type: "expand",
    label: "패들 확장",
    headline: "와이드 패들",
    subcopy: "반사 범위를 넓혀 안정적으로 받아냅니다.",
    impactTag: "안정성 강화",
    icon: "▰",
    textureKey: POWERUP_TEXTURE_KEYS.expand,
    accentColor: "#43d17a",
    rarity: "standard",
  },
  laser: {
    type: "laser",
    label: "레이저 충전",
    headline: "듀얼 레이저",
    subcopy: "발사 중 탭으로 상단 브릭 두 곳을 정리합니다.",
    impactTag: "즉시 돌파",
    icon: "╫",
    textureKey: POWERUP_TEXTURE_KEYS.laser,
    accentColor: "#ff6b7d",
    rarity: "rare",
  },
  multiball: {
    type: "multiball",
    label: "멀티볼",
    headline: "스플릿 샷",
    subcopy: "한 번의 발사로 여러 공이 동시에 분열합니다.",
    impactTag: "쇼타임",
    icon: "◉",
    textureKey: POWERUP_TEXTURE_KEYS.multiball,
    accentColor: "#6dd7ff",
    rarity: "epic",
  },
  magnet: {
    type: "magnet",
    label: "자석",
    headline: "마그넷 락",
    subcopy: "패들 반사 시 1회 공을 다시 붙잡아 재조준합니다.",
    impactTag: "제어 회복",
    icon: "⌁",
    textureKey: POWERUP_TEXTURE_KEYS.magnet,
    accentColor: "#b68cff",
    rarity: "rare",
  },
};

export function createRewardChoices(count = 2): RewardChoice[] {
  const pool: PowerupType[] = ["expand", "laser", "multiball", "magnet"];

  return pool.slice(0, count).map((type, index) => ({
    id: `${type}-${index}`,
    ...REWARD_CATALOG[type],
  }));
}
