const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const msgs = [];
  p.on("console", m => { if (m.type() === "error" || m.type() === "warning") msgs.push(m.type() + ": " + m.text().slice(0, 400)); });
  p.on("pageerror", e => msgs.push("PAGEERROR: " + e.message.slice(0,400)));
  await p.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForTimeout(7000);
  const y = await p.evaluate(() => document.querySelector("#reviews").getBoundingClientRect().top + window.scrollY);
  await p.evaluate(yy => window.scrollTo(0, yy), y);
  await p.waitForTimeout(2000);
  console.log(msgs.join("\n----\n") || "CLEAN");
  await b.close();
})();
