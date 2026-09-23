import { projects, defaultLanguage, languageCodes, LANGUAGES } from "@/components/projects.data";
import { whyUs } from "@/components/data";

/**
 * The use-case pages (`/use-cases/<id>`), one per product in the showcase.
 *
 * These replaced the three client case studies (/icu, /halyk, /uub — which
 * now redirect here). Those pages described engagements for clients whose
 * names and metrics were placeholders; every page built from this file
 * describes a product that exists, whose demo plays on the page.
 *
 * SOURCES — nothing here is claimed that one of these doesn't already say:
 *
 *   - the product's own overview PDF in /public/projecs, where there is
 *     one (Fitzy, InCall, Fraud Detection) — features, flow, the two
 *     InCall figures and the Fraud Detection delivery steps are that
 *     document's words, shortened;
 *   - the product's `description` in components/projects.data.js, which
 *     is written from its demo — the only source for the other five, so
 *     their pages are shorter and make no numeric claims;
 *   - the capability layer names and colours in components/data.js
 *     (`whyUs`), so "built from" on each page uses the site's own
 *     vocabulary.
 *
 * Shape, per product id:
 *
 *   headline     the hero line; MaskHeading syntax — "\n" breaks the line,
 *                *stars* mark the violet accent
 *   overview     one or two paragraphs; the first is the hero lede
 *   audience     optional — who it is built for, only where a source says
 *   flow         the chain the product runs, as steps { name, text } —
 *                the same chains the home page's flagship strip draws
 *   features     { title, text } — what it brings
 *   stats        optional { value, label } — only figures a source states
 *   stack        optional technology tags, from the product's document
 *   delivery     optional { name, text } — how it is delivered
 *   capabilities titles from `whyUs`, in the order the product uses them
 */
