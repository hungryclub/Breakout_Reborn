import { chromium } from '../../../app/node_modules/playwright/index.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = `file://${path.join(__dirname, 'design-samples.html')}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 960 }, deviceScaleFactor: 2 });
await page.goto(htmlPath, { waitUntil: 'networkidle' });

for (let i = 1; i <= 5; i++) {
  const card = page.locator(`#sample-${i}`);
  await card.screenshot({ path: path.join(__dirname, `sample-${i}.png`) });
}

await page.setViewportSize({ width: 1800, height: 6200 });
await page.goto(htmlPath, { waitUntil: 'networkidle' });
await page.screenshot({ path: path.join(__dirname, 'sample-contact-sheet.png'), fullPage: true });

await browser.close();
