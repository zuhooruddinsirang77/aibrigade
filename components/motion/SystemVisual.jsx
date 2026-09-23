"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * The three flagship use cases on the home page, as the systems they are.
 *
 * What stood here was three screenshots of a bond-trading app, inherited
 * from the Webflow fintech template this site was ported from. They were
 * the largest thing in the Evidence section and none of them showed
 * anything the copy beside them described: the card headed "Real-time
 * fraud detection" was illustrated with a screen of UA-prefixed bond
 * listings and YTM percentages. A prospect reading that card and looking
 * at that picture learns that the picture is stock.
 *
 * Each variant here is the system in its own card, running:
 *
 *   stream — Fraud Detection: transactions arriving and being scored,
 *            one referred
 *   call   — InCall: an outbound campaign, each call handled end to end
 *            or transferred to a representative
 *   assist — Axon: a spoken banking request understood, the fields
 *            pulled out of it, the workflow executed
 *
 * `call` and `assist` are the `Split` and `Draft` panels, which were
 * written for two placeholder client case studies (underwriting, a
 * clinical note) and now take their words as data.
 *
 * They are illustrations, not dashboards: each shows what the product's
 * own copy says it does, and the running tallies are there to show the
 * split moving, not to state a result.
 *
 * SSR safety: the first frame is a fixed, hand-written state — no
 * Math.random or Date at module scope — so the server and the client
 * render identical markup. Motion starts on mount and only if motion is
 * welcome; under `prefers-reduced-motion` each panel stays on that first
 * frame, which is a complete, readable picture on its own.
 */

/* ---------------------------------------------------------------- */

const SEED_TXNS = [
  { id: "8f2a41", amt: "2,480.00", score: 12, verdict: "pass" },
  { id: "7c19d0", amt: "18,900.00", score: 31, verdict: "pass" },
  { id: "5e30b7", amt: "940.50", score: 94, verdict: "refer" },
  { id: "2a77fc", amt: "6,215.00", score: 8, verdict: "pass" },
  { id: "9b04e2", amt: "312.75", score: 22, verdict: "pass" },
];

/* A fixed ring of rows rather than random ones: the panel loops, and a
   loop you can't predict reads as noise. These repeat on a cycle the way
   a real monitoring feed does. */
const TXN_RING = [
  { id: "4d81a9", amt: "1,105.00", score: 17, verdict: "pass" },
  { id: "6f22c3", amt: "27,400.00", score: 88, verdict: "refer" },
  { id: "1b90ea", amt: "560.20", score: 6, verdict: "pass" },
  { id: "3c58d4", amt: "9,870.00", score: 41, verdict: "pass" },
  { id: "0e47bb", amt: "4,020.00", score: 73, verdict: "refer" },
  { id: "aa16f8", amt: "780.00", score: 14, verdict: "pass" },
];

