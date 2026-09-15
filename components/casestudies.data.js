import { deployments } from "@/components/deployments.data";
import { CDN } from "@/components/data";

/**
 * Content for the three case-study routes (`app/icu`, `app/halyk`, `app/uub`).
 *
 * Every fact here already exists elsewhere in the codebase — the client
 * descriptions are lifted verbatim from `Cases.jsx` (what the homepage
 * already links to), the process stages/metric/outcome/reel come from the
 * matching entry in `deployments.data.js`, and the stack tags are a subset
 * of the phrases `Services.jsx` already surfaces. Nothing new is claimed
 * here — see the PLACEHOLDER warning at the top of `deployments.data.js`,
 * which still applies to everything sourced from there.
 */
export const caseStudies = {
  icu: {
    slug: "icu",
    client: "ICU Capital",
    sector: "Fintech",
    gradClass: "",
    title: "Real-time fraud detection\nfor a regional bank",
    dek: "ICU Capital is a self-contained asset and investment management company. AIBrigade built an autonomous fraud detection system that gives its risk team real-time transaction monitoring, explainable risk scoring, and multi-factor authentication — without slowing down a single legitimate trade.",
    heroImg: `${CDN}/641ae32593cc502dc8ebafef_screen_phone%20(1).webp`,
    heroImgAlt: "Mobile trading app screen showing bonds with quantities, maturity dates, yields.",
    deploymentId: "fraud-realtime",
    stack: ["Real-time fraud scoring", "Explainable risk models", "MLOps & deployment"],
  },
  halyk: {
    slug: "halyk",
    client: "Meridian Capital",
    sector: "Fintech",
    gradClass: "halyk",
    title: "Autonomous underwriting\nfor a leading investment bank",
    dek: "Meridian Capital is a leading investment bank serving clients nationwide. AIBrigade built a decision intelligence workflow that automates underwriting while keeping every decision auditable and compliant.",
    heroImg: `${CDN}/642ab38169d01c433136bc01_frame_48095402.webp`,
    heroImgAlt: "Mobile app screen showing stock prices for Apple, Tesla, Facebook, Halykbank.",
    deploymentId: "underwriting-agent",
    stack: ["Autonomous underwriting", "Decision intelligence", "MLOps & deployment"],
  },
  uub: {
    slug: "uub",
    client: "UUB Health",
    sector: "Healthtech",
    gradClass: "",
    title: "A HIPAA-compliant clinical\ndocumentation copilot",
    dek: "UUB Health is a growing multi-site clinical network. AIBrigade built a HIPAA-compliant documentation copilot, integrated with Epic via HL7 FHIR, that reduces clinician charting time and improves clinical efficiency.",
    heroImg: null,
    heroImgAlt: "",
    deploymentId: "clinical-copilot",
    stack: ["HL7 FHIR integration", "HIPAA-compliant infra", "GPT platforms"],
  },
};

export function getCaseStudy(slug) {
  const base = caseStudies[slug];
  if (!base) return null;
  return { ...base, deployment: deployments.find((d) => d.id === base.deploymentId) || null };
}
