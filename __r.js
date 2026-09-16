const { chromium } = require("playwright");
const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch({ headless: false, args: ["--enable-gpu"] });
  const p = await b.newPage({ viewport: { width: 1600, height: 950 } });
  const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForTimeout(6500);
  const y = await p.evaluate(() => document.querySelector("#reviews").getBoundingClientRect().top + window.scrollY);
  for (let k = 0; k < 4; k++) {
    await p.evaluate(yy => window.scrollTo(0, yy), y + k * 680);
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `${OUT}/r${k}.png` });
  }
  const st = await p.evaluate(() => {
    const f = document.querySelector(".ax-voices__spine-fill");
    return { spine: getComputedStyle(f).transform, voices: document.querySelectorAll(".ax-voices__set .ax-voice").length };
  });
  console.log(JSON.stringify(st), "errs", errs.length, JSON.stringify(errs.slice(0,2)));
  await b.close();
})();
