import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhyUs from "@/components/WhyUs";
import Featured from "@/components/Featured";
import DecisionPath from "@/components/motion/DecisionPath";
import Cases from "@/components/Cases";
import Deployments from "@/components/Deployments";
import Environments from "@/components/Environments";
import SectionSeam from "@/components/motion/SectionSeam";
import Services from "@/components/Services";
import Features from "@/components/Features";
import Infrastructure from "@/components/Infrastructure";
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
        <DecisionPath />
        <Cases />
        <Deployments />
        {/* The work, then the rooms it runs in — a prospect who has just
            watched the reels is asking "where does this actually land?"
            before they are ready to read a service list.

            The separation used to be four `<br />`s, which is a run of
            empty line boxes on the white body between two full-bleed dark
            bands: at 1440px it reads as a gap where a section failed to
            render. `Environments` owns its own top padding, so the space
            is already there — what was missing was anything to look at
            during it. The seam below is that: the two bands' own ink,
            resolving into the page white. No new colour, no new copy, and
            it collapses to nothing under reduced motion. */}
        <SectionSeam />

        <Environments />
        <Services />
        <Features />
        {/* Features closes on Discover → … → Scale. This is what Scale
            means once the engagement is over, and the page used to go
            straight from the pipeline to testimonials without saying. */}
        <Infrastructure />
        <Reviews />
        <Cta />
        <Proud />
        <CtaDark />
        <Footer />
      </div>
    </>
  );
}
