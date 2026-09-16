const { chromium } = require("playwright");
const OUT = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(6000);
  for (const [name, sel, frac] of [["env-enter", "#environments", 0.72], ["reels-enter", "#reels", 0.72], ["cta-enter", "#ctadark", 0.72]]) {
    const y = await page.evaluate(({ sel, frac }) => {
      const r = document.querySelector(sel).getBoundingClientRect();
      return window.scrollY + r.top - window.innerHeight * frac;
    }, { sel, frac });
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    const cp = await page.evaluate((s) => getComputedStyle(document.querySelector(s)).clipPath, sel);
    console.log(name, "clip:", cp);
  }
  await browser.close();
})();
