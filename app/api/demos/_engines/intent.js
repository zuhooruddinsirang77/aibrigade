/**
 * Intent routing and action planning — the engine behind the
 * "Intent Router" demo.
 *
 * SERVER ONLY (see the note at the top of fraud.js).
 *
 * WHAT THIS ACTUALLY IS: a weighted lexical intent classifier over a fixed
 * taxonomy, plus slot filling and a routing policy. Each intent declares
 * phrases and terms with weights; an utterance scores against all of them;
 * the scores are normalised into confidences.
 *
 * The classifier is the least interesting part and it is not the point of
 * the demo. The point is everything wrapped around it, which is what
 * actually decides whether an agent is safe to put in front of customers:
 *
 *   - a confidence band that chooses between acting, asking and handing
 *     over, rather than always acting on the top guess;
 *   - slot extraction, so "acting" means a named tool call with arguments
 *     a reviewer can read before it runs;
 *   - a duty-of-care check that overrides the model entirely. Distress,
 *     bereavement and financial hardship go to a person even when the
 *     classifier is completely confident. That override is a line in this
 *     file, not a prompt, which is the only form of it that can be
 *     evidenced to a regulator.
 */

const INTENTS = [
  {
    id: "card_lost_stolen",
    label: "Lost or stolen card",
    domain: "Cards",
    tool: "cards.freeze",
    phrases: [["lost my card", 3], ["stolen", 3], ["card is missing", 3], ["someone took my card", 3]],
    terms: [["lost", 1.2], ["stolen", 2], ["missing", 1], ["card", 0.6], ["freeze", 1.5], ["block", 1.2]],
  },
  {
    id: "dispute_transaction",
    label: "Dispute a transaction",
    domain: "Disputes",
    tool: "disputes.open",
    phrases: [["don't recognise", 3], ["do not recognise", 3], ["didn't make this", 3], ["unauthorised", 3], ["charged twice", 2.5], ["wrong amount", 2]],
    terms: [["dispute", 2], ["unauthorised", 2], ["unauthorized", 2], ["fraudulent", 2], ["charge", 0.8], ["refund", 1.2], ["transaction", 0.7], ["recognise", 1.2]],
  },
  {
    id: "balance_enquiry",
    label: "Balance or statement",
    domain: "Servicing",
    tool: "accounts.summary",
    phrases: [["how much", 2], ["my balance", 3], ["current balance", 3], ["last statement", 2.5]],
    terms: [["balance", 2], ["statement", 1.6], ["available", 1], ["account", 0.6], ["spent", 1]],
  },
  {
    id: "payment_failed",
    label: "Failed or pending payment",
    domain: "Payments",
    tool: "payments.trace",
    phrases: [["payment failed", 3], ["didn't go through", 3], ["still pending", 2.5], ["hasn't arrived", 2.5]],
    terms: [["payment", 1.2], ["transfer", 1.2], ["failed", 1.8], ["declined", 1.8], ["pending", 1.5], ["bounced", 1.5]],
  },
  {
    id: "appointment",
    label: "Appointment scheduling",
    domain: "Patient access",
    tool: "scheduling.book",
    phrases: [["book an appointment", 3], ["reschedule", 3], ["cancel my appointment", 3], ["see the doctor", 2.5]],
    terms: [["appointment", 2], ["booking", 1.5], ["reschedule", 2], ["clinic", 1], ["doctor", 1], ["slot", 1.2]],
  },
  {
    id: "billing_query",
    label: "Bill or cover query",
    domain: "Revenue cycle",
    tool: "billing.explain",
    phrases: [["my bill", 2.5], ["insurance didn't cover", 3], ["why was i charged", 3], ["explain this charge", 3]],
    terms: [["bill", 1.6], ["invoice", 1.4], ["insurance", 1.6], ["cover", 1.2], ["copay", 2], ["deductible", 2], ["claim", 1.2]],
  },
  {
    id: "stock_check",
    label: "Stock / availability check",
    domain: "Operations",
    tool: "inventory.lookup",
    phrases: [["in stock", 3], ["do you have", 2], ["how many left", 2.5], ["out of stock", 2.5]],
    terms: [["stock", 2], ["inventory", 2], ["available", 1.2], ["warehouse", 1.5], ["sku", 1.8], ["units", 1.2]],
  },
  {
    id: "human_agent",
    label: "Asking for a person",
    domain: "Escalation",
    tool: "handoff.queue",
    phrases: [["speak to a human", 3], ["talk to someone", 3], ["real person", 3], ["put me through", 2.5], ["speak to an agent", 3]],
    terms: [["human", 2], ["agent", 1.2], ["advisor", 1.6], ["manager", 1.6], ["representative", 1.8]],
  },
];

