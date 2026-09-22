/**
 * Transaction risk scoring — the engine behind the "Fraud Decision" demo.
 *
 * SERVER ONLY. The `_engines` folder is a Next private folder (the leading
 * underscore keeps it out of the router), and nothing outside
 * app/api/demos/route.js imports it, so none of this reaches the browser.
 * That is deliberate for the demo as much as for the code: the point being
 * demonstrated is that the model and the policy live behind an API, and the
 * client only ever sees a decision and its reasons.
 *
 * WHAT THIS ACTUALLY IS, stated plainly because the UI states it too: a
 * transparent additive risk model — a scorecard. Each feature contributes a
 * signed weight, the weights are summed, and a logistic function maps the
 * sum to 0–1. That is a real scoring technique (it is what a logistic
 * regression *is* once it is trained), and it is the honest thing to put in
 * a public demo: every number on screen can be traced to a line in this
 * file. There is no learned model here and the UI never claims one.
 *
 * It is deterministic. The same inputs always produce the same decision,
 * which is what makes it demonstrable — and is also the property a
 * regulated buyer asks about first.
 */

/* Feature weights, in log-odds. Positive pushes toward fraud. These are
   illustrative and chosen to behave sensibly, not fitted to a portfolio —
   see the note above. */
const BIAS = -3.1;

const COUNTRY_TIERS = {
  domestic: { label: "Domestic", weight: 0 },
  eea: { label: "Cross-border · established corridor", weight: 0.55 },
  emerging: { label: "Cross-border · emerging corridor", weight: 1.15 },
  sanctioned: { label: "Restricted jurisdiction", weight: 2.4 },
};

const CHANNELS = {
  chip: { label: "Card present · chip & PIN", weight: -0.85 },
  ecom_3ds: { label: "E-commerce · 3-D Secure", weight: -0.2 },
  ecom: { label: "E-commerce · no step-up", weight: 0.95 },
  moto: { label: "Mail / telephone order", weight: 1.35 },
};

const CATEGORIES = {
  grocery: { label: "Grocery", weight: -0.35 },
  travel: { label: "Travel", weight: 0.35 },
  electronics: { label: "Electronics", weight: 0.7 },
  crypto: { label: "Crypto / money transfer", weight: 1.45 },
};

const CFG = {
  amount: { min: 0, max: 250000 },
  velocity: { min: 0, max: 40 },
  tenure: { min: 0, max: 360 },
  hour: { min: 0, max: 23 },
};

const clampNum = (v, { min, max }, fallback = min) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

const pick = (v, table, fallback) =>
  Object.prototype.hasOwnProperty.call(table, v) ? v : fallback;

const sigmoid = (z) => 1 / (1 + Math.exp(-z));
const round = (n, p = 2) => Number(n.toFixed(p));

/**
 * A stable reference for the decision record. Not random: the same
 * transaction produces the same reference, so a reader can re-run and see
 * the audit trail line up. FNV-1a over the normalised input — it is an
 * identifier, never a security token, and carries no personal data because
 * the demo collects none.
 */
function reference(input) {
  const seed = JSON.stringify(input);
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `dec_${h.toString(16).padStart(8, "0")}`;
}

/** Normalise and clamp whatever arrived over the wire into a known shape. */
export function normalise(raw = {}) {
  return {
    amount: clampNum(raw.amount, CFG.amount, 240),
    country: pick(raw.country, COUNTRY_TIERS, "domestic"),
    channel: pick(raw.channel, CHANNELS, "ecom_3ds"),
    category: pick(raw.category, CATEGORIES, "grocery"),
    velocity24h: Math.round(clampNum(raw.velocity24h, CFG.velocity, 2)),
    tenureMonths: Math.round(clampNum(raw.tenureMonths, CFG.tenure, 36)),
    hourLocal: Math.round(clampNum(raw.hourLocal, CFG.hour, 14)),
    avsMatch: raw.avsMatch !== false,
  };
}

