import Navbar from "@/components/Navbar";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Contact | AI Brigade",
  description:
    "Talk to the engineers who build AI systems for FinTech and HealthTech. Send us the problem and the constraints — you will get an answer within one business day.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact | AI Brigade",
    description:
      "Talk to the engineers who build AI systems for FinTech and HealthTech. First reply within one business day.",
    type: "website",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <div className="main-wrapper">
        <Contact />
        <Footer />
      </div>
    </>
  );
}
