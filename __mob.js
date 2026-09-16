const { chromium, devices } = require("playwright");
const OUT = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices["iPhone 13"] });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push("PAGEERROR: " + e.message));
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(6000);
  const info = await page.evaluate(() => ({
    smooth: document.documentElement.classList.contains("ax-smooth"),
    depth: !!document.querySelector(".ax-depth canvas"),
    cueVisible: getComputedStyle(document.querySelector(".ax-cue")).display,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    height: document.body.scrollHeight,
  }));
  console.log("mobile:", JSON.stringify(info));
  const h = info.height, vh = 844;
  let i = 0;
  for (let y = 0; y < h && i < 18; y += vh) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/m${String(i).padStart(2,"0")}.png` });
    i++;
  }
  console.log("ERRS:", JSON.stringify(errs.slice(0,5)));
  await browser.close();
})();
