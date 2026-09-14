import { features } from "@/components/data";
import Reveal from "@/components/motion/Reveal";
import Parallax from "@/components/motion/Parallax";
import TiltCard from "@/components/motion/TiltCard";

export default function Features() {
  return (
    <div id="features" className="section_features">
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-features">
            <Reveal variant="rise" className="_3-columns-grid">
              <h2 className="heading-style-h4 _2 _3 heading-30pt-tablet heading-40pt-ipad_pro">
                We are <span className="text-span">AI system builders</span>, <br />
                not just consultants
              </h2>
              <p className="p2 max-width-medium _2 text-16pt-ipad_pro">
                We go beyond strategy decks. We build the systems that run your business.
              </p>
            </Reveal>

            <Reveal variant="stagger" selector=".features_item" className="features_grid-new">
              {features.map((f) => (
                <TiltCard key={f.title}>
                  <div className="features_item">
                    <Parallax speed={-10}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.img} alt="" className="features_backround" />
                    </Parallax>
                    <h3 className="heading-style-h6 _30 features_heading-24pt features_heading-26pt-tablet">
                      {f.title}
                    </h3>
                    <div className="features_text_wrapper">
                      <p className="body18 text-16pt-ipad_pro">{f.text}</p>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
