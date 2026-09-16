const { chromium } = require("playwright");
const URL = "http://localhost:3210";

async function run(page, label, prep) {
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(7000);
  if (prep) await page.evaluate(prep);
  await page.waitForTimeout(800);
  const r = await page.evaluate(() => new Promise((res) => {
    const f = []; let last = performance.now(); let y = 0;
    window.scrollTo(0, 0);
    const step = () => {
      const now = performance.now(); f.push(now - last); last = now;
      y += 22; window.scrollTo(0, y);
      if (y < 14000) requestAnimationFrame(step);
      else { f.sort((a,b)=>a-b); res({ median: +f[f.length>>1].toFixed(1), p90: +f[Math.floor(f.length*0.9)].toFixed(1) }); }
    };
    requestAnimationFrame(step);
  }));
  console.log(label.padEnd(34), JSON.stringify(r));
}

(async () => {
  const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--ignore-gpu-blocklist"] });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const gpu = await p.evaluate(() => {
    const c = document.createElement("canvas").getContext("webgl");
    const d = c && c.getExtension("WEBGL_debug_renderer_info");
    return d ? c.getParameter(d.UNMASKED_RENDERER_WEBGL) : "n/a";
  }).catch(() => "n/a");
  await run(p, "everything on", null);
  await run(p, "minus WebGL canvases", () => { document.querySelectorAll("canvas").forEach(c => c.remove()); });
  await run(p, "minus WebGL + all <video>", () => {
    document.querySelectorAll("canvas").forEach(c => c.remove());
    document.querySelectorAll("video").forEach(v => { v.pause(); v.remove(); });
  });
  console.log("renderer:", gpu);
  await b.close();
})();
