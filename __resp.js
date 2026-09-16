const { chromium, devices } = require("playwright");
const OUT = process.argv[2];
async function shots(ctx, label, opts = {}) {
  const p = await ctx.newPage();
  const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForTimeout(6000);
  const info = await p.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    caps: document.querySelectorAll(".ax-cap").length,
    stage: !!document.querySelector(".ax-caps__frame"),
    voices: document.querySelectorAll(".ax-voices__set .ax-voice").length,
    spine: !!document.querySelector(".ax-voices__spine"),
  }));
  console.log(label.padEnd(16), JSON.stringify(info), "errs", errs.length);
  for (const [n, sel, off] of [["why", "#whyus", 380], ["rev", "#reviews", 520]]) {
    const y = await p.evaluate(s => document.querySelector(s).getBoundingClientRect().top + window.scrollY, sel);
    await p.evaluate(yy => window.scrollTo(0, yy), y + off);
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `${OUT}/${label}-${n}.png` });
  }
  await p.close();
}
(async () => {
  const b = await chromium.launch({ headless: false, args: ["--enable-gpu"] });
  await shots(await b.newContext({ viewport: { width: 820, height: 1180 } }), "tablet");
  await shots(await b.newContext({ ...devices["iPhone 13"] }), "phone");
  await shots(await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }), "reduced");
  await b.close();
})();
