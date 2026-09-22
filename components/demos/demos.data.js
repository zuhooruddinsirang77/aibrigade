import FraudDecisionDemo from "@/components/demos/FraudDecisionDemo";
import DocumentExtractionDemo from "@/components/demos/DocumentExtractionDemo";
import IntentRouterDemo from "@/components/demos/IntentRouterDemo";
import KnowledgeAssistantDemo from "@/components/demos/KnowledgeAssistantDemo";

/**
 * The demo register — metadata in one place, UI in another.
 *
 * Adding a demo is: write the engine under app/api/demos/_engines, add it
 * to the `DEMOS` table in app/api/demos/route.js, write the component, and
 * append an entry here. Nothing in app/demos/page.jsx changes; it renders
 * whatever this array holds, in this order.
 *
 * `capability` maps each demo to the capability it evidences, in the same
 * vocabulary the rest of the site uses (LISTEN / UNDERSTAND / REASON /
 * DECIDE / ACT), so a reader can see which part of the stack they are
 * looking at rather than four unrelated toys.
 *
 * ON `honesty`: every demo prints this line under its own description. The
 * site's existing copy is careful never to claim more than it can show
 * (see the provenance note at the top of components/video.data.js), and a
 * demo page is the easiest place on a site to quietly overclaim. These
 * demos run real algorithms — scoring, extraction, classification, BM25
 * retrieval — server-side, and none of them is a large language model.
 * Saying so is not a disclaimer bolted on afterwards; for the audience
 * this page is written for, it is the most interesting sentence in it.
 */

export const demos = [
  {
    id: "fraud-decision",
    title: "Real-time fraud decisioning",
    category: "Decision intelligence",
    capability: "REASON → DECIDE",
    summary:
      "Score a card transaction as it happens, then act on the score under a policy a risk team controls.",
    description:
      "A transaction arrives and something has to decide — in the time it takes an authorisation to round-trip — whether it goes through, gets referred, or is stopped. This demo scores one against eight features, then applies a policy layer on top of the model, and reports the ranked reason codes behind whichever way it went. Change any control and watch both the score and the reasons move.",
    honesty:
      "Runs a transparent additive scorecard server-side, not a learned model. Every weight is a line in the engine, which is why the reasons add up exactly.",
    technologies: ["Risk scoring", "Explainable AI", "Policy engine", "Reason codes"],
    component: FraudDecisionDemo,
  },
  {
    id: "document-extraction",
    title: "Document intelligence",
    category: "Understanding",
    capability: "UNDERSTAND",
    summary:
      "Turn an unstructured document into a structured record, with the source span behind every field.",
    description:
      "Remittance advice, clinical notes, invoices and onboarding packets all arrive as text that somebody has to re-key. This demo classifies the document, pulls the fields out of it, and — the part that matters for anyone who has to sign off the result — highlights exactly which characters produced each value. Hover a row to find it in the source. Paste your own document if you would rather.",
    honesty:
      "Rule-based extraction: labelled-field and format patterns with a keyword classifier. No model call, no data stored.",
    technologies: ["Information extraction", "Document AI", "Entity recognition", "Confidence scoring"],
    component: DocumentExtractionDemo,
  },
  {
    id: "intent-router",
    title: "Agent intent routing",
    category: "Conversational AI",
    capability: "LISTEN → UNDERSTAND → ACT",
    summary:
      "Work out what a customer wants, then decide whether to act on it, ask about it, or hand it to a person.",
    description:
      "The interesting question about a customer-facing agent is not whether it can classify a sentence — it is what it does when it is only half sure, and what it does when the sentence carries something no agent should handle. This demo shows all three outcomes: a confident request becomes a named tool call with arguments, an ambiguous one becomes a single clarifying question, and anything carrying bereavement, hardship or distress goes straight to a person regardless of confidence.",
    honesty:
      "A weighted lexical classifier over a fixed taxonomy. The routing policy and the duty-of-care override — the parts worth looking at — are ordinary code, which is the point.",
    technologies: ["Intent classification", "Slot filling", "Confidence thresholds", "Human handoff"],
    component: IntentRouterDemo,
  },
  {
    id: "knowledge-assistant",
    title: "Private knowledge assistant",
    category: "Retrieval",
    capability: "UNDERSTAND → REASON",
    summary:
      "Answer from a private corpus with citations — and refuse when the corpus does not cover the question.",
    description:
      "Every enterprise assistant demo answers the question it was built to answer. This one will also decline. Ask it something the policy documents do not contain and it stops, says so, shows the retrieval scores that made it stop, and lists what it does hold. That refusal is the feature: an assistant that cannot say “I don’t know” will invent a policy, and inventing policy is the specific failure that keeps these systems out of production.",
    honesty:
      "Real BM25 retrieval over ten sample passages, with an extractive answer — every sentence returned appears verbatim in a cited passage. Nothing is generated.",
    technologies: ["RAG", "BM25 retrieval", "Citations", "Groundedness gate"],
    component: KnowledgeAssistantDemo,
  },
];

export const categories = [...new Set(demos.map((d) => d.category))];
