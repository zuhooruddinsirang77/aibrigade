import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Terms of Use | AI Brigade",
  description:
    "The terms on which you may use aibrigade.ai — what is on the site, what you may do with it, and the limits of what it promises.",
  alternates: { canonical: "/terms-of-use" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage slug="terms-of-use" />;
}
