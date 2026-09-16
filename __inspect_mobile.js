const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector(".footer-logo-box", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.evaluate(async () => {
    const step = 400;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
  });
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => {
    const sels = [
      "#footer", ".footer-grid", ".footer-logo-box", ".footer-nav",
      ".footer_navigation_item", ".div-block-7", ".footer-social",
      ".footer-social-grid", ".footer-copy", ".footer-text", ".ax-footer__totop",
    ];
    return sels.map((sel) => {
      const els = document.querySelectorAll(sel);
      return Array.from(els).map((e) => ({
        sel, h: e.getBoundingClientRect().height, cls: e.className.slice(0, 60),
      }));
    }).flat();
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
