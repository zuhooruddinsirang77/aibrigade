import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhyUs from "@/components/WhyUs";
import Featured from "@/components/Featured";
import DecisionPath from "@/components/motion/DecisionPath";
import Cases from "@/components/Cases";
import ProjectShowcase from "@/components/projects/ProjectShowcase";
import Environments from "@/components/Environments";
import SectionSeam from "@/components/motion/SectionSeam";
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
        <DecisionPath />
        <Cases />
        <ProjectShowcase />
        <SectionSeam />
        <Environments />
        <Services />
        <Features />
        <Reviews />
        <Featured />
        <Cta />
        {/* <Proud /> */}
        <CtaDark />
        <Footer />
      </div>
    </>
  );
}
