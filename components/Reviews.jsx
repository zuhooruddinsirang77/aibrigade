"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import { reviews } from "@/components/data";
import Reveal from "@/components/motion/Reveal";
import TiltCard from "@/components/motion/TiltCard";

function ReviewCard({ r }) {
  return (
    <div className={`review_item ${r.highlight ? "bg" : ""}`}>
      <div className="review_top">
        {r.img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.img} alt="" className="review_person" />
        ) : null}
        <div>
          <div className="body20 text-weight-medium">{r.name}</div>
          <div className="body20 text-weight-medium opacity50 text-style-nowrap">{r.role}</div>
        </div>
      </div>
      <p className="body18">{r.text}</p>
      {r.project ? (
        <div className="review_project">
          <div className="body14 text-color-gray">
            project <span className="purple">&lt;</span>
            <a href="#" className="small_link" onClick={(e) => e.preventDefault()}>
              {r.project}
            </a>
            <span className="purple">/&gt;</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function Reviews() {
  // Split into three columns for the static desktop layout.
  const cols = [[], [], []];
  reviews.forEach((r, i) => cols[i % 3].push(r));

  return (
    <div id="reviews" className="section_reviews">
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-reviews">
            <div className="_3-columns-grid">
              <h2 className="gradient-background say">What our clients say about us</h2>
              <p className="p2 max-width-medium text-16pt-ipad_pro">
                Trusted by fintech and healthtech teams nationwide, from startups to enterprises
              </p>
            </div>

            {/* Desktop: three static columns */}
            <div className="reviews_component hide-reviews-tablet" style={{ marginTop: "3rem" }}>
              <Reveal
                variant="stagger"
                selector=".review_item"
                className="review_columns"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "2rem",
                  alignItems: "start",
                }}
              >
                {cols.map((col, i) => (
                  <div
                    className="review_wrapper"
                    key={i}
                    style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
                  >
                    {col.map((r, j) => (
                      <TiltCard key={j}>
                        <ReviewCard r={r} />
                      </TiltCard>
                    ))}
                  </div>
                ))}
              </Reveal>
            </div>

            {/* Tablet / mobile: Swiper */}
            <div className="review-swiper-tablet" style={{ marginTop: "2.5rem" }}>
              <Swiper
                modules={[Navigation, EffectCoverflow]}
                effect="coverflow"
                coverflowEffect={{ slideShadows: false, depth: 100, modifier: 1, rotate: 0 }}
                grabCursor
                centeredSlides
                slidesPerView={1.05}
                spaceBetween={20}
                navigation
                breakpoints={{
                  768: { slidesPerView: 2, centeredSlides: false, effect: "slide" },
                }}
              >
                {reviews.map((r, i) => (
                  <SwiperSlide key={i} style={{ height: "auto" }}>
                    <div style={{ height: "100%" }}>
                      <ReviewCard r={r} />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
