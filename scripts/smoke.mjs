/**
 * Smoke test for the GASEWE Portfolio.
 * Verifies: h1Count=1, canvasCount ≤ 9, consoleErrors=0, scrollHeight at 1440px (informational).
 */

import { chromium } from 'playwright';

async function runSmoke() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const PORT = process.env.PORT || 5176;
await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });

  // Wait a bit for all animations to settle
  await page.waitForTimeout(1000);

  // Check h1 count
  const h1Count = await page.locator('h1').count();

  // Check canvas count
  const canvasCount = await page.locator('canvas').count();

  // Check scroll height
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);

  // Check for React remnants
  const reactElements = await page.locator('[data-reactroot], #root').count();

  await browser.close();

  console.log(`h1Count=${h1Count}`);
  console.log(`canvasCount=${canvasCount}`);
  console.log(`scrollHeight=${scrollHeight}`);
  console.log(`consoleErrors=${consoleErrors.length}`);
  console.log(`reactElements=${reactElements}`);

  if (consoleErrors.length > 0) {
    console.log('Console errors:');
    consoleErrors.forEach(e => console.log('  - ' + e));
  }

  // Verify acceptance criteria
  let passed = true;
  if (h1Count !== 1) {
    console.log('FAIL: Expected exactly 1 h1');
    passed = false;
  }
  if (canvasCount > 9) {
    console.log('FAIL: Expected ≤ 9 canvases (3 live + 1 idle trail canvas per project card)');
    passed = false;
  }
  if (consoleErrors.length > 0) {
    console.log('FAIL: Console errors found');
    passed = false;
  }
  if (reactElements > 0) {
    console.log('FAIL: React elements found');
    passed = false;
  }

  if (passed) {
    console.log('SMOKE TEST PASSED');
    process.exit(0);
  } else {
    console.log('SMOKE TEST FAILED');
    process.exit(1);
  }
}

runSmoke().catch(err => {
  console.error('Smoke test crashed:', err);
  process.exit(1);
});