const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForTimeout(6000);
  const y = await p.evaluate(() => document.querySelector("#whyus").getBoundingClientRect().top + window.scrollY);
  await p.evaluate(yy => window.scrollTo(0, yy + 300), y);
  await p.waitForTimeout(1500);
  console.log(JSON.stringify(await p.evaluate(() => {
    const sec = document.querySelector(".padding-section-whyus");
    const rows = [...sec.children].map(e => { const r = e.getBoundingClientRect(); const c = getComputedStyle(e); return {cls: e.className.slice(0,40), t: Math.round(r.top), h: Math.round(r.height), flex: c.flex, mt: c.marginTop, mb: c.marginBottom}; });
    const cs = getComputedStyle(sec);
    const par = getComputedStyle(sec.parentElement);
    const gp = getComputedStyle(sec.parentElement.parentElement);
    return { sec: {h: Math.round(sec.getBoundingClientRect().height), d: cs.display, pt: cs.paddingTop, pb: cs.paddingBottom, flex: cs.flex},
             container: {d: par.display, flex: par.flex, h: Math.round(sec.parentElement.getBoundingClientRect().height)},
             padglobal: {d: gp.display, flex: gp.flex, h: Math.round(sec.parentElement.parentElement.getBoundingClientRect().height)},
             sticky: (()=>{const s=getComputedStyle(document.querySelector(".horizontal-sticky"));return {d:s.display,ai:s.alignItems,h:s.height,pt:s.paddingTop};})(),
             rows };
  }), null, 1));
  await b.close();
})();
