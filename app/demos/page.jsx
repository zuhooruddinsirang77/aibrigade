import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DemoLab from "@/components/demos/DemoLab";
import { demos } from "@/components/demos/demos.data";

/**
 * /demos — the AI demo lab.
 *
 * Same shell as every other route on this site: the shared navigation, the
 * page body, the shared footer, inside `.main-wrapper` so the preloader's
 * reveal and the page transition both apply here as they do elsewhere.
 */

const TITLE = "AI Demos | AI Brigade";
const DESCRIPTION =
  "Interactive demonstrations of the AI capabilities behind our systems — real-time fraud decisioning, document intelligence, agent intent routing and grounded retrieval over a private corpus. Read what each one does, then run your own input through it.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "AI demo",
    "fraud detection demo",
    "document AI",
    "RAG demo",
    "intent classification",
    "enterprise AI",
  ],
  alternates: { canonical: "/demos" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: "/demos",
    siteName: "AI Brigade",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

/**
 * One ItemList naming the four demos. It is the structured-data shape that
 * actually matches what this page is — a list of named interactive items —
 * rather than dressing it up as something with richer markup and no basis.
 * Built from the same register the page renders, so it cannot fall out of
 * step with what is on screen.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "AI Brigade interactive AI demos",
  description: DESCRIPTION,
  numberOfItems: demos.length,
  itemListElement: demos.map((d, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: d.title,
    description: d.summary,
    url: `https://aibrigade.vercel.app/demos#${d.id}`,
  })),
};

export default function DemosPage() {
  return (
    <>
      <Navbar />
      <div className="main-wrapper">
        <DemoLab />
        <Footer />
      </div>
      <script
        type="application/ld+json"
        // Serialising our own build-time constant, not anything a visitor
        // supplied. The escape keeps a literal "</script>" in future copy
        // from closing the tag early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
