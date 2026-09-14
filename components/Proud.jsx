import { proudBadges } from "@/components/data";
import Reveal from "@/components/motion/Reveal";

export default function Proud() {
  return (
    <div id="proud" className="section_proud">
      <div className="padding-section-proud">
        <div className="container-large">
          <div className="proud_container">
            <h2 className="gradient-background _2 heading-60pt-idap_pro">
              We&#39;re <br />
              recognized for
            </h2>
            <div className="proud_component">
              <Reveal variant="stagger" selector=".proud_image" className="proud_wrapper">
                {proudBadges.map((b, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.img}
                    alt={b.alt}
                    className={`proud_image ${i === 3 ? "_2" : ""}`}
                    key={i}
                  />
                ))}
              </Reveal>
              <div className="proud_gradient-mob pointer-events-off" />
            </div>
            <div className="proud_item pointer-events-off" />
          </div>
        </div>
      </div>
    </div>
  );
}
