const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('#reels', { timeout: 30000 });

  const total = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < total; y += 300) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(25);
  }

  const top = await page.evaluate(() => document.getElementById('reels').getBoundingClientRect().top + window.scrollY);
  const bottom = await page.evaluate(() => {
    const r = document.getElementById('reels').getBoundingClientRect();
    return r.bottom + window.scrollY;
  });

  let y = top - 20;
  let i = 0;
  while (y < bottom + 200) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(1400);
    await page.screenshot({ path: `C:/Users/zuhoor/AppData/Local/Temp/claude/d--aibrigaderevamp/827bff9d-e6ca-46a7-b86f-b0d4a0689000/scratchpad/full-${i}.png` });
    y += 850;
    i += 1;
  }

  await browser.close();
})();