function Stream() {
  const [rows, setRows] = useState(SEED_TXNS);
  const cursor = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = setInterval(() => {
      const next = TXN_RING[cursor.current % TXN_RING.length];
      cursor.current += 1;
      // Prefix a fresh key so React animates the entering row rather than
      // re-using the DOM node of the row that just left.
      setRows((r) => [{ ...next, k: `${next.id}-${cursor.current}` }, ...r.slice(0, 4)]);
    }, 1900);
    return () => clearInterval(t);
  }, []);

  const referred = rows.filter((r) => r.verdict === "refer").length;

  return (
    <>
      <div className="ax-sysv__head">
        <span className="ax-sysv__head-label">live scoring</span>
        <span className="ax-sysv__head-stat">
          {referred} referred <i>/ {rows.length}</i>
        </span>
      </div>
      <ul className="ax-sysv__rows">
        {rows.map((r) => (
          <li className="ax-sysv__row" key={r.k || r.id} data-verdict={r.verdict}>
            <span className="ax-sysv__row-id">txn_{r.id}</span>
            <span className="ax-sysv__row-amt">${r.amt}</span>
            <span className="ax-sysv__bar" aria-hidden="true">
              <span className="ax-sysv__bar-fill" style={{ width: `${r.score}%` }} />
            </span>
            <span className="ax-sysv__chip">{r.verdict}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ---------------------------------------------------------------- */

/* A queue splitting two ways — what the system finished on its own, and
   what it handed to a person. Written for underwriting first; the words
   are data now so the same panel can tell InCall's outbound campaign. */
const CALLS = {
  head: "outbound campaign",
  unit: "calls today",
  start: { auto: 21, refer: 4 },
  dest: { auto: "handled on the call", refer: "to a representative" },
  legend: { auto: "handled end to end", refer: "transferred to a person" },
  items: [
    { rule: "call 0412", label: "lead qualified · meeting booked", to: "auto" },
    { rule: "call 0413", label: "asks for a person · transferring", to: "refer" },
    { rule: "call 0414", label: "query answered from verified info", to: "auto" },
    { rule: "call 0415", label: "appointment rescheduled", to: "auto" },
    { rule: "call 0416", label: "complaint · right representative", to: "refer" },
    { rule: "call 0417", label: "support request logged", to: "auto" },
  ],
};

function Split({ config }) {
  const { items, start } = config;
  const [i, setI] = useState(0);
  const [tally, setTally] = useState(start);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = setInterval(() => {
      setI((n) => {
        const next = (n + 1) % items.length;
        setTally((c) => {
          const to = items[next].to;
          const bumped = { ...c, [to]: c[to] + 1 };
          // Reset before the numbers stop looking like a morning's work.
          return bumped.auto + bumped.refer > 60 ? start : bumped;
        });
        return next;
      });
    }, 2100);
    return () => clearInterval(t);
  }, [items, start]);

  const current = items[i];
  const total = tally.auto + tally.refer;
  const autoPct = Math.round((tally.auto / total) * 100);

  return (
    <>
      <div className="ax-sysv__head">
        <span className="ax-sysv__head-label">{config.head}</span>
        <span className="ax-sysv__head-stat">
          {total} <i>{config.unit}</i>
        </span>
      </div>

      <div className="ax-sysv__case" data-to={current.to}>
        <span className="ax-sysv__case-rule">{current.rule}</span>
        <span className="ax-sysv__case-label">{current.label}</span>
        <span className="ax-sysv__case-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="ax-sysv__case-dest">{config.dest[current.to]}</span>
      </div>

      <div className="ax-sysv__split" aria-hidden="true">
        <span className="ax-sysv__split-bar">
          <span className="ax-sysv__split-auto" style={{ width: `${autoPct}%` }} />
        </span>
      </div>
      <div className="ax-sysv__legend">
        <span data-k="auto">
          <b>{tally.auto}</b> {config.legend.auto}
        </span>
        <span data-k="refer">
          <b>{tally.refer}</b> {config.legend.refer}
        </span>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */

/* A request being written out, the structured fields pulled from it
   appearing as the sentence reaches them, then the action. Written for a
   clinical note first; now Axon's voice request, where the "write-back"
   is the supported banking workflow it runs. */
const AXON_REQUEST = {
  head: "voice request",
  busy: "listening",
  done: "executed",
  text: "Pay this month's electricity bill from my current account, then tell me what I spent on groceries.",
  reply: "Done — your electricity bill is paid from your current account. Here is this month's grocery spending.",
  fieldsLabel: "Supported banking workflow",
  fields: [
    { res: "intent", val: "bill payment" },
    { res: "biller", val: "electricity · saved" },
    { res: "from", val: "current account" },
    { res: "then", val: "spending · groceries" },
  ],
};

function Draft({ config }) {
  const { text, fields } = config;
  // First frame is the finished request, so the server and a reduced-motion
  // reader both get the complete picture rather than an empty box.
  const [n, setN] = useState(text.length);
  const [done, setDone] = useState(true);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let i = 0;
    let hold;
    setN(0);
    setDone(false);

    const t = setInterval(() => {
      i += 2;
      if (i < text.length) {
        setN(i);
        return;
      }
      setN(text.length);
      setDone(true);
      clearInterval(t);
      // Hold the finished request on screen, then write it again. Bumping
      // `cycle` is what re-runs this effect — deriving the dependency
      // from `n`/`done` instead would restart the typing on every single
      // character.
      hold = setTimeout(() => setCycle((c) => c + 1), 4200);
    }, 32);

    return () => {
      clearInterval(t);
      clearTimeout(hold);
    };
  }, [cycle, text]);

  // How many fields have been pulled out so far, revealed as the sentence
  // reaches the part each one comes from.
  const shown = Math.floor((n / text.length) * (fields.length + 0.4));

  return (
    <>
      <div className="ax-sysv__head">
        <span className="ax-sysv__head-label">{config.head}</span>
        <span className="ax-sysv__head-stat" data-on={done}>
          {done ? config.done : config.busy}
        </span>
      </div>

      <p className="ax-sysv__note">
        {text.slice(0, n)}
        {n < text.length ? <i className="ax-sysv__caret" aria-hidden="true" /> : null}
      </p>

      {/* The answer back, once the work is done. Always in the layout and
          only faded in, so the card doesn't jump when it arrives. */}
      {config.reply ? (
        <p className="ax-sysv__reply" data-on={done}>
          {config.reply}
        </p>
      ) : null}

      <div className="ax-sysv__fhir">
        <span className="ax-sysv__fhir-label">{config.fieldsLabel}</span>
        <ul>
          {fields.map((f, i) => (
            <li key={f.res} data-on={i < shown}>
              <code>{f.res}</code>
              <span>{f.val}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */

const VARIANTS = {
  stream: {
    Body: Stream,
    chrome: "fraud-detection · live",
    label:
      "A live transaction feed being scored: five transactions with risk scores, one referred for review.",
  },
  call: {
    Body: () => <Split config={CALLS} />,
    chrome: "incall · outbound",
    label:
      "An outbound calling campaign: each call either handled end to end by the voice agent or transferred to a representative.",
  },
  assist: {
    Body: () => <Draft config={AXON_REQUEST} />,
    chrome: "axon · banking assistant",
    label:
      "A customer's spoken banking request being understood: the intent, biller and account pulled out of it, then the payment executed.",
  },
};

export default function SystemVisual({ variant, className = "", ...rest }) {
  const v = VARIANTS[variant];
  if (!v) return null;
  const { Body } = v;

  return (
    <div
      className={`ax-sysv ax-sysv--${variant} ${className}`.trim()}
      role="img"
      aria-label={v.label}
      /* Carries `data-lift` when a case tile puts this on its own plane
         inside a `TiltCard` — see app/immersive.css §3. */
      {...rest}
    >
      <div className="ax-sysv__bar" aria-hidden="true">
        <span className="ax-sysv__dots">
          <i />
          <i />
          <i />
        </span>
        <span className="ax-sysv__chrome">{v.chrome}</span>
        <span className="ax-sysv__live">
          <i />
          live
        </span>
      </div>
      <div className="ax-sysv__body" aria-hidden="true">
        <Body />
      </div>
    </div>
  );
}
