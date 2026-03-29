import { expect, test } from "@playwright/test";

import {
  checkInvariants,
  getSnapshot,
  gotoGame,
  runBotStep,
  type DebugSnapshot,
} from "./helpers";

test.describe("bot-driven bug hunting", () => {
  test.describe.configure({ timeout: 600_000 });

  test.beforeEach(async ({ page }) => {
    await gotoGame(page, { botMode: true });
  });

  test("scenario bot survives core loop without invariant failures", async ({ page }) => {
    let previous: DebugSnapshot | null = null;
    let stationaryFrames = 0;
    const failures: string[] = [];

    for (let step = 0; step < 50; step += 1) {
      const snapshot = await runBotStep(page, step);
      const result = checkInvariants(snapshot, previous, stationaryFrames);
      stationaryFrames = result.stationaryFrames;
      failures.push(...result.failures.map(failure => `[step ${step}] ${failure}`));
      previous = snapshot;
    }

    expect(failures).toEqual([]);
  });

  test("state bot can recover across reward, launch, and life-loss transitions", async ({ page }) => {
    let previous: DebugSnapshot | null = null;
    let stationaryFrames = 0;
    const visitedStages = new Set<number>();

    for (let step = 0; step < 55; step += 1) {
      const snapshot = await runBotStep(page, step);
      visitedStages.add(snapshot.currentStage);
      const result = checkInvariants(snapshot, previous, stationaryFrames);
      stationaryFrames = result.stationaryFrames;
      expect(result.failures).toEqual([]);
      previous = snapshot;

      if (step === 28) {
        await page.evaluate(() => window.__breakoutTestApi?.forceBallLoss(0));
      }
    }

    const snapshot = await getSnapshot(page);
    expect(snapshot.lives).toBeGreaterThanOrEqual(1);
    expect(visitedStages.size).toBeGreaterThanOrEqual(1);
  });

  test("monte carlo soak bot finds no invariant break across repeated runs", async ({ page }) => {
    const runFailures: string[] = [];

    for (let run = 0; run < 5; run += 1) {
      await gotoGame(page);
      let previous: DebugSnapshot | null = null;
      let stationaryFrames = 0;

      for (let step = 0; step < 20; step += 1) {
        const snapshot = await runBotStep(page, step + run * 100);
        const result = checkInvariants(snapshot, previous, stationaryFrames);
        stationaryFrames = result.stationaryFrames;
        if (result.failures.length > 0) {
          runFailures.push(`run ${run} step ${step}: ${result.failures.join(", ")}`);
          break;
        }
        previous = snapshot;

        if (step === 14 && run % 3 === 1) {
          await page.evaluate(() => window.__breakoutTestApi?.forceBallLoss(0));
        }
        if (step === 20 && run % 4 === 2) {
          await page.evaluate(() => window.__breakoutTestApi?.grantPowerup("laser"));
        }
      }
    }

    expect(runFailures).toEqual([]);
  });
});
