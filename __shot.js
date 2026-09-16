const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector(".footer-logo-box", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);
  const footer = await page.$("#footer");
  await footer.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await footer.screenshot({ path: process.argv[2] || "footer.png" });
  console.log("SAVED");
  await browser.close();
})();
