import CaseStudy from "@/components/CaseStudy";

export const metadata = {
  title: "UUB Health | AI Brigade case study",
  description:
    "How AI Brigade built a HIPAA-compliant clinical documentation copilot for UUB Health, integrated with Epic via HL7 FHIR.",
};

export default function Page() {
  return <CaseStudy slug="uub" />;
}
