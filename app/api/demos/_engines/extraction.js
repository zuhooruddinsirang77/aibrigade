/**
 * Document intelligence — the engine behind the "Document Extraction" demo.
 *
 * SERVER ONLY (see the note at the top of fraud.js).
 *
 * WHAT THIS ACTUALLY IS: rule-based information extraction. Labelled-field
 * patterns, format patterns (dates, money, clinical codes) and a small
 * keyword classifier for document type. It is the layer that sits *under*
 * a document pipeline in production, and it is the part worth showing,
 * because it is the part that is auditable: every value returned carries
 * the offsets it was read from, so the reader can see exactly which span
 * of their own text produced it. Nothing is inferred out of thin air, and
 * the UI says so.
 *
 * SECURITY — this function accepts arbitrary visitor text, so:
 *
 *  - Every pattern here is linear. There is no nested quantifier anywhere
 *    in this file (no `(x+)+`, no `(a|ab)*`), which is what makes
 *    catastrophic backtracking — a one-request CPU denial of service —
 *    impossible rather than unlikely. Quantifiers are bounded wherever a
 *    bound is meaningful.
 *  - Input is length-capped by the caller before it arrives, and each
 *    pattern stops after MAX_PER_FIELD matches, so a pathological document
 *    cannot produce an unbounded response either.
 *  - Offsets are returned as numbers and the client renders highlights by
 *    slicing its own copy of the string into React nodes. No HTML is built
 *    here and none is interpreted there.
 */

const MAX_PER_FIELD = 6;

/* ---- document type ---------------------------------------------------- */

const TYPES = [
  {
    id: "remittance",
    label: "Payment remittance advice",
    hint: "Payer → provider settlement",
    signals: ["remittance", "payer", "claim", "adjudicat", "allowed amount", "patient responsibility", "eob", "denial", "check no", "payment date"],
  },
  {
    id: "clinical",
    label: "Clinical note",
    hint: "Encounter documentation",
    signals: ["patient", "dob", "diagnosis", "assessment", "plan", "chief complaint", "vitals", "mrn", "prescribed", "follow-up", "history of"],
  },
  {
    id: "invoice",
    label: "Commercial invoice",
    hint: "Supplier billing",
    signals: ["invoice", "bill to", "purchase order", "subtotal", "vat", "due date", "net 30", "quantity", "unit price", "supplier"],
  },
  {
    id: "kyc",
    label: "Onboarding / KYC packet",
    hint: "Customer due diligence",
    signals: ["date of birth", "passport", "national id", "proof of address", "beneficial owner", "source of funds", "sanctions", "pep", "occupation"],
  },
];

function classify(text) {
  const hay = text.toLowerCase();
  const scored = TYPES.map((t) => {
    const hits = t.signals.filter((s) => hay.includes(s));
    return { id: t.id, label: t.label, hint: t.hint, hits: hits.length, matched: hits };
  }).sort((a, b) => b.hits - a.hits);

  const top = scored[0];
  const total = scored.reduce((s, t) => s + t.hits, 0);
  return {
    id: top.hits > 0 ? top.id : "unknown",
    label: top.hits > 0 ? top.label : "Unrecognised document type",
    hint: top.hits > 0 ? top.hint : "No strong signals found",
    confidence: total > 0 ? Number((top.hits / total).toFixed(2)) : 0,
    matched: top.matched,
    ranked: scored.filter((t) => t.hits > 0).slice(0, 3),
  };
}

/* ---- field patterns ---------------------------------------------------
   `label` patterns look for an explicit caption in the document; `format`
   patterns recognise a value by its own shape. A labelled hit is trusted
   more than a bare format hit, which is what the confidence column means.
   Group 1 is always the value, when a group is used at all.            */

