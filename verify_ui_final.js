const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'verification/submission_check.png', fullPage: true });
    console.log('Screenshot saved');
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
