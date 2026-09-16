const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3210", { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForTimeout(7000);
  const res = await p.evaluate(() => new Promise((res) => {
    const frames = [];
    let last = performance.now();
    let y = 0;
    const step = () => {
      const now = performance.now();
      frames.push(now - last);
      last = now;
      y += 22;
      window.scrollTo(0, y);
      if (y < 14000) requestAnimationFrame(step);
      else {
        frames.sort((a, b) => a - b);
        const pct = (q) => frames[Math.floor(frames.length * q)];
        res({
          n: frames.length,
          median: +pct(0.5).toFixed(1),
          p90: +pct(0.9).toFixed(1),
          p99: +pct(0.99).toFixed(1),
          worst: +frames[frames.length - 1].toFixed(1),
          over33: frames.filter(f => f > 33).length,
        });
      }
    };
    requestAnimationFrame(step);
  }));
  console.log("SCROLL FRAME TIMES (ms):", JSON.stringify(res));
  const mem = await p.evaluate(() => performance.memory ? Math.round(performance.memory.usedJSHeapSize/1048576) : null);
  console.log("JS heap MB:", mem);
  await b.close();
})();
