import { expect, test, type Page } from "@playwright/test";

async function getLayoutMetrics(page: Page) {
  await page.goto("/");
  await page.waitForFunction(() => typeof window.__breakoutTestApi !== "undefined");
  await page.waitForFunction(() => {
    const layout = window.__breakoutTestApi?.getMenuLayout?.() ?? null;
    return Boolean(layout && layout.contentBottom > 0);
  });

  const menuLayout = await page.evaluate(() => window.__breakoutTestApi?.getMenuLayout?.() ?? null);

  const layout = await page.evaluate(() => {
    const visualViewport = window.visualViewport;
    const rectOf = (selector: string) => {
      const node = document.querySelector<HTMLElement>(selector);
      if (!node) {
        return null;
      }

      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
        paddingTop: style.paddingTop,
        paddingRight: style.paddingRight,
        paddingBottom: style.paddingBottom,
        paddingLeft: style.paddingLeft,
      };
    };

    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      visualViewportWidth: visualViewport?.width ?? null,
      visualViewportHeight: visualViewport?.height ?? null,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      app: rectOf("#app"),
      shell: rectOf(".app-shell"),
      frame: rectOf(".app-shell__frame"),
      badge: rectOf(".app-shell__badge"),
      stage: rectOf(".app-shell__stage"),
      mount: rectOf(".app-shell__game-mount"),
      canvas: rectOf("canvas"),
    };
  });

  return {
    ...layout,
    menuLayout,
  };
}

test("desktop layout stays inside viewport without scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  const layout = await getLayoutMetrics(page);
  const tolerance = 1;
  const desktopPadding = 24;

  expect(layout.scrollWidth).toBe(layout.innerWidth);
  expect(layout.scrollHeight).toBe(layout.innerHeight);
  expect(layout.app).toMatchObject({
    paddingTop: "24px",
    paddingRight: "24px",
    paddingBottom: "24px",
    paddingLeft: "24px",
  });
  expect(layout.frame?.width ?? 0).toBeGreaterThan(600);
  expect(layout.frame?.height ?? 0).toBeGreaterThan(900);
  expect(layout.shell?.x ?? 0).toBeGreaterThanOrEqual(desktopPadding - tolerance);
  expect(layout.shell?.y ?? 0).toBeGreaterThanOrEqual(desktopPadding - tolerance);
  expect(layout.shell?.right ?? 0).toBeLessThanOrEqual(layout.innerWidth - desktopPadding + tolerance);
  expect(layout.shell?.bottom ?? 0).toBeLessThanOrEqual(layout.innerHeight - desktopPadding + tolerance);
  const desktopCanvasLeftInset = (layout.canvas?.x ?? 0) - (layout.stage?.x ?? 0);
  const desktopCanvasRightInset = (layout.stage?.right ?? 0) - (layout.canvas?.right ?? 0);
  expect(Math.abs(desktopCanvasLeftInset - desktopCanvasRightInset)).toBeLessThanOrEqual(1.5);
  expect(layout.menuLayout?.contentBottom ?? 0).toBeGreaterThanOrEqual(1450);
});

