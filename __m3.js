const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForTimeout(6000);
  const y = await p.evaluate(() => document.querySelector("#whyus").getBoundingClientRect().top + window.scrollY);
  await p.evaluate(yy => window.scrollTo(0, yy + 300), y);
  await p.waitForTimeout(1500);
  console.log(JSON.stringify(await p.evaluate(() => {
    const r = document.querySelector(".ax-rail");
    const c = getComputedStyle(r);
    const sr = document.querySelector(".whyus-slider-row");
    const src = getComputedStyle(sr);
    return { rail: {pos: c.position, order: c.order, top: c.top, bottom: c.bottom, d: c.display, transform: c.transform, w: c.width, h: c.height, inset: c.inset},
             rect: r.getBoundingClientRect().toJSON(),
             slider: {pos: src.position, d: src.display, mt: src.marginTop, h: src.height, flex: src.flex},
             sliderRect: sr.getBoundingClientRect().toJSON() };
  }), null, 1));
  await b.close();
})();
