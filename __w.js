const { chromium } = require("playwright");
const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch({ headless: false, args: ["--enable-gpu"] });
  const p = await b.newPage({ viewport: { width: 1600, height: 950 } });
  const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForTimeout(6500);
  const y = await p.evaluate(() => document.querySelector("#whyus").getBoundingClientRect().top + window.scrollY);
  for (let k = 0; k < 3; k++) {
    await p.evaluate(yy => window.scrollTo(0, yy), y + k * 620);
    await p.waitForTimeout(1600);
    await p.screenshot({ path: `${OUT}/w${k}.png` });
    const st = await p.evaluate(() => {
      const on = document.querySelector('.ax-cap[data-on="true"]');
      return { active: on?.querySelector(".ax-cap__title span")?.textContent,
               films: document.querySelectorAll(".ax-caps__film").length,
               onFilm: document.querySelectorAll('.ax-caps__film[data-on="true"]').length };
    });
    console.log("k=" + k, JSON.stringify(st));
  }
  console.log("errs", errs.length, JSON.stringify(errs.slice(0,2)));
  await b.close();
})();
