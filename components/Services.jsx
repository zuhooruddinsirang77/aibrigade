import { services, CDN } from "@/components/data";

const dot = `${CDN}/641af270af36ff69cfe98e5c_Group%202666.svg`;
const dot2 = `${CDN}/641af3f899336e17b7abd9e1_Group%202667%20(1).svg`;

function TickerItem({ start }) {
  const stats = [
    "Discovery to deployment in months",
    "Fintech &amp; HealthTech clients nationwide",
    "HIPAA-compliant AI systems",
  ];
  const icons = start ? [dot, dot2, dot] : [dot2, dot, dot2];
  return (
    <div className="services_ticker_item">
      {stats.map((s, i) => (
        <span key={i} style={{ display: "contents" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={icons[i]} alt="" className="services_ticker_image" />
          <div className="heading-style-h6">{s}</div>
        </span>
      ))}
    </div>
  );
}

export default function Services() {
  return (
    <div id="services" className="section_services">
      <div className="services_ticker">
        {[0, 1].map((row) => (
          <div className="services_ticker_wrapper" key={row}>
            {[0, 1, 2, 3].map((i) => (
              <TickerItem key={i} start={i % 2 === 0} />
            ))}
          </div>
        ))}
      </div>

      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-services">
            <div className="_3-columns-grid">
              <h2 className="gradient-background heading-gradient-60pt-ipad-pro">
                What we can <br />
                help you with
              </h2>
              <p className="p2 max-width-medium text-16pt-ipad_pro">
                From discovery to production deployment, we build AI systems that give you a
                real competitive edge.
              </p>
            </div>

            <div className="services_component">
              {services.map((s) => (
                <div className="services_item" key={s.title}>
                  <h3 className="d1 _20">{s.title}</h3>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.img} alt={s.alt} className={`services_photo ${s.cls}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
