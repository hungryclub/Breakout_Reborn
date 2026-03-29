import type { Page } from "@playwright/test";

export interface DebugSnapshot {
  heartbeat: number;
  currentStage: number;
  lives: number;
  score: number;
  runEnding: boolean;
  physicsPaused: boolean;
  pendingRewardReason: "stage_clear" | "start_bonus" | null;
  activeBrickCount: number;
  ballCount: number;
  balls: Array<{
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    attached: boolean;
  }>;
  paddle: {
    x: number;
    width: number;
  } | null;
  powerupState?: {
    expandStacks: number;
    laserCharges: number;
    multiballCount: number;
    magnetCharges: number;
  };
}

export interface InvariantCheckResult {
  failures: string[];
  stationaryFrames: number;
}

const PLAYFIELD_LEFT = 80;
const PLAYFIELD_RIGHT = 1000;
const PLAYFIELD_TOP = 250;
const PLAYFIELD_BOTTOM = 1670;

export function chooseBotReward(snapshot: DebugSnapshot): "multiball" | "laser" | "magnet" | "expand" {
  if ((snapshot.powerupState?.multiballCount ?? 1) < 2) {
    return "multiball";
  }
  if ((snapshot.powerupState?.laserCharges ?? 0) === 0) {
    return "laser";
  }
  if (snapshot.lives <= 1 && (snapshot.powerupState?.magnetCharges ?? 0) === 0) {
    return "magnet";
  }
  return "expand";
}

export async function runBotStep(page: Page, stepIndex: number): Promise<DebugSnapshot> {
  await page.evaluate(step => window.__breakoutTestApi?.botStep(step), stepIndex);
  await page.waitForTimeout(16);
  return getSnapshot(page);
}

export function checkInvariants(
  snapshot: DebugSnapshot,
  previous: DebugSnapshot | null,
  stationaryFrames: number,
): InvariantCheckResult {
  const failures: string[] = [];

  if (snapshot.lives < 0 || snapshot.lives > 3) {
    failures.push(`lives out of range: ${snapshot.lives}`);
  }
  if (snapshot.score < 0) {
    failures.push(`score below zero: ${snapshot.score}`);
  }
  if (snapshot.activeBrickCount < 0) {
    failures.push(`activeBrickCount below zero: ${snapshot.activeBrickCount}`);
  }
  if (snapshot.ballCount < 1) {
    failures.push(`ballCount below one: ${snapshot.ballCount}`);
  }

  snapshot.balls.forEach((ball, index) => {
    if (!Number.isFinite(ball.x) || !Number.isFinite(ball.y) || !Number.isFinite(ball.velocityX) || !Number.isFinite(ball.velocityY)) {
      failures.push(`ball ${index} has non-finite state`);
    }
    if (ball.x < PLAYFIELD_LEFT - 32 || ball.x > PLAYFIELD_RIGHT + 32) {
      failures.push(`ball ${index} escaped horizontal playfield: ${ball.x}`);
    }
    if (ball.y < PLAYFIELD_TOP - 64 || ball.y > PLAYFIELD_BOTTOM + 96) {
      failures.push(`ball ${index} escaped vertical playfield: ${ball.y}`);
    }
  });

  if (snapshot.paddle) {
    const halfWidth = snapshot.paddle.width / 2;
    if (snapshot.paddle.x - halfWidth < PLAYFIELD_LEFT - 1 || snapshot.paddle.x + halfWidth > PLAYFIELD_RIGHT + 1) {
      failures.push(`paddle escaped playfield: x=${snapshot.paddle.x}, width=${snapshot.paddle.width}`);
    }
  }

  let nextStationaryFrames = stationaryFrames;
  if (previous && !snapshot.physicsPaused && !snapshot.runEnding) {
    const moving = snapshot.balls.some((ball, index) => {
      const prev = previous.balls[index];
      return !prev || ball.attached !== prev.attached || Math.abs(ball.x - prev.x) > 0.5 || Math.abs(ball.y - prev.y) > 0.5;
    });
    nextStationaryFrames = moving ? 0 : stationaryFrames + 1;
  } else {
    nextStationaryFrames = 0;
  }

  if (nextStationaryFrames > 25) {
    failures.push(`snapshot stalled for ${nextStationaryFrames} consecutive bot frames`);
  }

  return {
    failures,
    stationaryFrames: nextStationaryFrames,
  };
}

export async function gotoGame(page: Page, options: { botMode?: boolean } = {}): Promise<void> {
  const botMode = options.botMode ?? false;
  await page.goto("/");
  await page.waitForFunction(() => typeof window.__breakoutTestApi !== "undefined", undefined, {
    timeout: 60_000,
  });
  await page.evaluate(() => {
    window.__breakoutTestApi?.resetMeta();
  });
  await page.evaluate(botMode => {
    window.__breakoutTestApi?.setBotMode?.(Boolean(botMode));
    window.__breakoutTestApi?.startGame();
  }, botMode);
  await page.waitForFunction(expectPendingReward => {
    const snapshot = window.__breakoutTestApi?.getSnapshot();
    if (!snapshot) {
      return false;
    }

    const ready = snapshot.ballCount === 1 && snapshot.balls[0]?.attached;
    if (!ready) {
      return false;
    }

    return expectPendingReward ? snapshot.pendingRewardReason === "start_bonus" || snapshot.physicsPaused : true;
  }, !botMode, {
    timeout: 60_000,
  });
}

export async function getSnapshot(page: Page): Promise<DebugSnapshot> {
  return page.evaluate(() => window.__breakoutTestApi?.getSnapshot() ?? null);
}

export async function waitForSnapshot(
  page: Page,
  predicate: (snapshot: DebugSnapshot) => boolean,
): Promise<DebugSnapshot> {
  await page.waitForFunction(predicateFn => {
    const snapshot = window.__breakoutTestApi?.getSnapshot();
    if (!snapshot) {
      return false;
    }

    return Function(`return (${predicateFn})(arguments[0]);`)()(snapshot);
  }, predicate.toString());

  return getSnapshot(page);
}
