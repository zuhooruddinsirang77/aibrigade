const { chromium, devices } = require("playwright");
async function settle(p){let l=-1;for(let i=0;i<16;i++){const h=await p.evaluate(()=>document.body.scrollHeight);if(h===l)break;l=h;await p.waitForTimeout(800);}}
async function run(b,label,opts){
  const ctx=await b.newContext(opts); const p=await ctx.newPage();
  const errs=[]; p.on("pageerror",e=>errs.push("PE:"+e.message.slice(0,120)));
  p.on("console",m=>{const t=m.text(); if(m.type()==="error"&&!/404|Failed to load resource/.test(t)) errs.push("C:"+t.slice(0,120));});
  const bad=[]; p.on("response",r=>{if(r.status()>=400) bad.push(r.status()+" "+r.url().split("/").pop());});
  await p.goto("http://localhost:3000",{waitUntil:"domcontentloaded",timeout:120000});
  await settle(p);
  const y=await p.evaluate(()=>document.querySelector("#reels").getBoundingClientRect().top+window.scrollY);
  const from=await p.evaluate(()=>window.scrollY);
  for(let k=1;k<=18;k++){await p.evaluate(v=>window.scrollTo(0,v),from+((y+60)-from)*(k/18));await p.waitForTimeout(140);}
  await p.waitForTimeout(3000);
  const o=await p.evaluate(()=>{
    const v=document.querySelector(".ax-prog__plate:not(.ax-prog__plate--out)");
    const els=["#whyus .horizontal-list",".ax-voices__stage, .review-swiper-tablet",".ax-prog"];
    return { ox:document.documentElement.scrollWidth-document.documentElement.clientWidth,
             playing:v&&!v.paused, picks:document.querySelectorAll(".ax-prog__pick").length,
             beats:document.querySelectorAll(".ax-prog__beat").length,
             otherSectionsOk: els.every(s=>document.querySelector(s)),
             sections: document.querySelectorAll("#whyus,#reviews,#reels,#cases,#services,#features").length };
  });
  console.log(label.padEnd(8), JSON.stringify(o), "errs", errs.length, errs.slice(0,2).join("|"), "4xx", bad.length, bad.slice(0,2).join("|"));
  await ctx.close();
}
(async()=>{const b=await chromium.launch({headless:true});
  await run(b,"1440",{viewport:{width:1440,height:900}});
  await run(b,"1920",{viewport:{width:1920,height:1080}});
  await run(b,"1100",{viewport:{width:1100,height:800}});
  await run(b,"tablet",{viewport:{width:820,height:1180}});
  await run(b,"phone",{...devices["iPhone 13"]});
  await run(b,"reduced",{viewport:{width:1440,height:900},reducedMotion:"reduce"});
  await b.close();})();
