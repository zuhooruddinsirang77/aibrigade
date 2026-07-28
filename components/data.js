const CDN = "https://cdn.prod.website-files.com/64147b2316f5ef0922b44617";

export const whyUs = [
  {
    title: "Fraud detection",
    bg: "bg1",
    text: "We build real-time fraud detection systems that spot anomalous transactions before they cost you, tuned for the complexity of financial services.",
    animWrapCls: "_1",
    animCls: "hide-tablet",
    icon: "shield",
  },
  {
    title: "Autonomous underwriting",
    bg: "bg2",
    text: "Decision intelligence workflows that automate underwriting with the accuracy and auditability financial institutions require.",
    animWrapCls: "_12-col-grid",
    animCls: "lottie2 hide-tablet",
    icon: "automation",
  },
  {
    title: "Clinical documentation",
    bg: "bg3",
    text: "HIPAA-compliant copilots that reduce clinician documentation burden while integrating cleanly with existing EHR systems.",
    animCls: "lottie width hide-tablet",
    icon: "document",
  },
  {
    title: "Diagnostics support",
    text: "AI-assisted diagnostics and risk stratification models that help clinical teams surface the right insight at the right moment.",
    grad: true,
    icon: "pulse",
  },
  {
    title: "Compliance & trading",
    bg: "bg5",
    text: "Automation agents that monitor trading activity and compliance obligations, giving your team a complete, always-current view.",
    animCls: "lottie hide-tablet",
    icon: "scale",
  },
  {
    title: "EHR integration",
    bg: "bg6",
    text: "Deep integration experience with HL7 FHIR, Epic, and Cerner ensures our systems fit directly into your clinical workflows.",
    animCls: "lottie _2 hide-tablet",
    icon: "network",
  },
];

export const services = [
  {
    title: "AI in Fintech — real-time fraud detection and autonomous underwriting",
    img: `${CDN}/642ab7230145bb548a2a64a7_figure_service1.webp`,
    cls: "_1",
    alt: "Two nested purple polygon-shaped trays on a black background.",
  },
  {
    title: "AI in Healthcare — HIPAA-compliant solutions for patient outcomes and clinical efficiency",
    img: `${CDN}/642ab7232b66313700f6d2a8_figure_service2.webp`,
    cls: "_2",
    alt: "Glossy, purple, spiral-shaped 3D object on a black background.",
  },
  {
    title: "Custom AI Development — end-to-end discovery through MLOps and deployment",
    img: `${CDN}/642ab7235b6551c1785eab6d_figure_service3.webp`,
    cls: "_3",
    alt: "Cluster of connected purple 3D rectangular blocks on a black background.",
  },
  {
    title: "Automation & Integrations — eliminating manual workflows and surfacing system intelligence",
    img: `${CDN}/642ab723702a841c291d5644_figure_service4.webp`,
    cls: "_4",
    alt: "Shiny purple spiraled 3D coil shape floating on black background.",
  },
];

export const features = [
  {
    title: "Discover",
    img: `${CDN}/641ae0e9f9ebde4ba9f76a38_spiral_glass_2.webp`,
    text: "We start with a discovery phase that maps your data, workflows, and compliance requirements across fintech and healthtech domains.",
  },
  {
    title: "Design",
    img: `${CDN}/641afc135a8ad482432bdf73_abstract_glass_1.webp`,
    text: "We design the right architecture for your AI system, choosing the models and frameworks that fit your risk and regulatory profile.",
  },
  {
    title: "Build",
    img: `${CDN}/641afc139a2175af6696cfd1_globe_spiral_glass_1.webp`,
    text: "Our engineers build production-grade copilots, automation agents, and GPT platforms with rigorous testing at every step.",
  },
  {
    title: "Deploy",
    img: `${CDN}/641afc133c554ce59418060d_flying_cubes_1.webp`,
    text: "We deploy into your environment with HIPAA-compliant infrastructure and EHR integrations, typically within months, not years.",
  },
  {
    title: "Scale",
    img: `${CDN}/641afc1393b320d329fa7f7b_wire_glass_1.webp`,
    text: "Our in-house team scales the system with you, from startup pilots to enterprise-wide rollouts nationwide.",
  },
  {
    title: "People-first approach",
    img: `${CDN}/641afc13beeffc1963a12a0e_pisma_glass_1.webp`,
    text: "Our team combines deep AI expertise with genuine care for your outcomes. With us, you can count on honest, open collaboration.",
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
