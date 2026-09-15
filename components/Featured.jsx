import Reveal from "@/components/motion/Reveal";
import TerminalFeed from "@/components/motion/TerminalFeed";

export default function Featured() {
  return (
    <div id="featured" className="section_featured">
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-featured padding-bottom-0_ipad-pro">
            <Reveal
              variant="stagger"
              selector="h3, .featured_gradient, p, .ax-featured-terminal"
              className="_12-col-grid featured_component tow-columns-grid-gradient i_pro-grid-padding-home"
            >
              <h3
                id="w-node-a1a784d5-ab7c-b5d9-ae82-a7f9802fc0c1-3317ee6c"
                className="heading-style-h5 text-color-white _30 first-columns heading-h5-36pt-ipad_pro"
              >
                We are a focused, fast-moving AI consultancy for Fintech &amp; HealthTech
              </h3>
              {/* `.featured_gradient` is a Webflow-positioned decorative wash
                  (absolute, sized by that stylesheet, sitting behind the
                  heading) — not a content slot. Putting the terminal inside
                  it overlapped the heading text badly. It gets its own grid
                  item instead, spanning the full row below both existing
                  ones so it doesn't need to guess at column tracks it can't
                  see (the grid's real template lives in the remote Webflow
                  stylesheet). */}
              <div className="featured_gradient is-gradient-home-page" />
              <p
                id="w-node-a1a784d5-ab7c-b5d9-ae82-a7f9802fc0c4-3317ee6c"
                className="body20 text-color-white max-width-medium two-columns text-16pt-ipad_pro"
              >
                AIBrigade is a trusted AI partner that builds cutting-edge, production-grade
                solutions. With deep expertise across HealthTech and Fintech, we turn discovery-stage
                insights into copilots, automation agents, and decision intelligence systems that
                move the needle.
              </p>
              <div
                className="ax-featured-terminal"
                style={{ gridColumn: "1 / -1", marginTop: "2.5rem", maxWidth: "28rem" }}
              >
                <TerminalFeed />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
