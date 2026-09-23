/**
 * The project showcase — one entry per PRODUCT, not per file.
 *
 * /public/projecs holds eighteen videos and three PDFs, and every one of
 * them is a language cut or a document belonging to one of eight projects. The
 * section is built from this table, never from the directory listing, so
 * "Fitzy Arabic / Fitzy English / Fitzy Urdu" is one project with three
 * demos and one overview document, and a visitor never sees a filename.
 *
 * Shape:
 *
 *   id          stable key; also the DOM id the hero can scroll to
 *   name        the product
 *   type        what kind of thing it is — one short line, kept quiet
 *   sector      the market it is sold into, one or two words — what the
 *               navigation and footer print beside the name
 *   useCase     the job it does, in one short line for those same menus
 *               (the tagline is the card's voice and some of them are
 *               slogans; this one always says what the product is for)
 *   tagline     optional one-liner under the name
 *   description optional paragraph — what the product does, in the
 *               words the product's own demo and overview support
 *   featured    which project opens the section at full width
 *   aliases     ids other sections already use for this project
 *               (`ProofStrip` in the hero fires `ax:select-reel` with
 *               "fraud-realtime"; that lands here)
 *   videos      keyed by language code, in the order the switcher shows
 *               them. Only languages that exist are listed — the switcher
 *               renders exactly these, never a disabled button
 *   resources   documents attached to the project, shown after the demo
 *
 * `width` / `height` / `duration` were read from the files themselves.
 * They let the media stage size itself correctly BEFORE the video's
 * metadata arrives and are corrected from the element the moment it
 * reports its own — so a project whose cuts have different aspect ratios
 * is handled per cut.
 *
 * Videos are served from Vercel Blob (`VIDEO_BASE`), not /public — git
 * (even with LFS) doesn't get its objects onto the Vercel build, so the
 * files live in Blob storage instead and are re-uploaded via
 * scripts/upload-videos-to-blob.mjs when they change. Posters and PDFs are
 * small enough to stay in public/projecs as ordinary git-tracked files.
 *
 * Posters are single frames pulled from each cut (public/projecs/posters).
 * They are what makes `preload="none"` acceptable: nothing downloads until
 * a visitor presses play, and the section still shows the product.
 */

const DIR = "/projecs";
const VIDEO_BASE = "https://nbxwwxaaq2xbi1j3.public.blob.vercel-storage.com/projecs";
const file = (name) => `${DIR}/${encodeURIComponent(name)}`;
const video = (name) => `${VIDEO_BASE}/${encodeURIComponent(name)}`;
const poster = (name) => `${DIR}/posters/${name}.jpg`;

/** Language display — label in its own script, English name for assistive
 *  tech and hover, and the text direction the label needs. The page stays
 *  LTR; only these labels flip. */
export const LANGUAGES = {
  en: { code: "en", label: "English", english: "English", dir: "ltr" },
  ar: { code: "ar", label: "العربية", english: "Arabic", dir: "rtl" },
  ur: { code: "ur", label: "اردو", english: "Urdu", dir: "rtl" },
};