export function run(raw) {
  const started = Date.now();
  const input = normalise(raw);

  /* ---- features ---------------------------------------------------- */
  const contributions = [];
  const add = (label, detail, weight) => {
    if (weight === 0) return;
    contributions.push({ label, detail, weight: round(weight, 3) });
  };

  /* Amount enters on a log scale: the step from £50 to £500 matters far
     more than £5,000 to £5,450, which is how spend actually behaves. */
  const amountSignal = Math.log10(Math.max(input.amount, 1) + 1) - 2.2;
  add(
    "Ticket size",
    `${input.amount.toLocaleString("en-GB", { maximumFractionDigits: 0 })} on the account`,
    amountSignal * 0.85
  );

  const country = COUNTRY_TIERS[input.country];
  add("Corridor", country.label, country.weight);

  const channel = CHANNELS[input.channel];
  add("Acceptance channel", channel.label, channel.weight);

  const category = CATEGORIES[input.category];
  add("Merchant category", category.label, category.weight);

  /* Velocity is the single strongest live signal in card fraud: a
     compromised card is tested, then drained, inside one session. */
  const velocitySignal = Math.max(0, input.velocity24h - 3) * 0.28;
  add("Velocity", `${input.velocity24h} authorisations in 24h`, velocitySignal);

  /* A long-standing account is evidence in its own right. */
  const tenureSignal = input.tenureMonths < 6 ? 0.8 : input.tenureMonths > 24 ? -0.5 : 0;
  add(
    "Account tenure",
    input.tenureMonths < 6
      ? `${input.tenureMonths} months — thin history`
      : `${input.tenureMonths} months`,
    tenureSignal
  );

  const nightSignal = input.hourLocal >= 1 && input.hourLocal <= 5 ? 0.45 : 0;
  add("Local time", `${String(input.hourLocal).padStart(2, "0")}:00 cardholder time`, nightSignal);

  add("Address verification", input.avsMatch ? "AVS match" : "AVS mismatch", input.avsMatch ? -0.3 : 0.9);

  const z = contributions.reduce((sum, c) => sum + c.weight, BIAS);
  const score = sigmoid(z);

  /* ---- policy ------------------------------------------------------- */
  /* The model proposes; policy disposes. Keeping these separate is the
     whole argument for this architecture in a regulated setting — the
     thresholds and the overrides are reviewable without retraining
     anything, and every one that fires is named in the response. */
  const rules = [];
  let decision = score >= 0.72 ? "decline" : score >= 0.38 ? "review" : "approve";

  rules.push({
    id: "TH-001",
    text: `Score ${round(score * 100, 1)} against thresholds 38 / 72`,
    fired: true,
    effect: decision,
  });

  if (input.country === "sanctioned") {
    decision = "decline";
    rules.push({
      id: "GEO-014",
      text: "Restricted jurisdiction — blocked irrespective of score",
      fired: true,
      effect: "decline",
    });
  }

  if (input.amount >= 5000 && input.channel === "ecom" && decision === "approve") {
    decision = "review";
    rules.push({
      id: "SCA-220",
      text: "High-value e-commerce without step-up authentication — manual review",
      fired: true,
      effect: "review",
    });
  }

  if (input.channel === "chip" && input.velocity24h <= 3 && decision === "review" && score < 0.5) {
    decision = "approve";
    rules.push({
      id: "CP-030",
      text: "Card-present chip & PIN with normal velocity — released from review",
      fired: true,
      effect: "approve",
    });
  }

  /* ---- reason codes -------------------------------------------------- */
  /* Ranked by absolute contribution: the four lines an analyst would want
     first, with the direction of each one kept. */
  const reasons = [...contributions]
    .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
    .slice(0, 4)
    .map((c) => ({
      label: c.label,
      detail: c.detail,
      weight: c.weight,
      direction: c.weight > 0 ? "raises" : "lowers",
    }));

  return {
    decision,
    score: round(score, 4),
    band: score >= 0.72 ? "high" : score >= 0.38 ? "elevated" : "low",
    logOdds: round(z, 3),
    contributions,
    reasons,
    rules,
    input,
    record: {
      reference: reference(input),
      retained: false,
      basis: "Model AB-SCORE-1 (transparent scorecard) + policy set PS-4",
    },
    ms: Math.max(1, Date.now() - started),
  };
}

export const meta = {
  thresholds: { review: 0.38, decline: 0.72 },
  options: {
    country: Object.entries(COUNTRY_TIERS).map(([id, v]) => ({ id, label: v.label })),
    channel: Object.entries(CHANNELS).map(([id, v]) => ({ id, label: v.label })),
    category: Object.entries(CATEGORIES).map(([id, v]) => ({ id, label: v.label })),
  },
};