const DETAIL = {
  fitzy: {
    headline: "A personal shopper\n*your customers talk to.*",
    overview: [
      "Fitzy is a voice-driven conversational assistant for clothing and apparel e-commerce platforms. It acts as a personal shopping guide, taking shoppers from item discovery through preference refinement and cart updates to checkout.",
      "The shopper talks; Fitzy asks the questions a good sales assistant would — style, colour, size — and does the work in the store behind the conversation.",
    ],
    audience: "Clothing and apparel e-commerce platforms",
    flow: [
      { name: "Ask", text: "The shopper asks for help finding something — a suit, say." },
      { name: "Refine", text: "Fitzy narrows style and colour: formal yet modern, black or dark blue." },
      { name: "Add", text: "The shopper picks one. Fitzy asks for the size, then updates the cart." },
      { name: "Check out", text: "It checks whether there is anything else, then moves to checkout." },
      { name: "Confirm", text: "The order is placed on the spot, with a delivery estimate." },
    ],
    features: [
      { title: "Style & preference qualification", text: "Natural dialogue that pins down the need, the look and the colour." },
      { title: "Interactive item selection", text: "Shoppers choose items mid-conversation and ask for them in the cart." },
      { title: "Sizing & cart management", text: "The size is collected before anything is added to the cart." },
      { title: "Conversational checkout", text: "Keep browsing or finish the order — the assistant asks, the shopper decides." },
      { title: "Order confirmation", text: "Orders are processed immediately, with an estimated delivery time." },
      { title: "Three languages", text: "Demonstrated end to end in English, Arabic and Urdu." },
    ],
    capabilities: ["Listen", "Understand", "Reason", "Act", "Communicate"],
  },

  incall: {
    headline: "The call that\n*starts every deal.*",
    overview: [
      "InCall turns every outbound call into an intelligent business interaction. It speaks naturally across multiple languages, understands customer intent in real time, and takes action — from qualifying leads and booking appointments to answering queries, managing complaints and transferring calls to the right representative.",
      "Built for scale, it combines LLM reasoning, real-time speech recognition and synthesis, RAG-powered knowledge, conversation memory and autonomous tool execution in one end-to-end voice AI system.",
    ],
    audience: "Teams that run outbound calling at scale",
    stats: [
      { value: "98%", label: "intent-recognition accuracy in testing" },
      { value: "4–7s", label: "end-to-end AI response, excluding telephony" },
    ],
    flow: [
      { name: "Call", text: "InCall places the outbound call and speaks in the customer's language." },
      { name: "Converse", text: "Natural and interruption-aware — barge-in handled, context kept." },
      { name: "Capture", text: "Intent is recognised in real time; answers come from verified information." },
      { name: "Update", text: "Bookings and requests are actioned, and the outcome lands on the dashboard." },
      { name: "Escalate", text: "A call that needs a person is transferred to the right representative." },
    ],
    features: [
      { title: "Multilingual voice", text: "Natural, human-like conversation across languages." },
      { title: "Real-time intent recognition", text: "98% accuracy in testing, while the customer is still talking." },
      { title: "Barge-in handling", text: "Customers can interrupt, and the conversation keeps up." },
      { title: "Autonomous actions", text: "Bookings, support requests and call transfers, done on the call." },
      { title: "Conversation memory", text: "Context carried through, so every interaction stays consistent." },
      { title: "Grounded answers", text: "RAG over verified business information, not a model's guess." },
      { title: "High concurrency", text: "An architecture built for large-scale calling operations." },
      { title: "Live dashboard", text: "Campaigns, customers, calls and outcomes, managed in one place." },
    ],
    stack: ["LLM reasoning", "Real-time STT / TTS", "RAG knowledge", "Conversation memory", "Tool execution"],
    capabilities: ["Listen", "Understand", "Reason", "Act", "Communicate", "Escalate"],
  },

  "fraud-detection": {
    headline: "Every transaction scored.\n*Every score explained.*",
    overview: [
      "Fraud Detection is an autonomous transaction monitoring system for banks and financial platforms. It scores every transaction as it happens, flags anomalous activity in real time, explains the reason behind each call, and steps up authentication where the risk warrants it — without slowing down a legitimate trade.",
      "Streaming feature computation, machine-learned risk models and an explainable decision trail sit behind a single web application the risk team works in directly: reviewing what was flagged, reading the factors behind each score, and feeding those decisions back into the model.",
    ],
    audience: "Banks and financial platforms",
    flow: [
      { name: "Transaction", text: "Every transaction is picked up the moment it is submitted." },
      { name: "Score", text: "Streaming features and machine-learned models score it in real time." },
      { name: "Explain", text: "The factors behind the score are written out in plain language." },
      { name: "Intervene", text: "Approve, send for review, block — or step up to multi-factor authentication." },
      { name: "Learn", text: "Reviewer decisions feed back into the model on confirmed outcomes." },
    ],
    features: [
      { title: "Real-time scoring", text: "Every transaction, scored as it is submitted." },
      { title: "Anomaly detection", text: "Tuned to the complexity of financial services." },
      { title: "Explainable risk scores", text: "The factors behind each decision, in plain language." },
      { title: "Risk-based step-up MFA", text: "Triggered by risk, not by blanket rules." },
      { title: "Auditable decision trail", text: "Written for compliance review from the start." },
      { title: "Reviewer feedback loop", text: "The model retrains on confirmed outcomes." },
      { title: "Analyst console", text: "Monitoring, triage and case review in one web application." },
      { title: "Three languages", text: "Walkthroughs in English, Arabic and Urdu." },
    ],
    stack: ["Streaming features", "ML risk models", "Explainable AI", "Step-up MFA", "Audit trail"],
    delivery: [
      { name: "Discover", text: "Mapping settled disputes to understand what fraud actually looks like here." },
      { name: "Design", text: "Choosing features the risk team can defend to a regulator." },
      { name: "Build", text: "A streaming scorer, shadow-run against live traffic before it decides anything." },
      { name: "Deploy", text: "Cutover behind a kill switch." },
      { name: "Scale", text: "A retraining loop driven by reviewer feedback." },
    ],
    capabilities: ["Understand", "Reason", "Decide", "Act", "Escalate"],
  },

  autovista: {
    headline: "Car shopping,\n*by conversation.*",
    overview: [
      "AutoVista is a car shopping assistant you talk to, inside a mobile app. Describe the budget, body style and mileage you want, and it narrows the listings, answers questions and remembers what you asked for.",
      "No filter panels, no dropdowns — the buyer says what they are after, in English, Arabic or Urdu, and the listings follow the conversation.",
    ],
    flow: [
      { name: "Describe", text: "The buyer says what they want — budget, body style, mileage." },
      { name: "Narrow", text: "AutoVista filters the listings down to the cars that fit." },
      { name: "Answer", text: "It answers questions about the cars it has found." },
      { name: "Remember", text: "What the buyer asked for stays with the conversation." },
    ],
    features: [
      { title: "Search by voice", text: "Budget, body style and mileage, said the way a buyer would say them." },
      { title: "Listings narrowed live", text: "The results tighten as the conversation goes on." },
      { title: "Questions answered", text: "About the cars on screen, without leaving the conversation." },
      { title: "Remembers the brief", text: "Earlier preferences carry forward, so nothing is asked twice." },
      { title: "Three languages", text: "English, Arabic and Urdu." },
      { title: "Mobile-first", text: "Built into the app buyers already browse on." },
    ],
    capabilities: ["Listen", "Understand", "Reason", "Communicate"],
  },

  axon: {
    headline: "Banking, in the\n*customer's own words.*",
    overview: [
      "Axon is an AI assistant built into a mobile banking app. Customers ask about balances, transactions and spending in their own words, then move money and settle bills by voice or chat.",
      "It runs the chain end to end — voice in, the request understood, a supported banking workflow executed — in English, Arabic or Urdu.",
    ],
    audience: "Retail banks and their mobile apps",
    flow: [
      { name: "Ask", text: "By voice or chat, in the customer's own words." },
      { name: "Understand", text: "A balance, a transaction, a spending question or a payment — Axon works out which." },
      { name: "Answer", text: "Balances, transactions and spending, explained in plain language." },
      { name: "Execute", text: "Supported banking workflows carried out: money moved, bills settled." },
    ],
    features: [
      { title: "Balances & transactions", text: "Asked for in plain language, answered in it." },
      { title: "Spending questions", text: "Where the money went, without digging through statements." },
      { title: "Transfers", text: "Move money by voice or chat." },
      { title: "Bill payments", text: "Settle bills without leaving the conversation." },
      { title: "Voice or chat", text: "Inside the bank's existing mobile app." },
      { title: "Three languages", text: "English, Arabic and Urdu." },
    ],
    capabilities: ["Listen", "Understand", "Reason", "Act", "Communicate"],
  },

  rm2: {
    headline: "Ask your retail data a question.\n*Hear the answer.*",
    overview: [
      "RM2 is a mobile app that lets you ask your retail database anything, by voice or text.",
      "Top sellers last week, the branch with the highest fuel sales yesterday — the answer comes back spoken and written, in seconds.",
    ],
    flow: [
      { name: "Ask", text: "By voice or text — “top sellers last week”." },
      { name: "Understand", text: "RM2 works out what is being asked, and of which data." },
      { name: "Query", text: "The question runs against the retail database." },
      { name: "Answer", text: "Spoken and written, in seconds." },
    ],
    features: [
      { title: "Voice or text", text: "Ask the way you would ask a colleague." },
      { title: "Plain-language questions", text: "Top sellers, branch performance, fuel sales." },
      { title: "Spoken and written answers", text: "Hear it, or read it — both come back." },
      { title: "Answers in seconds", text: "Straight from the database, while the question is still fresh." },
      { title: "On mobile", text: "Where managers already are." },
    ],
    capabilities: ["Listen", "Understand", "Reason", "Communicate"],
  },

  zakat: {
    headline: "Zakat, calculated\n*the way a scholar would.*",
    overview: [
      "The AI Zakat Engine is a Zakat calculator that works the way a scholar would: pick a school of thought, enter cash, gold and short-term liabilities, and it works out what is owed.",
      "An AI guide sits alongside it for the Islamic finance questions a plain number can't answer.",
    ],
    flow: [
      { name: "Choose", text: "Pick the school of thought the calculation should follow." },
      { name: "Enter", text: "Cash, gold and short-term liabilities." },
      { name: "Calculate", text: "What is owed, worked out under that school's rules." },
      { name: "Ask", text: "The AI guide answers what the number alone can't." },
    ],
    features: [
      { title: "School-of-thought aware", text: "The calculation follows the school the user chooses." },
      { title: "Assets & liabilities", text: "Cash, gold and short-term liabilities, in one place." },
      { title: "What is owed", text: "Worked out for the user, not left as an exercise." },
      { title: "AI guide", text: "For the Islamic finance questions behind the number." },
      { title: "Web application", text: "Nothing to install." },
    ],
    capabilities: ["Understand", "Reason", "Communicate"],
  },

  foodpanda: {
    headline: "Order food by voice,\n*hands-free.*",
    overview: [
      "A voice assistant inside a food-delivery app. Say what you want — a specific meal, a deal, a drink added to the order, the nearest store — and it listens, understands and acts.",
      "No typing required, from the first request to the order.",
    ],
    flow: [
      { name: "Say", text: "A meal, a deal, a drink for the order, the nearest store." },
      { name: "Understand", text: "The assistant works out what was asked for." },
      { name: "Act", text: "It does it in the app — no typing required." },
    ],
    features: [
      { title: "A specific meal", text: "Ask for it by name." },
      { title: "Deals", text: "Find what is on offer by asking." },
      { title: "Add to the order", text: "A drink or a side, added by voice." },
      { title: "Nearest store", text: "Found without searching." },
      { title: "Hands-free", text: "From the first request to the order." },
    ],
    capabilities: ["Listen", "Understand", "Act"],
  },
};

