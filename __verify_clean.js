const { chromium } = require('playwright');
const BASE = 'http://localhost:3000';
const PAGES = ['/', '/contact', '/halyk', '/icu', '/uub', '/privacy-policy', '/terms-of-use'];

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const fails = [];
  p.on('response', (res) => {
    if (res.status() >= 400) fails.push(`${res.status()} ${res.url()}`);
  });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
  const consoleErrs = [];
  p.on('console', (msg) => { if (msg.type() === 'error') consoleErrs.push(msg.text().slice(0, 200)); });

  for (const path of PAGES) {
    console.log(`\n=== ${path} ===`);
    await p.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 });
    await p.waitForTimeout(2500);
    await p.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); }
      window.scrollTo(0, 0);
    });
    await p.waitForTimeout(1000);
  }

  console.log('\n\n===== NETWORK FAILURES (4xx/5xx) =====');
  console.log(fails.length ? [...new Set(fails)].join('\n') : 'NONE ✅');
  console.log('\n===== PAGE ERRORS =====');
  console.log(errs.length ? [...new Set(errs)].join('\n') : 'NONE ✅');
  console.log('\n===== CONSOLE ERRORS =====');
  console.log(consoleErrs.length ? [...new Set(consoleErrs)].join('\n') : 'NONE ✅');

  await b.close();
})();
