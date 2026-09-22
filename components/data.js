const CDN = "https://cdn.prod.website-files.com/64147b2316f5ef0922b44617";

/**
 * The eight capabilities, in the order the page argues them.
 *
 * These were six vertical use cases (fraud detection, underwriting, clinical
 * documentation, ...). Those are sector offers, and the page now has a
 * section whose organising idea is the sector — see ServiceExplorer. What
 * belongs here is the layer underneath: the reusable capabilities every one
 * of those offers is assembled from.
 *
 * The first four are the hero's arrow in order — listen, understand, reason,
 * act — with `decide` split out of reasoning because the threshold is the
 * client's to set, not ours. `domain` no longer names a sector (none of
 * these is sector-specific); it names which of the four phases the card
 * belongs to, so the row reads in groups of two as it scrolls.
 *
 * `bg`, `animWrapCls`, `animCls` and `grad` are layout decoration carried
 * over positionally from the six that were here: there is no bg7/bg8 in the
 * stylesheet, so the last two reuse earlier backgrounds rather than pointing
 * at classes that do not exist.
 */
export const whyUs = [
  {
    title: "Listen",
    domain: "Input",
    bg: "bg1",
    text: "Multilingual voice and speech, across phone, web and mobile — the conversation starts wherever the customer already is.",
    animWrapCls: "_1",
    animCls: "hide-tablet",
    icon: "waveform",
  },
  {
    title: "Understand",
    domain: "Input",
    bg: "bg2",
    text: "Intent, documents and enterprise knowledge. The request is read against what your organisation actually knows, not against a generic model's guess.",
    animWrapCls: "_12-col-grid",
    animCls: "lottie2 hide-tablet",
    icon: "document",
  },
  {
    title: "Reason",
    domain: "Judgement",
    bg: "bg3",
    text: "Models, rules and business context together. The reasoning step is where a policy your team owns meets a model's output.",
    animCls: "lottie width hide-tablet",
    icon: "pulse",
  },
  {
    title: "Decide",
    domain: "Judgement",
    text: "Risk, policy, confidence and approvals. Where the threshold sits is a business decision, and it lives somewhere your risk team can change it.",
    grad: true,
    icon: "scale",
  },
  {
    title: "Act",
    domain: "Execution",
    bg: "bg5",
    text: "APIs, applications and workflows. This is the step most enterprise AI skips: the system does the thing, in the system of record, and the record proves it did.",
    animCls: "lottie hide-tablet",
    icon: "automation",
  },
  {
    title: "Communicate",
    domain: "Execution",
    bg: "bg6",
    text: "Voice, web, mobile and outbound. The agent closes its own loop — it tells the customer, the queue and the operator what just happened.",
    animCls: "lottie _2 hide-tablet",
    icon: "network",
  },
  {
    title: "Escalate",
    domain: "Control",
    bg: "bg1",
    text: "Human-in-the-loop wherever judgement is required. The handoff is designed first, not added after the first incident.",
    icon: "shield",
  },
  {
    title: "Operate privately",
    domain: "Control",
    bg: "bg3",
    text: "Cloud, on-prem, hybrid or air-gapped. Regulated teams get the capability without sending sensitive data to public AI.",
    icon: "lock",
  },
];

export const services = [
  {
    title: "Fintech — a digital workforce for the bank",
    img: `${CDN}/642ab7230145bb548a2a64a7_figure_service1.webp`,
    cls: "_1",
    alt: "Two nested purple polygon-shaped trays on a black background.",
  },
  {
    title: "Healthtech — administrative work that moves before staff chase it",
    img: `${CDN}/642ab7232b66313700f6d2a8_figure_service2.webp`,
    cls: "_2",
    alt: "Glossy, purple, spiral-shaped 3D object on a black background.",
  },
  {
    title: "Retail and customer operations — an AI operator beside every frontline team",
    img: `${CDN}/642ab7235b6551c1785eab6d_figure_service3.webp`,
    cls: "_3",
    alt: "Cluster of connected purple 3D rectangular blocks on a black background.",
  },
  {
    title: "Industrial and energy — governed AI at the point of work",
    img: `${CDN}/642ab723702a841c291d5644_figure_service4.webp`,
    cls: "_4",
    alt: "Shiny purple spiraled 3D coil shape floating on black background.",
  },
];

/**
 * The engagement, as five stages plus a closing claim.
 *
 * Renamed from Discover → Design → Build → Deploy → Scale. The pipeline has
 * five slots and every deployment reel has five chapters, so rather than
 * collapsing to the four steps this is argued in, `Prove` is split into the
 * design of the workflow and the proving of it — which maps 1:1 onto the
 * chapters already written in deployments.data.js.
 *
 * `STAGE_TITLES` in Features.jsx and `STAGES` in deployments.data.js index
 * these titles by string, so all three move together or the reels caption
 * with stage names the pipeline no longer has.
 */
