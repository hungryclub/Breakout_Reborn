import { chromium } from "../../../app/node_modules/playwright/index.mjs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.join(__dirname, "design-samples.html");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 980, height: 1520 },
  deviceScaleFactor: 1.5,
});

await page.goto(pathToFileURL(htmlPath).href);
await page.setViewportSize({ width: 980, height: 1520 });

const sampleIds = [
  "sample-1",
  "sample-2",
  "sample-3",
  "sample-4",
  "sample-5",
];

for (const sampleId of sampleIds) {
  const locator = page.locator(`#${sampleId}`);
  await locator.screenshot({
    path: path.join(__dirname, `${sampleId}.png`),
  });
}

await page.locator(".page").screenshot({
  path: path.join(__dirname, "sample-contact-sheet.png"),
});

await browser.close();
