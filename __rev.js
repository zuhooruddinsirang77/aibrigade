const { chromium } = require("playwright");
const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on("pageerror", e => errs.push(e.message));
  p.on("console", m => { if (m.type()==="error" && !m.text().includes("404")) errs.push("C:"+m.text().slice(0,200)); });
  await p.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForTimeout(6500);
  const y = await p.evaluate(() => document.querySelector("#reviews").getBoundingClientRect().top + window.scrollY);
  await p.evaluate(yy => window.scrollTo(0, yy + 120), y);
  await p.waitForTimeout(1800);
  await p.screenshot({ path: `${OUT}/stage-a.png` });
  // pick a short quote (Paul Larsen, index 2)
  await p.click('#ax-voice-tab-2');
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${OUT}/stage-b.png` });
  await p.click('#ax-voice-tab-4');
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${OUT}/stage-c.png` });
  const st = await p.evaluate(() => {
    const panel = document.querySelector(".ax-voices__panel").getBoundingClientRect();
    const idx = document.querySelector(".ax-voices__index").getBoundingClientRect();
    const on = document.querySelector(".ax-voice--on");
    return { panelH: Math.round(panel.height), idxH: Math.round(idx.height),
             onId: on && on.id, tabs: document.querySelectorAll(".ax-voices__tab").length,
             spine: getComputedStyle(document.querySelector(".ax-voices__spine-fill")).transform };
  });
  console.log(JSON.stringify(st), "errs", errs.length, JSON.stringify(errs.slice(0,3)));
  await b.close();
})();
