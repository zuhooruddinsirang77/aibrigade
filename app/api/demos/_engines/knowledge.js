/**
 * Grounded retrieval over a private corpus — the engine behind the
 * "Private Knowledge Assistant" demo.
 *
 * SERVER ONLY (see the note at the top of fraud.js).
 *
 * WHAT THIS ACTUALLY IS: BM25 retrieval — the standard lexical ranking
 * function — over a fixed sample corpus, followed by *extractive* answer
 * composition. The answer is assembled from sentences that exist verbatim
 * in the retrieved passages, each one carrying the passage it came from.
 * Nothing is generated. That is the entire argument the demo is making:
 *
 *   in a regulated setting the interesting half of "RAG" is the R.
 *
 * Retrieval is the half that decides whether an answer is defensible, and
 * it is the half you can test, tune and show a reader without a model
 * provider in the loop. So this demo shows it working, shows the scores,
 * and — most importantly — shows it REFUSING.
 *
 * The groundedness gate is the feature. If the corpus does not cover the
 * question, the assistant says so and names what it does hold, instead of
 * writing a fluent paragraph about a policy that does not exist. An
 * assistant that cannot say "I don't know" is not deployable against
 * policy, and a demo that never shows the refusal is hiding the thing a
 * buyer most needs to see.
 *
 * The corpus below is illustrative sample content written for this demo.
 * It is not AI Brigade's own policy documentation and the UI says so.
 */

const CORPUS = [
  {
    id: "SEC-01",
    doc: "Information Security Policy",
    section: "Data retention",
    text: "Model inputs and outputs are retained for 30 days in an encrypted store to support incident investigation, after which they are deleted automatically. Retention can be reduced to zero days for a tenant on request, in which case prompts are held in memory only for the duration of the request and never written to disk.",
  },
  {
    id: "SEC-02",
    doc: "Information Security Policy",
    section: "Encryption",
    text: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256. Encryption keys are managed in a hardware security module and rotated every 90 days. Customer data is segregated per tenant at the storage layer.",
  },
  {
    id: "GOV-01",
    doc: "Model Governance Standard",
    section: "Change control",
    text: "Any change to a production model, prompt template or decision threshold requires review by the model owner and a second approver from the risk function. Changes are recorded in the model register with the evaluation results that justified them. Emergency rollbacks may be executed by the on-call engineer and must be ratified within one business day.",
  },
  {
    id: "GOV-02",
    doc: "Model Governance Standard",
    section: "Human in the loop",
    text: "A model may not take an irreversible action on a customer account without human approval. Irreversible actions include closing an account, declining a claim, issuing a refund above the agreed limit and reporting a customer to a credit reference agency. Reversible actions such as drafting a note or flagging a case for review may be automated.",
  },
  {
    id: "GOV-03",
    doc: "Model Governance Standard",
    section: "Evaluation",
    text: "Every model is evaluated against a held-out set before release and monitored weekly for drift in input distribution and output distribution. A drift alert above the agreed tolerance pauses automated decisions and routes the affected queue to manual handling until the model owner clears it.",
  },
  {
    id: "PHI-01",
    doc: "Healthcare Data Handling",
    section: "Protected health information",
    text: "Protected health information must not be sent to a public model endpoint. Clinical workloads run against a privately hosted model inside the customer's own boundary, or against a provider under a signed business associate agreement with training on customer data contractually disabled.",
  },
  {
    id: "PHI-02",
    doc: "Healthcare Data Handling",
    section: "Access control",
    text: "Access to clinical records is role-based and least-privilege. Every read of a patient record by a person or a service is written to an immutable audit log that records the identity, the record, the timestamp and the stated purpose. Audit logs are retained for six years.",
  },
  {
    id: "OPS-01",
    doc: "Operations Runbook",
    section: "Incident escalation",
    text: "A severity one incident is any loss of availability affecting customer-facing decisioning, or any suspected exposure of customer data. It is escalated to the on-call engineer immediately and to the customer's named contact within one hour. A written post-incident review follows within five business days.",
  },
  {
    id: "OPS-02",
    doc: "Operations Runbook",
    section: "Availability",
    text: "Production decisioning services target 99.9 percent monthly availability measured at the API boundary. Planned maintenance is announced five business days in advance and scheduled outside the customer's stated business hours.",
  },
  {
    id: "DEP-01",
    doc: "Deployment Options",
    section: "Hosting models",
    text: "Systems can be deployed into the customer's own cloud account, into a dedicated single-tenant environment we operate, or fully air-gapped on premises for workloads that may not leave the building. The air-gapped option uses locally hosted open-weight models and receives updates by signed offline bundle.",
  },
];

