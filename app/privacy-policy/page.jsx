import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Privacy Policy | AI Brigade",
  description:
    "What AI Brigade collects when you use aibrigade.ai or send an enquiry, why we hold it, who it reaches, and how to have it removed.",
  alternates: { canonical: "/privacy-policy" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage slug="privacy-policy" />;
}
