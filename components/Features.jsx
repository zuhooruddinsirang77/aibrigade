import { features } from "@/components/data";
import Reveal from "@/components/motion/Reveal";
import Pipeline from "@/components/motion/Pipeline";
import Kicker from "@/components/motion/Kicker";
import GemCore from "@/components/motion/GemCore";

/**
 * The five engagement stages are a sequence; "People-first approach" is a
 * value statement that happens to have been the sixth tile in the same 3x2
 * grid. Splitting them lets the sequence be drawn as one (see Pipeline.jsx)
 * and lets the closing claim sit where a closing claim belongs.
 */
const STAGE_TITLES = ["Discover", "Design", "Build", "Deploy", "Scale"];

export default function Features() {
  const stages = features.filter((f) => STAGE_TITLES.includes(f.title));
  const closer = features.find((f) => !STAGE_TITLES.includes(f.title));

  return (
    <div id="features" className="section_features">
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-features">
            <Kicker id="features" label="How we run it" />
            <Reveal variant="rise" className="_3-columns-grid">
              <h2 className="heading-style-h4 _2 _3 heading-30pt-tablet heading-40pt-ipad_pro">
                We are <span className="text-span">AI system builders</span>, <br />
                not just consultants
              </h2>
              <p className="p2 max-width-medium _2 text-16pt-ipad_pro">
                We go beyond strategy decks. We build the systems that run your business.
              </p>
            </Reveal>

            <Pipeline stages={stages} />

            {closer && (
              <Reveal variant="rise" className="ax-pipe__closer">
                {/* The same crystal as the Cases card, at badge size — one
                    object in two places rather than a live one here and a
                    still one there. Falls back to this exact render
                    wherever WebGL can't or shouldn't run; see GemCore. */}
                <GemCore
                  className="ax-pipe__closer-img"
                  src={closer.img}
                  alt=""
                  size={180}
                  spin={70}
                />
                <div>
                  <h3 className="heading-style-h6 _30">{closer.title}</h3>
                  <p className="body18 text-16pt-ipad_pro">{closer.text}</p>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
