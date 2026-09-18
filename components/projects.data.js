/**
 * The project showcase — one entry per PRODUCT, not per file.
 *
 * /public/projecs holds fifteen videos and two PDFs, and every one of them
 * is a language cut or a document belonging to one of six projects. The
 * section is built from this table, never from the directory listing, so
 * "Fitzy Arabic / Fitzy English / Fitzy Urdu" is one project with three
 * demos and one overview document, and a visitor never sees a filename.
 *
 * Shape:
 *
 *   id          stable key; also the DOM id the hero can scroll to
 *   name        the product
 *   type        what kind of thing it is — one short line, kept quiet
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
 * metadata arrives (these files run to 600MB, so that can be a while) and
 * are corrected from the element the moment it reports its own — so a
 * project whose cuts have different aspect ratios is handled per cut.
 *
 * Posters are single frames pulled from each cut (public/projecs/posters).
 * They are what makes `preload="none"` acceptable: nothing downloads until
 * a visitor presses play, and the section still shows the product.
 */

const DIR = "/projecs";
const file = (name) => `${DIR}/${encodeURIComponent(name)}`;
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
    tagline: "Conversational AI Shopping Assistant",
    description:
      "A voice-driven shopping guide for clothing and apparel platforms. Shoppers discover items, refine preferences, settle on a size, update the cart and check out by talking.",
    featured: true,
    videos: {
      en: { src: file("Fitzy English.mp4"), poster: poster("fitzy-en"), width: 3840, height: 2160, duration: 48 },
      ar: { src: file("Fitzy Arabic.mp4"), poster: poster("fitzy-ar"), width: 3840, height: 2160, duration: 61 },
      ur: { src: file("Fitzy Urdu.mp4"), poster: poster("fitzy-ur"), width: 3840, height: 2160, duration: 54 },
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
    tagline: "The call that starts every deal.",
    description:
      "An outbound voice agent that speaks naturally across languages and reads intent in real time — qualifying leads, booking appointments, answering queries, transferring calls.",
    videos: {
      en: { src: file("Call Center ENG.mp4"), poster: poster("incall-en"), width: 3840, height: 2160, duration: 127 },
      ar: { src: file("Call Center Arabic.mp4"), poster: poster("incall-ar"), width: 1920, height: 1080, duration: 155 },
      ur: { src: file("Call Center Urdu.mp4"), poster: poster("incall-ur"), width: 1920, height: 1080, duration: 112 },
    },
    resources: [{ type: "pdf", label: "Product overview", src: file("InCall.pdf") }],
  },
  {
    id: "fraud-detection",
    name: "Fraud Detection",
    type: "AI · Security · Web Application",
    tagline: "Real-time transaction risk scoring",
    description:
      "An autonomous system that scores every transaction as it happens, flagging anomalous activity in real time, explaining the reason behind each call and stepping up checks.",
    aliases: ["fraud-realtime"],
    videos: {
      en: { src: file("fraud detection english.mp4"), poster: poster("fraud-detection-en"), width: 1920, height: 1080, duration: 172 },
      ar: { src: file("fraud detection arabic.mp4"), poster: poster("fraud-detection-ar"), width: 1920, height: 1080, duration: 265 },
      ur: { src: file("fraud detection urdu.mp4"), poster: poster("fraud-detection-ur"), width: 1920, height: 1080, duration: 228 },
    },
    resources: [{ type: "pdf", label: "Project overview", src: file("Fraud Detection.pdf") }],
  },
  {
    id: "autovista",
    name: "AutoVista",
    type: "Mobile Application · Voice AI",
    tagline: "Voice-driven car shopping assistant",
    description:
      "A car shopping assistant you talk to. Describe the budget, body style and mileage you want, and it narrows the listings, answers questions and remembers what you asked for.",
    videos: {
      en: { src: file("AutoVista English app.mp4"), poster: poster("autovista-en"), width: 720, height: 1502, duration: 98 },
      ur: { src: file("AutoVista Urdu app.mp4"), poster: poster("autovista-ur"), width: 720, height: 1502, duration: 69 },
    },
    resources: [],
  },
  {
    id: "axon",
    name: "Axon",
    type: "Mobile Application · Banking",
    tagline: "AI assistant inside a mobile banking app",
    description:
      "An assistant built into a mobile banking app. Customers ask about balances, transactions and spending in their own words, then move money and settle bills by voice or chat.",
    videos: {
      en: { src: file("Axon_English app.mp4"), poster: poster("axon-en"), width: 720, height: 1600, duration: 117 },
      ar: { src: file("Axon_Arabic app.mp4"), poster: poster("axon-ar"), width: 720, height: 1600, duration: 131 },
      ur: { src: file("Axon_Urdu app.mp4"), poster: poster("axon-ur"), width: 720, height: 1600, duration: 124 },
    },
    resources: [],
  },
  {
    id: "rm2",
    name: "RM2",
    type: "Mobile Application · Conversational AI",
    tagline: "Ask your retail database a question, get the answer",
    description:
      "Ask your retail database anything by voice or text — top sellers last week, the branch with the highest fuel sales yesterday — and get spoken and written answers in seconds.",
    videos: {
      en: { src: file("RM2 video app.mp4"), poster: poster("rm2-en"), width: 720, height: 1280, duration: 67 },
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
