const { chromium } = require("playwright");
const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForTimeout(7000);
  for (const [n, sel, offs] of [["why", "#whyus", [200, 700, 1200]], ["rev", "#reviews", [0, 600, 1200]]]) {
    const y = await p.evaluate(s => document.querySelector(s).getBoundingClientRect().top + window.scrollY, sel);
    let k = 0;
    for (const off of offs) {
      await p.evaluate(yy => window.scrollTo(0, yy), y + off);
      await p.waitForTimeout(1600);
      await p.screenshot({ path: `${OUT}/${n}${k}.png` });
      k++;
    }
  }
  console.log("errs", errs.length, JSON.stringify(errs.slice(0,3)));
  await b.close();
})();