/* Stopwords: common enough that they say nothing about which passage is
   relevant, and removing them keeps a long natural question from being
   scored mostly on its grammar. */
const STOP = new Set([
  "a","an","and","are","as","at","be","but","by","can","could","do","does","for","from","had","has","have","how",
  "i","if","in","into","is","it","its","may","me","my","of","on","or","our","should","so","than","that","the",
  "their","them","then","there","these","they","this","to","was","we","what","when","where","which","who","will",
  "with","would","you","your","am","been","being","about","any","does","did","get","got","much","long","many",
]);

const tokenize = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const contentTerms = (s) => tokenize(s).filter((t) => t.length > 2 && !STOP.has(t));

/* A crude but effective singular/plural fold, so "keys" matches "key" and
   "logs" matches "log" without pulling in a stemmer dependency. */
const fold = (t) => (t.length > 4 && t.endsWith("s") && !t.endsWith("ss") ? t.slice(0, -1) : t);

/* ---- index (built once per process, not per request) ------------------ */

const INDEX = (() => {
  const docs = CORPUS.map((entry) => {
    const terms = tokenize(`${entry.doc} ${entry.section} ${entry.text}`).map(fold);
    const tf = new Map();
    for (const t of terms) tf.set(t, (tf.get(t) || 0) + 1);
    return { entry, tf, length: terms.length };
  });

  const df = new Map();
  for (const d of docs) {
    for (const t of d.tf.keys()) df.set(t, (df.get(t) || 0) + 1);
  }

  const avgdl = docs.reduce((s, d) => s + d.length, 0) / docs.length;
  return { docs, df, avgdl, N: docs.length };
})();

const K1 = 1.5;
const B = 0.75;

function bm25(queryTerms) {
  return INDEX.docs
    .map((d) => {
      let score = 0;
      const matched = [];

      for (const raw of queryTerms) {
        const t = fold(raw);
        const tf = d.tf.get(t) || 0;
        if (tf === 0) continue;

        const df = INDEX.df.get(t) || 0;
        const idf = Math.log(1 + (INDEX.N - df + 0.5) / (df + 0.5));
        const denom = tf + K1 * (1 - B + (B * d.length) / INDEX.avgdl);
        score += idf * ((tf * (K1 + 1)) / denom);
        matched.push(raw);
      }

      return { entry: d.entry, score, matched };
    })
    .sort((a, b) => b.score - a.score);
}

/** Split a passage into sentences, keeping the full stop on the sentence. */
const sentences = (text) =>
  text
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.endsWith(".") ? s : `${s}.`));

/* The gate. Both conditions must hold for the assistant to answer:
   a floor on the retrieval score, and a floor on how much of the
   question's own vocabulary the best passage actually covers. Coverage is
   what catches a question that shares one common word with a passage and
   nothing else. */
const SCORE_FLOOR = 1.4;
const COVERAGE_FLOOR = 0.34;

