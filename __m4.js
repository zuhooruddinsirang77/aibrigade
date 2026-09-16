const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForTimeout(6000);
  const y = await p.evaluate(() => document.querySelector("#whyus").getBoundingClientRect().top + window.scrollY);
  await p.evaluate(yy => window.scrollTo(0, yy + 300), y);
  await p.waitForTimeout(1200);
  console.log(JSON.stringify(await p.evaluate(() => {
    const pick = (el, keys) => Object.fromEntries(keys.map(k => [k, getComputedStyle(el)[k]]));
    const sec = document.querySelector(".padding-section-whyus");
    const w = document.querySelector(".horizontal-list-wrapper");
    const l = document.querySelector(".horizontal-list");
    const it = document.querySelector(".whyus-box_item");
    const K = ["display","flexDirection","flexGrow","flexShrink","flexBasis","height","maxHeight","minHeight","boxSizing","alignItems","alignSelf","justifyContent","paddingTop","paddingBottom","overflow"];
    return { sec: pick(sec, K), wrap: pick(w, K), list: pick(l, K), item: pick(it, K),
             secH: sec.getBoundingClientRect().height, wrapH: w.getBoundingClientRect().height, listH: l.getBoundingClientRect().height };
  }), null, 1));
  await b.close();
})();
