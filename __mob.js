const { chromium, devices } = require("playwright");
const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ ...devices["iPhone 13"] });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForTimeout(6000);
  for (const [n, sel, offs] of [["why", "#whyus", [120]], ["rev", "#reviews", [120, 700]]]) {
    const y = await p.evaluate(s => document.querySelector(s).getBoundingClientRect().top + window.scrollY, sel);
    let k=0; for (const off of offs) { await p.evaluate(yy => window.scrollTo(0, yy), y+off); await p.waitForTimeout(1200); await p.screenshot({ path: `${OUT}/m-${n}${k++}.png` }); }
  }
  const info = await p.evaluate(() => ({ voicesVisible: getComputedStyle(document.querySelector(".ax-voices")).display, swiper: !!document.querySelector(".review-swiper-tablet .swiper"), ox: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
  console.log(JSON.stringify(info));
  await b.close();
})();
