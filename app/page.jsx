import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhyUs from "@/components/WhyUs";
import Featured from "@/components/Featured";
import Cases from "@/components/Cases";
import Deployments from "@/components/Deployments";
import Services from "@/components/Services";
import Features from "@/components/Features";
import Reviews from "@/components/Reviews";
import Cta from "@/components/Cta";
import Proud from "@/components/Proud";
import CtaDark from "@/components/CtaDark";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="main-wrapper">
        <Hero />
        <WhyUs />
        <Featured />
        <Cases />
        <Deployments />
        <Services />
        <Features />
        <Reviews />
        <Cta />
        <Proud />
        <CtaDark />
        <Footer />
      </div>
    </>
  );
}