/* Duty of care. These never route to an agent, whatever the classifier
   thinks, and the response says which marker fired and why. */
const CARE_MARKERS = [
  { re: /\b(?:bereave|passed away|deceased|died|funeral|estate of)\b/i, reason: "Bereavement" },
  { re: /\b(?:can'?t afford|cannot afford|struggling|hardship|evicted|homeless|debt collector|behind on)\b/i, reason: "Financial hardship" },
  { re: /\b(?:suicid|self harm|self-harm|end my life|kill myself)\b/i, reason: "Risk to the customer" },
  { re: /\b(?:abuse|coerc|threaten|domestic violence)\b/i, reason: "Safeguarding" },
  { re: /\b(?:solicitor|lawyer|ombudsman|legal action|sue you|complaint to the)\b/i, reason: "Legal or regulatory" },
];

/* ---- slots ------------------------------------------------------------
   Linear patterns only — this reads visitor input. See the security note
   in extraction.js.                                                     */
const SLOTS = [
  { key: "amount", label: "Amount", re: /(?:[$£€]|\b(?:USD|GBP|EUR|PKR|AED)\s?)\s?\d{1,3}(?:,\d{3}){0,3}(?:\.\d{2})?/ },
  { key: "cardLast4", label: "Card (last 4)", re: /\b(?:ending|last\s?4|card)\s*(?:in|with)?\s*[:#]?\s*(\d{4})\b/i, group: 1 },
  { key: "date", label: "Date", re: /\b(?:today|yesterday|tomorrow|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|(?:mon|tues|wednes|thurs|fri|satur|sun)day)\b/i },
  { key: "merchant", label: "Merchant", re: /\b(?:at|from|to)\s+([A-Z][A-Za-z&'.-]{2,20}(?:\s[A-Z][A-Za-z&'.-]{2,20}){0,2})/, group: 1 },
  { key: "sku", label: "Reference", re: /\b[A-Z]{2,4}-?\d{3,8}\b/ },
];

const ACT_THRESHOLD = 0.62;
const CLARIFY_THRESHOLD = 0.3;

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9\s'-]/g, " ").replace(/\s+/g, " ").trim();

function score(utterance) {
  const hay = norm(utterance);
  const words = new Set(hay.split(" "));

  return INTENTS.map((intent) => {
    let raw = 0;
    const evidence = [];

    for (const [phrase, weight] of intent.phrases) {
      if (hay.includes(phrase)) {
        raw += weight;
        evidence.push({ kind: "phrase", text: phrase, weight });
      }
    }
    for (const [term, weight] of intent.terms) {
      if (words.has(term)) {
        raw += weight;
        evidence.push({ kind: "term", text: term, weight });
      }
    }

    return { id: intent.id, label: intent.label, domain: intent.domain, tool: intent.tool, raw, evidence };
  });
}

export function run(rawInput) {
  const started = Date.now();
  const utterance = String(rawInput?.utterance ?? "").trim();

  const scored = score(utterance).sort((a, b) => b.raw - a.raw);
  const total = scored.reduce((s, i) => s + i.raw, 0);

  /* Confidence is `raw / (total + NONE_PRIOR)`, not `raw / total`.
     Dividing by the matched total alone is the classic way to make a
     classifier look certain about nothing: "it's about my account" matches
     one term, on one intent, and a bare share hands that a confident 100%
     because there was nothing to share with. NONE_PRIOR is a pseudo-count
     for "none of these" — an explicit reject option — so confidence
     reflects how much evidence there actually was, not merely how it was
     divided. One weak term now lands around 35%, which is the band that
     makes the agent ask instead of act. */
  const NONE_PRIOR = 1;

  const ranked = scored
    .filter((i) => i.raw > 0)
    .slice(0, 4)
    .map((i) => ({ ...i, confidence: Number((i.raw / (total + NONE_PRIOR)).toFixed(3)) }));

  /* ---- slots -------------------------------------------------------- */
  const slots = [];
  for (const slot of SLOTS) {
    const m = slot.re.exec(utterance);
    if (!m) continue;
    const value = (slot.group ? m[slot.group] : m[0])?.trim();
    if (value) slots.push({ key: slot.key, label: slot.label, value });
  }

  /* ---- duty of care -------------------------------------------------- */
  const care = CARE_MARKERS.find((c) => c.re.test(utterance)) || null;

  /* ---- routing ------------------------------------------------------- */
  const top = ranked[0] || null;
  const runnerUp = ranked[1] || null;
  const confidence = top ? top.confidence : 0;

  let route;
  if (care) {
    route = {
      action: "escalate",
      title: "Hand to a specialist",
      detail: `${care.reason} detected — policy routes this to a trained person regardless of model confidence.`,
      tool: "handoff.priority",
      override: care.reason,
    };
  } else if (!top) {
    route = {
      action: "escalate",
      title: "No intent matched",
      detail: "Nothing in the taxonomy scored above zero. The agent does not guess; it hands over with the transcript.",
      tool: "handoff.queue",
    };
  } else if (top.id === "human_agent") {
    route = {
      action: "escalate",
      title: "Customer asked for a person",
      detail: "An explicit request for a human is always honoured — it is never deflected back into self-service.",
      tool: "handoff.queue",
    };
  } else if (confidence >= ACT_THRESHOLD) {
    route = {
      action: "act",
      title: `Execute ${top.tool}`,
      detail: `Confidence ${(confidence * 100).toFixed(0)}% is above the ${(ACT_THRESHOLD * 100).toFixed(0)}% action threshold.`,
      tool: top.tool,
      args: Object.fromEntries(slots.map((s) => [s.key, s.value])),
    };
  } else if (confidence >= CLARIFY_THRESHOLD) {
    route = {
      action: "clarify",
      title: "Ask one clarifying question",
      detail: runnerUp
        ? `Top two intents are close (${(confidence * 100).toFixed(0)}% vs ${(runnerUp.confidence * 100).toFixed(0)}%). The agent asks rather than assumes.`
        : "Confidence is below the action threshold, so the agent confirms before doing anything.",
      question: runnerUp
        ? `Just to be sure — is this about ${top.label.toLowerCase()}, or ${runnerUp.label.toLowerCase()}?`
        : `Just to be sure — is this about ${top.label.toLowerCase()}?`,
      tool: null,
    };
  } else {
    route = {
      action: "escalate",
      title: "Below the confidence floor",
      detail: `Top intent reached only ${(confidence * 100).toFixed(0)}%. Under ${(CLARIFY_THRESHOLD * 100).toFixed(0)}% the agent stops and hands over.`,
      tool: "handoff.queue",
    };
  }

  return {
    utterance,
    ranked,
    slots,
    route,
    care,
    thresholds: { act: ACT_THRESHOLD, clarify: CLARIFY_THRESHOLD },
    taxonomySize: INTENTS.length,
    ms: Math.max(1, Date.now() - started),
  };
}