export function run(rawInput) {
  const started = Date.now();
  const question = String(rawInput?.question ?? "").trim();
  const terms = contentTerms(question);

  if (terms.length === 0) {
    return {
      question,
      answered: false,
      refusal: "That question has no searchable terms in it. Try asking about retention, encryption, model change control, human approval, PHI handling, incidents, availability or deployment options.",
      passages: [],
      coverage: 0,
      topics: CORPUS.map((c) => `${c.doc} — ${c.section}`),
      corpusSize: CORPUS.length,
      ms: Math.max(1, Date.now() - started),
    };
  }

  const ranked = bm25(terms);
  const top = ranked[0];

  const uniqueTerms = [...new Set(terms.map(fold))];
  const covered = uniqueTerms.filter((t) => top.score > 0 && (INDEX.docs.find((d) => d.entry.id === top.entry.id)?.tf.has(t) ?? false));
  const coverage = uniqueTerms.length ? covered.length / uniqueTerms.length : 0;

  const passages = ranked
    .filter((r) => r.score > 0)
    .slice(0, 3)
    .map((r) => ({
      id: r.entry.id,
      doc: r.entry.doc,
      section: r.entry.section,
      text: r.entry.text,
      score: Number(r.score.toFixed(2)),
      matched: [...new Set(r.matched)],
    }));

  const grounded = top.score >= SCORE_FLOOR && coverage >= COVERAGE_FLOOR;

  if (!grounded) {
    return {
      question,
      answered: false,
      refusal:
        "That is not covered by the documents in this knowledge base. Rather than infer an answer, the assistant stops here — an answer composed from unrelated passages is the failure mode this gate exists to prevent.",
      passages,
      coverage: Number(coverage.toFixed(2)),
      gate: { score: Number(top.score.toFixed(2)), scoreFloor: SCORE_FLOOR, coverageFloor: COVERAGE_FLOOR },
      topics: CORPUS.map((c) => `${c.doc} — ${c.section}`),
      corpusSize: CORPUS.length,
      ms: Math.max(1, Date.now() - started),
    };
  }

  /* Extractive answer: the sentences that actually carry the query terms,
     each tagged with the passage it came from.

     Only the top passage contributes, plus a second one when it is at
     least RELATED of the top score. Without that bar, "how long are
     inputs retained" returned the retention rule and then two sentences
     about drift monitoring, because the second passage happened to share
     the word "model" — technically retrieved, visibly off-topic, and the
     sort of padding that makes an assistant look like it is guessing. */
  const RELATED = 0.55;

  /* A close score is not enough on its own. "How long are model inputs
     retained" retrieves the drift-monitoring passage at 74% of the top
     score because it shares "model" and "inputs" — every term except the
     one the question is actually about. So a supporting passage must also
     cover the question at least as completely as the best one does: same
     number of distinct query terms, or it is padding. Term count rather
     than IDF because the two are frequently tied in a corpus this small,
     and a tie-break that depends on declaration order is not a rule. */
  const topCoverage = new Set(passages[0].matched.map(fold)).size;

  const contributing = passages.filter((p, i) => {
    if (i === 0) return true;
    if (p.score < passages[0].score * RELATED) return false;
    return new Set(p.matched.map(fold)).size >= topCoverage;
  });

  /* A sentence also has to cover enough of the question to be part of the
     answer — two of its content terms, or all of them where the question
     only has one. Sharing a single common word ("model") with the question
     is how an unrelated sentence about drift monitoring ends up appended
     to an answer about retention: retrieved for a real reason, still not
     an answer to what was asked. */
  const MIN_HITS = Math.min(2, uniqueTerms.length);

  const answer = [];
  for (const p of contributing.slice(0, 2)) {
    const scoredSentences = sentences(p.text)
      .map((s) => {
        const hay = new Set(tokenize(s).map(fold));
        const hits = uniqueTerms.filter((t) => hay.has(t)).length;
        return { s, hits };
      })
      .filter((x) => x.hits >= MIN_HITS)
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 2);

    for (const { s } of scoredSentences) {
      answer.push({ text: s, citation: p.id, doc: p.doc, section: p.section });
    }
    if (answer.length >= 3) break;
  }

  /* The passage cleared the gate but no single sentence in it covers
     enough of the question on its own. Rather than show an "answered"
     badge above nothing, fall back to the best sentence available — and
     if even that is empty, refuse. An empty answer is a worse failure
     than a refusal because it looks like a bug rather than a decision. */
  if (answer.length === 0) {
    const best = sentences(top.entry.text)
      .map((s) => {
        const hay = new Set(tokenize(s).map(fold));
        return { s, hits: uniqueTerms.filter((t) => hay.has(t)).length };
      })
      .sort((a, b) => b.hits - a.hits)[0];

    if (!best || best.hits === 0) {
      return {
        question,
        answered: false,
        refusal:
          "The closest passage is related but does not answer that question directly. The assistant stops rather than stitching an answer out of sentences that only share a word with it.",
        passages,
        coverage: Number(coverage.toFixed(2)),
        gate: { score: Number(top.score.toFixed(2)), scoreFloor: SCORE_FLOOR, coverageFloor: COVERAGE_FLOOR },
        topics: CORPUS.map((c) => `${c.doc} — ${c.section}`),
        corpusSize: CORPUS.length,
        ms: Math.max(1, Date.now() - started),
      };
    }

    answer.push({
      text: best.s,
      citation: top.entry.id,
      doc: top.entry.doc,
      section: top.entry.section,
    });
  }

  return {
    question,
    answered: true,
    answer,
    passages,
    coverage: Number(coverage.toFixed(2)),
    gate: { score: Number(top.score.toFixed(2)), scoreFloor: SCORE_FLOOR, coverageFloor: COVERAGE_FLOOR },
    corpusSize: CORPUS.length,
    ms: Math.max(1, Date.now() - started),
  };
}

export const suggestions = [
  "How long are model inputs retained?",
  "Who has to approve a change to a production model?",
  "Can protected health information go to a public model?",
  "When can the system act without a human?",
  "What counts as a severity one incident?",
  "Can this run fully on premises?",
];
