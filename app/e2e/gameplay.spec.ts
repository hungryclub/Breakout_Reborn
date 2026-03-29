import { expect, test } from "@playwright/test";

import { getSnapshot, gotoGame } from "./helpers";

test.beforeEach(async ({ page }) => {
  await gotoGame(page);
});

test("mobile layout removes app padding and fits viewport without scroll", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 664 });
  await page.goto("/");
  await page.waitForFunction(() => typeof window.__breakoutTestApi !== "undefined");

  const layout = await page.evaluate(() => {
    const app = document.querySelector<HTMLElement>("#app");
    const shell = document.querySelector<HTMLElement>(".app-shell");
    const appStyle = app ? getComputedStyle(app) : null;
    const shellRect = shell?.getBoundingClientRect();

    return {
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      appPadding: appStyle
        ? {
            top: appStyle.paddingTop,
            right: appStyle.paddingRight,
            bottom: appStyle.paddingBottom,
            left: appStyle.paddingLeft,
          }
        : null,
      shellRect: shellRect
        ? {
            x: shellRect.x,
            y: shellRect.y,
            width: shellRect.width,
            height: shellRect.height,
            right: shellRect.right,
            bottom: shellRect.bottom,
          }
        : null,
    };
  });

  expect(layout.appPadding).toEqual({
    top: "0px",
    right: "0px",
    bottom: "0px",
    left: "0px",
  });
  expect(layout.scrollWidth).toBe(layout.innerWidth);
  expect(layout.scrollHeight).toBe(layout.innerHeight);
  expect(layout.shellRect?.x ?? 0).toBeLessThanOrEqual(1);
  expect((layout.innerWidth - (layout.shellRect?.right ?? 0))).toBeLessThanOrEqual(1);
  expect(layout.shellRect?.y ?? 0).toBeLessThanOrEqual(1);
  expect(layout.shellRect?.width ?? 0).toBeGreaterThanOrEqual(layout.innerWidth - 1);
});

test("launch moves the primary ball", async ({ page }) => {
  await page.evaluate(() => window.__breakoutTestApi?.chooseReward("expand"));
  await page.evaluate(() => window.__breakoutTestApi?.launchPrimaryBall());

  await page.waitForFunction(() => {
    const snapshot = window.__breakoutTestApi?.getSnapshot();
    return Boolean(snapshot && snapshot.ballCount >= 1 && snapshot.balls[0] && snapshot.balls[0].attached === false);
  });

  const snapshot = await getSnapshot(page);
  expect(snapshot.physicsPaused).toBe(false);
  expect(snapshot.balls[0]?.velocityY).toBeLessThan(0);
});

test("losing the only ball reduces lives", async ({ page }) => {
  await page.evaluate(() => window.__breakoutTestApi?.chooseReward("expand"));
  await page.evaluate(() => window.__breakoutTestApi?.launchPrimaryBall());
  await page.evaluate(() => window.__breakoutTestApi?.forceBallLoss(0));

  await page.waitForFunction(() => {
    const snapshot = window.__breakoutTestApi?.getSnapshot();
    return Boolean(snapshot && snapshot.lives === 2 && snapshot.balls[0]?.attached);
  });

  const snapshot = await getSnapshot(page);
  expect(snapshot.lives).toBe(2);
  expect(snapshot.balls[0]?.attached).toBe(true);
});

test("laser reward spends a charge and removes bricks on tap", async ({ page }) => {
  await page.evaluate(() => window.__breakoutTestApi?.chooseReward("laser"));
  await page.evaluate(() => window.__breakoutTestApi?.launchPrimaryBall());

  const before = await getSnapshot(page);
  expect(before.powerupState?.laserCharges).toBeGreaterThan(0);

  await page.evaluate(() => window.__breakoutTestApi?.fireLaser());

  await page.waitForFunction((brickCount: number) => {
    const snapshot = window.__breakoutTestApi?.getSnapshot();
    return Boolean(
      snapshot &&
        snapshot.powerupState &&
        snapshot.powerupState.laserCharges === 0 &&
        snapshot.activeBrickCount < brickCount,
    );
  }, before.activeBrickCount);

  const after = await getSnapshot(page);
  expect(after.powerupState?.laserCharges).toBe(0);
  expect(after.activeBrickCount).toBeLessThan(before.activeBrickCount);
});

test("multiball reward launches multiple balls together", async ({ page }) => {
  await page.evaluate(() => window.__breakoutTestApi?.chooseReward("multiball"));
  await page.evaluate(() => window.__breakoutTestApi?.launchPrimaryBall());

  await page.waitForFunction(() => {
    const snapshot = window.__breakoutTestApi?.getSnapshot();
    return Boolean(
      snapshot &&
        snapshot.ballCount >= 2 &&
        snapshot.balls.every((ball) => ball.attached === false),
    );
  });

  const snapshot = await getSnapshot(page);
  expect(snapshot.ballCount).toBeGreaterThanOrEqual(2);
  expect(snapshot.balls.filter((ball) => !ball.attached).length).toBeGreaterThanOrEqual(2);
});

test("retry resets run-scoped state", async ({ page }) => {
  await page.evaluate(() => {
    window.__breakoutTestApi?.chooseReward("laser");
    window.__breakoutTestApi?.grantPowerup("expand");
    window.__breakoutTestApi?.launchPrimaryBall();
  });

  for (const lives of [2, 1]) {
    await page.evaluate(() => window.__breakoutTestApi?.forceBallLoss(0));
    await page.waitForFunction(
      expectedLives => {
        const snapshot = window.__breakoutTestApi?.getSnapshot();
        return Boolean(snapshot && snapshot.lives === expectedLives);
      },
      lives,
    );
    await page.evaluate(() => window.__breakoutTestApi?.launchPrimaryBall());
  }

  await page.evaluate(() => window.__breakoutTestApi?.forceBallLoss(0));
  await page.waitForFunction(() => {
    const snapshot = window.__breakoutTestApi?.getSnapshot();
    return Boolean(snapshot && snapshot.runEnding);
  });

  await page.evaluate(() => window.__breakoutTestApi?.retryRun());

  await page.waitForFunction(() => {
    const snapshot = window.__breakoutTestApi?.getSnapshot();
    return Boolean(
      snapshot &&
        snapshot.lives === 3 &&
        snapshot.score === 0 &&
        snapshot.ballCount === 1 &&
        snapshot.balls[0]?.attached &&
        snapshot.powerupState?.laserCharges === 0 &&
        snapshot.powerupState?.expandStacks === 0,
    );
  });

  const snapshot = await getSnapshot(page);
  expect(snapshot.lives).toBe(3);
  expect(snapshot.powerupState?.laserCharges).toBe(0);
  expect(snapshot.powerupState?.expandStacks).toBe(0);
});
