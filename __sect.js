const { chromium } = require("playwright");
const OUT = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(6000);
  const shots = [
    ["cases", "#cases"],
    ["seam", ".ax-seam"],
    ["features", "#features"],
    ["ctadark", "#ctadark"],
  ];
  for (const [name, sel] of shots) {
    const el = await page.$(sel);
    if (!el) { console.log("missing", sel); continue; }
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${OUT}/${name}.png` });
  }
  // hover a case media tile to capture the tilt + glare
  const tile = await page.$(".cases_item.bg-1");
  await tile.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  const box = await tile.boundingBox();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/tilt.png` });
  console.log("done");
  await browser.close();
})();
