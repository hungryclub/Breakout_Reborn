import { chromium } from '../../../app/node_modules/playwright/index.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const target = path.join(__dirname, 'design-samples.html');

const sections = [
  { id: '.sample-1', out: 'sample-1.png' },
  { id: '.sample-2', out: 'sample-2.png' },
  { id: '.sample-3', out: 'sample-3.png' },
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1660, height: 1940 },
  deviceScaleFactor: 1,
});

await page.goto(`file://${target}`, { waitUntil: 'networkidle' });

for (const section of sections) {
  const locator = page.locator(section.id);
  await locator.screenshot({ path: path.join(__dirname, section.out) });
}

await page.locator('.page').screenshot({
  path: path.join(__dirname, 'sample-contact-sheet.png'),
});

await browser.close();
