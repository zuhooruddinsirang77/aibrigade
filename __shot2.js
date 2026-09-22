const { chromium } = require("playwright");

const out = process.argv[2];
const width = Number(process.env.W) || 1440;
const height = Number(process.env.H) || 900;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

  for (const t of process.argv.slice(3)) {
    const [route, name] = t.split("|");
    await page.goto("http://localhost:3111/" + route.replace(/^\/+/, ""), {
      waitUntil: "networkidle",
      timeout: 90000,
    });
    await page.waitForTimeout(2500);
    await page.evaluate(() => document.getElementById("footer")?.scrollIntoView({ block: "end" }));
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `${out}/${name}.png` });
    console.log("SAVED", name);
  }
  console.log(errors.length ? errors.join("\n") : "no page errors");
  await browser.close();
})();
