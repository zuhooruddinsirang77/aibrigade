const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const bad = [];
  p.on("response", r => { if (r.status() >= 400) bad.push(r.status() + " " + r.url()); });
  await p.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForTimeout(6000);
  const y = await p.evaluate(() => document.querySelector("#reviews").getBoundingClientRect().top + window.scrollY);
  await p.evaluate(yy => window.scrollTo(0, yy), y);
  await p.waitForTimeout(2500);
  console.log(bad.join("\n") || "NO 4xx");
  await b.close();
})();