export const projects = [
  {
    id: "fitzy",
    name: "Fitzy",
    type: "Conversational AI · E-commerce",
    sector: "E-commerce",
    useCase: "Shop, size and check out by voice",
    tagline: "Conversational AI Shopping Assistant",
    description:
      "A voice-driven shopping guide for clothing and apparel platforms. Shoppers discover items, refine preferences, settle on a size, update the cart and check out by talking.",
    featured: true,
    videos: {
      en: { src: video("Fitzy English.mp4"), poster: poster("fitzy-en"), width: 3840, height: 2160, duration: 48 },
      ar: { src: video("Fitzy Arabic.mp4"), poster: poster("fitzy-ar"), width: 3840, height: 2160, duration: 61 },
      ur: { src: video("Fitzy Urdu.mp4"), poster: poster("fitzy-ur"), width: 3840, height: 2160, duration: 54 },
    },
    resources: [
      {
        type: "pdf",
        label: "Project overview",
        src: file("Fitzy - Conversational AI Shopping Assistant.pdf"),
      },
    ],
  },
  {
    id: "incall",
    name: "InCall",
    type: "Voice AI · Call Center",
    sector: "Call center",
    useCase: "Outbound calls that qualify and book",
    tagline: "The call that starts every deal.",
    description:
      "An outbound voice agent that speaks naturally across languages and reads intent in real time — qualifying leads, booking appointments, answering queries, transferring calls.",
    videos: {
      en: { src: video("Call Center ENG.mp4"), poster: poster("incall-en"), width: 3840, height: 2160, duration: 127 },
      ar: { src: video("Call Center Arabic.mp4"), poster: poster("incall-ar"), width: 1920, height: 1080, duration: 155 },
      ur: { src: video("Call Center Urdu.mp4"), poster: poster("incall-ur"), width: 1920, height: 1080, duration: 112 },
    },
    resources: [{ type: "pdf", label: "Product overview", src: file("InCall.pdf") }],
  },
  {
    id: "fraud-detection",
    name: "Fraud Detection",
    type: "AI · Security · Web Application",
    sector: "Fintech",
    useCase: "Real-time transaction risk scoring",
    tagline: "Real-time transaction risk scoring",
    description:
      "An autonomous system that scores every transaction as it happens, flagging anomalous activity in real time, explaining the reason behind each call and stepping up checks.",
    aliases: ["fraud-realtime"],
    videos: {
      en: { src: video("fraud detection english.mp4"), poster: poster("fraud-detection-en"), width: 1920, height: 1080, duration: 172 },
      ar: { src: video("fraud detection arabic.mp4"), poster: poster("fraud-detection-ar"), width: 1920, height: 1080, duration: 265 },
      ur: { src: video("fraud detection urdu.mp4"), poster: poster("fraud-detection-ur"), width: 1920, height: 1080, duration: 228 },
    },
    resources: [{ type: "pdf", label: "Project overview", src: file("Fraud Detection.pdf") }],
  },
  {
    id: "autovista",
    name: "AutoVista",
    type: "Mobile Application · Voice AI",
    sector: "Automotive",
    useCase: "Find the right car by voice",
    tagline: "Voice-driven car shopping assistant",
    description:
      "A car shopping assistant you talk to. Describe the budget, body style and mileage you want, and it narrows the listings, answers questions and remembers what you asked for.",
    videos: {
      en: { src: video("AutoVista English app.mp4"), poster: poster("autovista-en"), width: 720, height: 1502, duration: 98 },
      ar: { src: video("AutoVista Arabic.mp4"), poster: poster("autovista-ar"), width: 720, height: 1502, duration: 74 },
      ur: { src: video("AutoVista Urdu app.mp4"), poster: poster("autovista-ur"), width: 720, height: 1502, duration: 69 },
    },
    resources: [],
  },
  {
    id: "axon",
    name: "Axon",
    type: "Mobile Application · Banking",
    sector: "Banking",
    useCase: "An AI assistant inside the banking app",
    tagline: "AI assistant inside a mobile banking app",
    description:
      "An assistant built into a mobile banking app. Customers ask about balances, transactions and spending in their own words, then move money and settle bills by voice or chat.",
    videos: {
      en: { src: video("Axon_English app.mp4"), poster: poster("axon-en"), width: 720, height: 1600, duration: 117 },
      ar: { src: video("Axon_Arabic app.mp4"), poster: poster("axon-ar"), width: 720, height: 1600, duration: 131 },
      ur: { src: video("Axon_Urdu app.mp4"), poster: poster("axon-ur"), width: 720, height: 1600, duration: 124 },
    },
    resources: [],
  },
  {
    id: "rm2",
    name: "RM2",
    type: "Mobile Application · Conversational AI",
    sector: "Retail",
    useCase: "Ask the retail database, hear the answer",
    tagline: "Ask your retail database a question, get the answer",
    description:
      "Ask your retail database anything by voice or text — top sellers last week, the branch with the highest fuel sales yesterday — and get spoken and written answers in seconds.",
    videos: {
      en: { src: video("RM2 video app.mp4"), poster: poster("rm2-en"), width: 720, height: 1280, duration: 67 },
    },
    resources: [],
  },
  {
    id: "zakat",
    name: "AI Zakat Engine",
    type: "Web Application · Islamic Finance",
    sector: "Islamic finance",
    useCase: "Zakat by school of thought, with a guide",
    tagline: "Zakat, calculated by school of thought — with an AI guide",
    description:
      "A Zakat calculator that works the way a scholar would: pick a school of thought, enter cash, gold and short-term liabilities, and it works out what's owed. An AI guide sits alongside it for the Islamic finance questions a plain number can't answer.",
    videos: {
      en: { src: video("zakat.mp4"), poster: poster("zakat-en"), width: 1920, height: 912, duration: 117 },
    },
    resources: [],
  },
  {
    /* Listed as "Foodpanda" — another company's brand — until it was
       renamed to what the app calls itself in its own demo ("Hello! This
       is QuickBite AI"). The video and poster files keep their original
       names; a visitor never sees those. */
    id: "quickbite",
    name: "QuickBite AI",
    type: "Mobile Application · Voice AI",
    sector: "Food delivery",
    useCase: "Order food by voice, hands-free",
    tagline: "Order food by voice, hands-free",
    description:
      "A voice assistant inside a food-delivery app. Say what you want — a specific meal, a deal, a drink added to the order, the nearest store — and it listens, understands and acts, no typing required.",
    videos: {
      en: { src: video("Foodpanda_Eng app.mp4"), poster: poster("foodpanda-en"), width: 720, height: 1600, duration: 131 },
    },
    resources: [],
  },
];

/* ---- helpers the components share ------------------------------------ */

/** Portrait or landscape, from whatever dimensions are known. Unknown
 *  dimensions are treated as landscape — the safer default on a wide
 *  card, and corrected as soon as the element reports its own. */
export const orientationOf = (video) =>
  video && video.width && video.height && video.height > video.width ? "portrait" : "landscape";

export const languageCodes = (project) => Object.keys(project.videos || {});

/** The project's default cut: English where it exists, else the first. */
export const defaultLanguage = (project) => {
  const codes = languageCodes(project);
  return codes.includes("en") ? "en" : codes[0];
};

/** The orientation a project is laid out for — from its default cut, so
 *  the grid never reflows when a visitor changes language. The media
 *  stage inside the card still adapts per cut. */
export const projectOrientation = (project) => {
  const code = defaultLanguage(project);
  return code ? orientationOf(project.videos[code]) : "landscape";
};

export const formatDuration = (s) => {
  if (!s || !isFinite(s)) return "";
  const m = Math.floor(s / 60);
  const r = Math.round(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
};

export const findProject = (id) =>
  projects.find((p) => p.id === id || (p.aliases || []).includes(id)) || null;

/** The use cases, as the navigation and the footer list them: every
 *  product, in showcase order, each linking to its own page
 *  (`/use-cases/<id>`, components/UseCase.jsx). These took the place of
 *  the three client case studies in both menus. */
export const useCases = projects.map((p) => ({
  id: p.id,
  name: p.name,
  sector: p.sector,
  line: p.useCase,
  href: `/use-cases/${p.id}`,
}));
