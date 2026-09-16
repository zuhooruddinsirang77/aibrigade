const { chromium } = require("playwright");
const fs = require("fs");
const OUT = process.argv[2] || ".";
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const errs = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  page.on("pageerror", (e) => errs.push("PAGEERROR: " + e.message));
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(6000);
  const h = await page.evaluate(() => document.body.scrollHeight);
  console.log("pageHeight", h);
  const vh = 900;
  let i = 0;
  for (let y = 0; y < h && i < 22; y += vh) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/s${String(i).padStart(2,"0")}.png` });
    i++;
  }
  console.log("ERRORS:", JSON.stringify(errs.slice(0, 20), null, 1));
  await browser.close();
})();
