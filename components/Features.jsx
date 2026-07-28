import { features } from "@/components/data";

export default function Features() {
  return (
    <div id="features" className="section_features">
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-features">
            <div className="_3-columns-grid">
              <h2 className="heading-style-h4 _2 _3 heading-30pt-tablet heading-40pt-ipad_pro">
                We are <span className="text-span">AI system builders</span>, <br />
                not just consultants
              </h2>
              <p className="p2 max-width-medium _2 text-16pt-ipad_pro">
                We go beyond strategy decks. We build the systems that run your business.
              </p>
            </div>

            <div className="features_grid-new">
              {features.map((f) => (
                <div className="features_item" key={f.title}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.img} alt="" className="features_backround" />
                  <h3 className="heading-style-h6 _30 features_heading-24pt features_heading-26pt-tablet">
                    {f.title}
                  </h3>
                  <div className="features_text_wrapper">
                    <p className="body18 text-16pt-ipad_pro">{f.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
