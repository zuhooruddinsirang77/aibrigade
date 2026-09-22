import { CDN } from "@/components/data";
import Reveal from "@/components/motion/Reveal";
import Kicker from "@/components/motion/Kicker";
import ServiceExplorer from "@/components/motion/ServiceExplorer";

// One chip per capability card in WhyUs, in the same order — this isn't a
// new capability claim, just the eight things already argued in full
// sentences further up, surfaced as a scannable strip. That distinction
// matters: the README flags the risk of claims a prospect's procurement
// team can't verify, so nothing gets added here that isn't already stated
// in prose elsewhere on the page. This row also inherited the stack
// vocabulary the hero used to carry, which is why it reads as a stack and
// the hero now reads as a claim.
const STACK = [
  "Voice & speech",
  "Intent & documents",
  "Retrieval over private knowledge",
  "Models + rules",
  "Policy & approvals",
  "Tool use & APIs",
  "Human-in-the-loop",
  "Immutable audit trail",
];

const dot = `${CDN}/641af270af36ff69cfe98e5c_Group%202666.svg`;
const dot2 = `${CDN}/641af3f899336e17b7abd9e1_Group%202667%20(1).svg`;

function TickerItem({ start }) {
  const stats = [
    "One workflow, proven against real conditions",
    "Six sectors, one execution layer",
    "Cloud, on-prem, hybrid or air-gapped",
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
            {/* Every other section on the page opens on this numbered
                eyebrow (WhyUs, Cases, Environments, ...) — Services was the
                one exception, missing from CHAPTERS entirely, so it read as
                a section that forgot to introduce itself right after a page
                full of sections that do. */}
            <Kicker id="services" label="The digital workforce" />
            <Reveal variant="rise" className="_3-columns-grid">
              <h2 className="gradient-background heading-gradient-60pt-ipad-pro">
                Imagine your business <br />
                with a digital workforce
              </h2>
              <p className="p2 max-width-medium text-16pt-ipad_pro">
                Instead of isolated AI tools, think in terms of agents assigned to specific
                business outcomes &mdash; each one owning a workflow end to end, with a human
                wherever judgement is required.
              </p>
            </Reveal>

            <Reveal variant="stagger" selector=".ax-stack__tag" className="ax-stack" as="ul">
              {STACK.map((tag) => (
                <li className="ax-stack__tag" key={tag}>
                  {tag}
                </li>
              ))}
            </Reveal>

            {/* Was a four-card grid of one-line offers over 3D renders.
                See ServiceExplorer.jsx: the four offers are not
                interchangeable, so the section lets you open one. */}
            <Reveal variant="rise">
              <ServiceExplorer />
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