const FIELDS = [
  {
    key: "documentNumber",
    label: "Document / claim number",
    kind: "label",
    re: /\b(?:claim|invoice|document|reference|policy|account)\s*(?:no\.?|number|#|id)?\s*[:#]\s*([A-Z0-9][A-Z0-9-]{2,23})/gi,
    confidence: 0.95,
  },
  {
    key: "money",
    label: "Monetary amount",
    kind: "format",
    // Symbol, then digits with optional thousands groups, then optional pence.
    re: /(?:[$£€]|\b(?:USD|GBP|EUR|AED|PKR)\s?)\s?\d{1,3}(?:,\d{3}){0,4}(?:\.\d{2})?/g,
    confidence: 0.9,
  },
  {
    key: "date",
    label: "Date",
    kind: "format",
    re: /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2}|\d{1,2}\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]{0,6}\.?\s\d{4})\b/g,
    confidence: 0.88,
  },
  {
    key: "person",
    label: "Named party",
    kind: "label",
    re: /\b(?:patient|provider|member|customer|bill to|supplier|beneficiary|insured)\s*[:]\s*([A-Z][A-Za-z'.-]{1,20}(?:\s[A-Z][A-Za-z'.-]{1,20}){0,3})/g,
    confidence: 0.82,
  },
  {
    key: "icd10",
    label: "ICD-10 diagnosis code",
    kind: "format",
    re: /\b[A-TV-Z]\d{2}(?:\.\d{1,4})?\b/g,
    confidence: 0.8,
  },
  {
    key: "cpt",
    label: "CPT / procedure code",
    kind: "label",
    re: /\b(?:cpt|procedure|hcpcs)\s*(?:code)?\s*[:#]?\s*(\d{5})\b/gi,
    confidence: 0.86,
  },
  {
    key: "npi",
    label: "Provider NPI",
    kind: "label",
    re: /\bNPI\s*[:#]?\s*(\d{10})\b/gi,
    confidence: 0.97,
  },
  {
    key: "mrn",
    label: "Medical record number",
    kind: "label",
    re: /\bMRN\s*[:#]?\s*([A-Z0-9-]{4,16})\b/gi,
    confidence: 0.94,
  },
  {
    key: "email",
    label: "Email address",
    kind: "format",
    re: /\b[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,63}\.[A-Za-z]{2,12}\b/g,
    confidence: 0.93,
  },
  {
    key: "phone",
    label: "Telephone",
    kind: "format",
    re: /(?:\+\d{1,3}[\s-]?)?(?:\(\d{2,4}\)[\s-]?|\d{2,4}[\s-])\d{3,4}[\s-]?\d{3,4}\b/g,
    confidence: 0.72,
  },
  {
    key: "iban",
    label: "IBAN / account",
    kind: "format",
    re: /\b[A-Z]{2}\d{2}[A-Z0-9]{10,26}\b/g,
    confidence: 0.85,
  },
];

/* A short stop-list for the bare-format patterns: document scaffolding that
   matches the shape but is never the value anyone wants. */
const NOISE = new Set(["000.00", "00.00"]);

function extract(text) {
  const out = [];

  for (const field of FIELDS) {
    // A fresh regex per call: a /g pattern carries lastIndex between uses,
    // and sharing one across requests would make results depend on the
    // previous caller's document.
    const re = new RegExp(field.re.source, field.re.flags);
    let m;
    let found = 0;

    while (found < MAX_PER_FIELD && (m = re.exec(text)) !== null) {
      // Zero-length matches cannot happen with these patterns, but a guard
      // costs nothing and an infinite loop costs the process.
      if (m[0].length === 0) {
        re.lastIndex += 1;
        continue;
      }

      const whole = m[0];
      const value = (m[1] !== undefined ? m[1] : whole).trim();
      if (!value || NOISE.has(value)) continue;

      // Offsets of the VALUE, not of the caption, so the highlight lands on
      // the thing that was extracted.
      const offsetInMatch = m[1] !== undefined ? whole.lastIndexOf(m[1]) : 0;
      const start = m.index + (offsetInMatch < 0 ? 0 : offsetInMatch);

      out.push({
        key: field.key,
        label: field.label,
        value,
        confidence: field.confidence,
        method: field.kind === "label" ? "labelled field" : "format match",
        start,
        end: start + value.length,
      });
      found += 1;
    }
  }

  // Reading order, so the table follows the document rather than the
  // order the patterns happen to be declared in.
  return out.sort((a, b) => a.start - b.start);
}

/** Collapse the flat hit list into one record, keyed by field. */
function toRecord(fields) {
  const record = {};
  for (const f of fields) {
    if (!record[f.key]) record[f.key] = [];
    if (!record[f.key].includes(f.value)) record[f.key].push(f.value);
  }
  return record;
}

export function run(raw) {
  const started = Date.now();
  const text = String(raw?.text ?? "");

  const type = classify(text);
  const fields = extract(text);
  const record = toRecord(fields);

  /* Completeness is measured against what this document type is expected
     to carry, which is the check a human reviewer actually performs. */
  const EXPECTED = {
    remittance: ["documentNumber", "money", "date"],
    clinical: ["person", "date", "icd10"],
    invoice: ["documentNumber", "money", "date"],
    kyc: ["person", "date"],
    unknown: [],
  };
  const expected = EXPECTED[type.id] || [];
  const missing = expected.filter((k) => !record[k]);

  const avgConfidence = fields.length
    ? Number((fields.reduce((s, f) => s + f.confidence, 0) / fields.length).toFixed(2))
    : 0;

  return {
    type,
    fields,
    record,
    missing: missing.map((k) => FIELDS.find((f) => f.key === k)?.label || k),
    stats: {
      characters: text.length,
      entities: fields.length,
      distinct: Object.keys(record).length,
      avgConfidence,
    },
    /* Honest about what a reviewer still has to do. A pipeline that claims
       everything is settled is the one that quietly posts a wrong figure. */
    reviewRequired: missing.length > 0 || avgConfidence < 0.85 || fields.length === 0,
    ms: Math.max(1, Date.now() - started),
  };
}
