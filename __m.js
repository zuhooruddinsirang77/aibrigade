const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForTimeout(6000);
  const y = await p.evaluate(() => document.querySelector("#whyus").getBoundingClientRect().top + window.scrollY);
  await p.evaluate(yy => window.scrollTo(0, yy + 300), y);
  await p.waitForTimeout(1500);
  const out = await p.evaluate(() => {
    const g = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return {t: Math.round(r.top), b: Math.round(r.bottom), h: Math.round(r.height), w: Math.round(r.width)}; };
    const item = document.querySelector(".whyus-box_item");
    const cs = item && getComputedStyle(item);
    const inner = document.querySelector(".whyus_item");
    const ics = inner && getComputedStyle(inner);
    return {
      sticky: g(".horizontal-sticky"),
      pad: g(".padding-section-whyus"),
      head: g("#whyus ._3-columns-grid"),
      wrap: g(".horizontal-list-wrapper"),
      list: g(".horizontal-list"),
      item: g(".whyus-box_item"),
      inner: g(".whyus_item"),
      sliderRow: g(".whyus-slider-row"),
      itemCss: cs && {w: cs.width, h: cs.height, pad: cs.padding, mr: cs.marginRight},
      innerCss: ics && {p: ics.padding, bg: ics.backgroundColor, br: ics.borderRadius, mh: ics.minHeight, gap: ics.gap},
      listCss: (()=>{const l=getComputedStyle(document.querySelector(".horizontal-list"));return {d:l.display,gap:l.gap,g2:l.columnGap};})(),
      vh: window.innerHeight,
      scrollW: document.querySelector(".horizontal-list").scrollWidth,
      clientW: document.querySelector(".horizontal-list-wrapper").clientWidth,
    };
  });
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
