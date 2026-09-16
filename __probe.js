const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const bad = [];
  const errs = [];
  page.on("response", (r) => { if (r.status() >= 400) bad.push(r.status() + " " + r.url()); });
  page.on("pageerror", (e) => errs.push("PAGEERROR: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(7000);
  // smooth-scroll sanity: dispatch wheel and see if scrollY eases rather than jumps
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.move(700, 450);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(80);
  const mid = await page.evaluate(() => window.scrollY);
  await page.waitForTimeout(1200);
  const after = await page.evaluate(() => window.scrollY);
  const flags = await page.evaluate(() => ({
    smooth: document.documentElement.classList.contains("ax-smooth"),
    motion: document.documentElement.classList.contains("ax-motion"),
    nomotion: document.documentElement.classList.contains("ax-nomotion"),
    depthCanvas: !!document.querySelector(".ax-depth canvas"),
    cue: !!document.querySelector(".ax-cue"),
    intro: document.querySelector(".ax-intro")?.dataset.done,
  }));
  console.log("scrollY before/mid/after:", before, mid, after);
  console.log("flags:", JSON.stringify(flags));
  console.log("BAD:", JSON.stringify([...new Set(bad)], null, 1));
  console.log("ERRS:", JSON.stringify([...new Set(errs)].slice(0,10), null, 1));
  await browser.close();
})();