export const features = [
  {
    title: "Identify",
    img: `${CDN}/641ae0e9f9ebde4ba9f76a38_spiral_glass_2.webp`,
    text: "Choose one meaningful workflow with measurable pain — slow, expensive, manual, risky or frustrating. We'll tell you whether AI can materially improve it.",
  },
  {
    title: "Design",
    img: `${CDN}/641afc135a8ad482432bdf73_abstract_glass_1.webp`,
    text: "Workflow design, then agent architecture: what the agent decides, what the policy decides, and where a human has to.",
  },
  {
    title: "Prove",
    img: `${CDN}/641afc139a2175af6696cfd1_globe_spiral_glass_1.webp`,
    text: "Built against real business conditions and the systems you actually permit us to reach — not a sandbox with synthetic data.",
  },
  {
    title: "Measure",
    img: `${CDN}/641afc133c554ce59418060d_flying_cubes_1.webp`,
    text: "Outcomes compared against your own operating baseline, on numbers your team already trusts.",
  },
  {
    title: "Scale",
    img: `${CDN}/641afc1393b320d329fa7f7b_wire_glass_1.webp`,
    text: "Productionize, then reuse the capabilities across adjacent workflows. The second workflow costs less than the first.",
  },
  {
    title: "Evidence, not dependency",
    img: `${CDN}/641afc13beeffc1963a12a0e_pisma_glass_1.webp`,
    text: "The first engagement should leave you with proof you can act on and a system your team can run — not a vendor you cannot leave.",
  },
];

const F = (n) => `${CDN}/${n}`;

export const reviews = [
  {
    name: "Sarah Whitfield",
    role: "Chief Risk Officer, Meridian Capital",
    img: F("641b009a26680896a915ea8d_face%20(1).webp"),
    text: "AIBrigade's real-time fraud detection system flagged anomalous transactions within weeks of deployment. Fraud losses dropped significantly, and our compliance team finally has an auditable decision trail. The demand for this kind of decision intelligence is huge, and AIBrigade delivered a production-grade system we could trust from day one.",
    highlight: true,
  },
  {
    name: "Dr. Michael Ansari",
    role: "CMIO, Lakeside Health Network",
    img: F("641b009a8ca4630125a4b942_face%20(5).webp"),
    text: "AIBrigade was hired to build a HIPAA-compliant clinical documentation copilot. To avoid disrupting existing workflows, they consulted closely with our clinicians and integrated directly with our Epic EHR via HL7 FHIR. The result is an interface physicians actually enjoy using.",
  },
  {
    name: "Paul Larsen",
    role: "CEO, Curiosity Fintech, LLC",
    img: F("641b009abf851cd682dcf9f1_face%20(2).webp"),
    text: "We partnered with AIBrigade to build an underwriting automation agent. AIBrigade provided a flawless architecture and then crafted a fast, scalable decision intelligence workflow.",
    project: "UnderwritePro",
  },
  {
    name: "Elena Grishchenko",
    role: "Head of Trading Operations, ICU Capital",
    img: F("641b009a8f1ef81b6463c8c8_face.webp"),
    text: "We partnered with AIBrigade to build a compliance monitoring agent that connects to our trading systems. The team took great care in developing an intuitive review interface, and built a middleware layer to unify data from multiple trading venues.",
  },
  {
    name: "Dan Webster",
    role: "VP of Product, Arts2U Health",
    img: null,
    text: "Our organization's leadership is pleased with the results of the engagement, as AIBrigade delivered on-time and on-budget. They maintained a streamlined method of communication and collaborated closely with stakeholders. The specialists have a well-structured, discovery-to-deployment workflow.",
  },
  {
    name: "Nikita Romankin",
    role: "CEO & Co-founder, ECOntainer Health",
    img: F("641b009a8450f90caf091c5b_face%20(4).webp"),
    text: "To scale patient risk stratification, ECOntainer Health needed a reliable AI partner. AIBrigade built an MVP diagnostics support model and advised us on our broader data strategy. Throughout the project, AIBrigade was responsive and adaptive to changing requirements.",
  },
  {
    name: "Gizem Sevilmis",
    role: "Founder, Sevilmis Financial Group",
    img: F("641b009a8450f9260b091c5c_face%20(7).webp"),
    text: "AIBrigade successfully built a robust, accessible, and well-designed underwriting platform. Their team committed to a tight schedule and regularly gave project updates. Professional and prepared, they guided us through the process effectively.",
  },
  {
    name: "Assel Marchenko",
    role: "CTO, Meridian Capital",
    img: F("641b009a41f94aa1658dc16e_face%20(3).webp"),
    text: "AIBrigade was approached to develop a new fraud detection solution, driving the model design in tandem with the advanced backend towards a more accurate and explainable approach. The AIBrigade team was responsive and demonstrated impressive background in production ML deployment.",
  },
  {
    name: "Yuriy Kogutiak",
    role: "Founder, Kogutiak Health Group",
    img: F("641b009a70cf258101ba351a_face%20(8).webp"),
    text: "AIBrigade successfully executed the EHR integration and got the system up and running in just weeks. They enabled us to address a pending compliance challenge. Their team seamlessly integrated into ours, so the partnership was perfect. They're reliable and a pleasure to work with.",
  },
];

export const proudBadges = [
  {
    img: F("641c82a758307577308bf291_5fc74387ae5dfc19d30529da_mobile_app_ukraine_p_500_1%20(1).webp"),
    alt: "Clutch badge for Top AI Development Company 2026.",
  },
  {
    img: F("641c82a7b4ac1665f53fad8e_5fc749f0cb14b107fdd6bcdd_manifest_white_p_500_1.webp"),
    alt: "The Manifest Top Fintech AI Company 2026.",
  },
  {
    img: F("641c82a741d4bb715120a281_5fc74387dacaa58265d6db26_mobile_app_canada_p_500_3.webp"),
    alt: "Clutch badge for Top HealthTech AI Company 2026.",
  },
  {
    img: F("641c82a741d4bb715120a281_5fc74387dacaa58265d6db26_mobile_app_canada_p_500_3.webp"),
    alt: "Clutch badge for Top HIPAA-Compliant AI Vendor 2026.",
  },
];

export { CDN };