test.describe("mobile", () => {
  test.use({
    viewport: { width: 390, height: 664 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  });

  test("mobile layout keeps padding, avoids clipping, and fits to the maximum available viewport", async ({ page }) => {
  const layout = await getLayoutMetrics(page);
  const tolerance = 1;
  const mobilePadding = 12;
  const rightInset = layout.innerWidth - (layout.shell?.right ?? 0);
  const bottomInset = layout.innerHeight - (layout.shell?.bottom ?? 0);

    expect(layout.app).toMatchObject({
      paddingTop: "12px",
      paddingRight: "12px",
      paddingBottom: "12px",
      paddingLeft: "12px",
    });
    expect(layout.scrollWidth).toBe(layout.innerWidth);
    expect(layout.scrollHeight).toBe(layout.innerHeight);
    expect(layout.shell?.x ?? 0).toBeGreaterThanOrEqual(mobilePadding - tolerance);
    expect(layout.shell?.y ?? 0).toBeGreaterThanOrEqual(mobilePadding - tolerance);
    expect(layout.shell?.right ?? 0).toBeLessThanOrEqual(layout.innerWidth - mobilePadding + tolerance);
    expect(layout.shell?.bottom ?? 0).toBeLessThanOrEqual(layout.innerHeight - mobilePadding + tolerance);
    expect(layout.frame?.width ?? 0).toBeGreaterThan(layout.innerWidth * 0.88);
    expect(layout.shell?.height ?? 0).toBeGreaterThanOrEqual(layout.innerHeight - mobilePadding * 2 - 2);
    expect(
      Math.min(
        Math.abs(rightInset - mobilePadding),
        Math.abs(bottomInset - mobilePadding),
      ),
    ).toBeLessThanOrEqual(tolerance);
    expect(layout.badge?.right ?? 0).toBeLessThanOrEqual((layout.frame?.right ?? 0) - mobilePadding + tolerance);
    expect(layout.badge?.width ?? 0).toBeGreaterThan(60);
    expect((layout.mount?.width ?? 0) / (layout.stage?.width ?? 1)).toBeGreaterThanOrEqual(0.995);
    expect((layout.canvas?.width ?? 0) / (layout.stage?.width ?? 1)).toBeGreaterThanOrEqual(0.995);
    expect(layout.menuLayout?.isMobile).toBe(true);
    expect(layout.menuLayout?.contentBottom ?? 0).toBeGreaterThanOrEqual(1780);
    const mobileContentCenter = ((layout.menuLayout?.contentTop ?? 0) + (layout.menuLayout?.contentBottom ?? 0)) / 2;
    expect(Math.abs(mobileContentCenter - (layout.menuLayout?.backdropCenterY ?? 0))).toBeLessThanOrEqual(24);
    expect(
      Math.abs((layout.menuLayout?.backdropCenterY ?? 0) - ((layout.menuLayout?.gameHeight ?? 0) / 2)),
    ).toBeLessThanOrEqual(24);
  });

  test("mobile tall viewport still uses the full available height", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const layout = await getLayoutMetrics(page);
    const mobilePadding = 12;
    const availableHeight = layout.innerHeight - mobilePadding * 2;

    expect(layout.app).toMatchObject({
      paddingTop: "12px",
      paddingRight: "12px",
      paddingBottom: "12px",
      paddingLeft: "12px",
    });
    expect(layout.shell?.height ?? 0).toBeGreaterThanOrEqual(availableHeight - 1);
    expect(layout.shell?.bottom ?? 0).toBeGreaterThanOrEqual(layout.innerHeight - mobilePadding - 1);
    expect(layout.shell?.bottom ?? 0).toBeLessThanOrEqual(layout.innerHeight - mobilePadding + 1);
    expect((layout.mount?.width ?? 0) / (layout.stage?.width ?? 1)).toBeGreaterThanOrEqual(0.995);
    expect((layout.canvas?.width ?? 0) / (layout.stage?.width ?? 1)).toBeGreaterThanOrEqual(0.995);
    expect((layout.canvas?.height ?? 0)).toBeLessThanOrEqual((layout.stage?.height ?? 0) + 1);
    const mobileContentCenter = ((layout.menuLayout?.contentTop ?? 0) + (layout.menuLayout?.contentBottom ?? 0)) / 2;
    expect(Math.abs(mobileContentCenter - (layout.menuLayout?.backdropCenterY ?? 0))).toBeLessThanOrEqual(24);
    expect(
      Math.abs((layout.menuLayout?.backdropCenterY ?? 0) - ((layout.menuLayout?.gameHeight ?? 0) / 2)),
    ).toBeLessThanOrEqual(24);
  });

  test("mobile wide-tall viewport still stays pinned to the padded bounds", async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 });
    const layout = await getLayoutMetrics(page);
    const mobilePadding = 12;
    const availableHeight = layout.innerHeight - mobilePadding * 2;

    expect(layout.shell?.height ?? 0).toBeGreaterThanOrEqual(availableHeight - 1);
    expect(layout.shell?.bottom ?? 0).toBeGreaterThanOrEqual(layout.innerHeight - mobilePadding - 1);
    expect(layout.shell?.bottom ?? 0).toBeLessThanOrEqual(layout.innerHeight - mobilePadding + 1);
    expect(layout.shell?.x ?? 0).toBeGreaterThanOrEqual(mobilePadding - 1);
    expect(layout.shell?.right ?? 0).toBeLessThanOrEqual(layout.innerWidth - mobilePadding + 1);
    expect((layout.mount?.width ?? 0) / (layout.stage?.width ?? 1)).toBeGreaterThanOrEqual(0.995);
    expect((layout.canvas?.width ?? 0) / (layout.stage?.width ?? 1)).toBeGreaterThanOrEqual(0.995);
    expect((layout.canvas?.height ?? 0)).toBeLessThanOrEqual((layout.stage?.height ?? 0) + 1);
    const mobileContentCenter = ((layout.menuLayout?.contentTop ?? 0) + (layout.menuLayout?.contentBottom ?? 0)) / 2;
    expect(Math.abs(mobileContentCenter - (layout.menuLayout?.backdropCenterY ?? 0))).toBeLessThanOrEqual(24);
    expect(
      Math.abs((layout.menuLayout?.backdropCenterY ?? 0) - ((layout.menuLayout?.gameHeight ?? 0) / 2)),
    ).toBeLessThanOrEqual(24);
  });
});