/** The old client case-study routes and the use case each now opens. */
export const LEGACY_ROUTES = {
  icu: "fraud-detection",
  halyk: "axon",
  uub: "incall",
};

export const useCaseHref = (id) => `/use-cases/${id}`;

const CAPABILITY = Object.fromEntries(whyUs.map((c) => [c.title, c]));

/** Plain text of a MaskHeading string — for metadata and aria labels. */
export const plainHeadline = (s) => String(s).replace(/\*/g, "").replace(/\s*\n\s*/g, " ");

export const useCaseIds = projects.filter((p) => DETAIL[p.id]).map((p) => p.id);

export function getUseCase(id) {
  const project = projects.find((p) => p.id === id);
  const detail = DETAIL[id];
  if (!project || !detail) return null;

  const code = defaultLanguage(project);
  const video = code ? project.videos[code] : null;
  const codes = languageCodes(project);

  return {
    ...project,
    ...detail,
    href: useCaseHref(id),
    index: projects.indexOf(project),
    poster: video?.poster || null,
    posterOrientation: video && video.height > video.width ? "portrait" : "landscape",
    duration: video?.duration || null,
    languages: codes.map((c) => LANGUAGES[c]).filter(Boolean),
    capabilities: detail.capabilities
      .map((t) => CAPABILITY[t])
      .filter(Boolean)
      .map((c) => ({ title: c.title, text: c.text, color: c.color, domain: c.domain })),
  };
}

/** Every other use case, for the "more" row at the foot of a page. */
export const otherUseCases = (id) =>
  useCaseIds.filter((x) => x !== id).map((x) => getUseCase(x));
