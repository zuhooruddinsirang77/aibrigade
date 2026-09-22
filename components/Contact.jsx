"use client";

import { useRef, useState } from "react";
import MaskHeading from "@/components/motion/MaskHeading";
import Magnetic from "@/components/motion/Magnetic";
import Reveal from "@/components/motion/Reveal";
import AgentConsole from "@/components/motion/AgentConsole";

/**
 * /contact.
 *
 * Until now the only way to reach anyone from this site was the enquiry
 * popup — which never sent anything (see app/api/contact/route.js) — or a
 * `mailto:` in the navigation, which does nothing at all on a machine with
 * no mail client configured. This is the page those should have been
 * pointing at.
 *
 * Built on the same parts as the case-study pages rather than on a new
 * look: the same ink band /icu and /halyk open with, the
 * coral eyebrow, `MaskHeading` on the h1, `Reveal` for the body, the
 * violet ramp and `--sp-*` scale from system.css. The one thing it does
 * differently from PopupForm is that it asks the qualifying questions in
 * the order a technical sales conversation actually needs them — who,
 * what, how big, how soon — instead of as a sentence the visitor fills in
 * the blanks of.
 */

const TOPICS = [
  "AI copilots",
  "Automation agents",
  "GPT platforms",
  "Decision intelligence",
  "Not sure yet",
];

const BUDGETS = [
  "Under $50k",
  "$50k – $150k",
  "$150k – $500k",
  "$500k+",
  "Still scoping",
];

const TIMELINES = ["As soon as possible", "This quarter", "Next quarter", "Exploring options"];

const CHANNELS = [
  {
    label: "Email",
    value: "contact@aibrigade.ai",
    href: "mailto:contact@aibrigade.ai",
    note: "Answered within one business day",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3.5 7l8.5 6 8.5-6" />
      </>
    ),
  },
  {
    label: "Phone",
    value: "+1 (845) 300-2429",
    href: "tel:+18453002429",
    note: "Mon–Fri, 9am – 6pm ET",
    icon: (
      <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 006 6l1.5-2 4 1.5v3a1.5 1.5 0 01-1.7 1.5A17 17 0 015 5.2 1.5 1.5 0 016.5 3.5z" />
    ),
  },
  {
    label: "LinkedIn",
    value: "/company/aibrigade",
    href: "https://www.linkedin.com/company/aibrigade/",
    note: "Team updates and engineering notes",
    external: true,
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7 10.5V17M7 7.2v.1M11 17v-3.6a2 2 0 014 0V17" />
      </>
    ),
  },
];

const OFFICES = [
  { city: "Perth Amboy, NJ", country: "United States", role: "Headquarters" },
  { city: "Dubai", country: "United Arab Emirates", role: "Middle East delivery" },
  { city: "Islamabad", country: "Pakistan", role: "Engineering" },
];

const NEXT_STEPS = [
  {
    title: "We read it properly",
    body: "An engineer who has shipped this kind of system reads your message — not a sales inbox auto-responder.",
  },
  {
    title: "A 30-minute technical call",
    body: "We walk your data, your constraints and your compliance surface, and tell you plainly what is and is not worth building.",
  },
  {
    title: "A scoped proposal",
    body: "Stages, deliverables, a production timeline and a number. No retainer to get there.",
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const EMPTY = {
  name: "",
  email: "",
  company: "",
  phone: "",
  topic: "",
  budget: "",
  timeline: "",
  message: "",
  consent: false,
  website: "", // honeypot — see the field at the foot of the form
};

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [failure, setFailure] = useState("");
  const formRef = useRef(null);

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    // Clear the error the moment the field it belongs to is being fixed;
    // leaving it up while someone types is the form arguing with them.
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Please tell us your name.";
    if (!EMAIL_RE.test(form.email.trim())) next.email = "Please enter a valid email address.";
    if (form.message.trim().length < 10) next.message = "Please add a little more detail.";
    if (!form.consent) next.consent = "Please accept the privacy policy to continue.";
    setErrors(next);
    return next;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;

    const found = validate();
    if (Object.keys(found).length) {
      // Put the caret in the first thing that is wrong rather than leaving
      // the visitor to hunt for the red text on a form this tall.
      const first = formRef.current?.querySelector('[aria-invalid="true"]');
      first?.focus();
      return;
    }

    setStatus("sending");
    setFailure("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "aibrigade.ai/contact" }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        if (data.errors) setErrors(data.errors);
        setFailure(
          data.error ||
            "Something went wrong sending your message. Please email contact@aibrigade.ai directly."
        );
        setStatus("error");
        return;
      }

      setForm(EMPTY);
      setErrors({});
      setStatus("sent");
    } catch {
      setFailure(
        "We could not reach the server. Please check your connection, or email contact@aibrigade.ai directly."
      );
      setStatus("error");
    }
  };

  const invalid = (key) => (errors[key] ? "true" : undefined);
  const describedBy = (key) => (errors[key] ? `contact-${key}-error` : undefined);

  return (
    <main className="ax-contact">
      {/* ---------- hero ----------
          Copy on the left, a system running on the right. Nothing is
          painted behind the headline: the band's own bloom and grid stop
          short of it, which is the arrangement the first version of this
          page got wrong. */}
      <section className="ax-contact__hero">
        <div className="padding-global">
          <div className="container-large">
            <div className="ax-contact__hero-grid">
              <div className="ax-contact__hero-copy">
                <span className="ax-contact__eyebrow">Contact</span>
                {/* Short enough to hold at display size. The long version of
                    this sentence lives in the deck below it, where 17px type
                    can carry a clause without wrapping five times. */}
                <h1 className="ax-contact__title">
                  <MaskHeading text="Talk to the engineers who build it" />
                </h1>
                <Reveal variant="rise" delay={0.2} className="ax-contact__dek">
                  <p>
                    Send us the problem, the constraints and the systems it has to live
                    inside. You get an engineer&rsquo;s answer — what we would build, what
                    we would not, and what it takes to run in production.
                  </p>
                </Reveal>
                <Reveal variant="rise" delay={0.3} className="ax-contact__hero-actions">
                  <a className="ax-contact__hero-link" href="#contact-form">
                    <span>Send a message</span>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M12 5v13M6 13l6 6 6-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                  <a className="ax-contact__hero-mail" href="mailto:contact@aibrigade.ai">
                    contact@aibrigade.ai
                  </a>
                </Reveal>
              </div>

              {/* Was a framed `HeroNetwork` — the four-layer node diagram.
                  It is the textbook picture of a neural network and says
                  nothing about this company: everyone's landing page has
                  one, it is the same drawing whether the firm ships
                  underwriting or image filters, and next to a headline
                  promising engineers it read as clip art.

                  `AgentConsole` is what this company sells, running: one
                  inference per domain, traced stage by stage, with the
                  latency budget adding up and an auditable verdict at the
                  end. Every figure in it restates a claim already on this
                  site (see the component). It has been in the tree unused
                  since the hero was rebuilt; app/console.css is the
                  stylesheet it was written against. */}
              <Reveal variant="clip" className="ax-contact__hero-panel">
                <AgentConsole />
              </Reveal>
            </div>

            {/* The three things anyone weighs before they start typing:
                how long a reply takes, whether they can speak freely, and
                whether this company has been near their regulator. A rule
                across the foot of the band, not a column floating in the
                middle of it. */}
            <Reveal variant="stagger" selector=".ax-contact__fact" className="ax-contact__facts">
              <div className="ax-contact__fact">
                <span className="ax-contact__fact-value">1 business day</span>
                <span className="ax-contact__fact-label">Typical first reply</span>
              </div>
              <div className="ax-contact__fact">
                <span className="ax-contact__fact-value">NDA on request</span>
                <span className="ax-contact__fact-label">Before anything sensitive changes hands</span>
              </div>
              <div className="ax-contact__fact">
                <span className="ax-contact__fact-value">FinTech &amp; HealthTech</span>
                <span className="ax-contact__fact-label">Regulated environments by default</span>
              </div>
              <div className="ax-contact__fact">
                <span className="ax-contact__fact-value">Three time zones</span>
                <span className="ax-contact__fact-label">New Jersey · Dubai · Islamabad</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- form + direct channels ---------- */}
      <section className="ax-contact__body" id="contact-form">
        <div className="padding-global">
          <div className="container-large">
            <div className="ax-contact__grid">
              {/* ---- the form ---- */}
              <div className="ax-contact__panel">
                {status === "sent" ? (
                  <div className="ax-contact__sent" role="status">
                    <span className="ax-contact__sent-mark" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12.5l5 5L20 6.5" />
                      </svg>
                    </span>
                    <h2>Message sent</h2>
                    <p>
                      Thanks — it is with our team. Someone who has built this kind of
                      system will come back to you within one business day, usually
                      sooner.
                    </p>
                    <p className="ax-contact__sent-note">
                      Something urgent in the meantime?{" "}
                      <a href="mailto:contact@aibrigade.ai">contact@aibrigade.ai</a> or{" "}
                      <a href="tel:+18453002429">+1 (845) 300-2429</a>.
                    </p>
                    <button
                      type="button"
                      className="ax-contact__reset"
                      onClick={() => setStatus("idle")}
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <>
                    <header className="ax-contact__panel-head">
                      <h2>Start a conversation</h2>
                      <p>
                        Fields marked <span aria-hidden="true">*</span> are required. Everything
                        else helps us come back with a useful answer rather than a
                        questionnaire.
                      </p>
                    </header>

                    <form ref={formRef} className="ax-contact__form" onSubmit={onSubmit} noValidate>
                      <div className="ax-contact__row">
                        <div className="ax-contact__field">
                          <label htmlFor="contact-name">
                            Name <span aria-hidden="true">*</span>
                          </label>
                          <input
                            id="contact-name"
                            name="name"
                            autoComplete="name"
                            placeholder="Jordan Ellis"
                            value={form.name}
                            onChange={set("name")}
                            aria-invalid={invalid("name")}
                            aria-describedby={describedBy("name")}
                          />
                          {errors.name && (
                            <p className="ax-contact__error" id="contact-name-error">
                              {errors.name}
                            </p>
                          )}
                        </div>

                        <div className="ax-contact__field">
                          <label htmlFor="contact-email">
                            Work email <span aria-hidden="true">*</span>
                          </label>
                          <input
                            id="contact-email"
                            name="email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            placeholder="jordan@company.com"
                            value={form.email}
                            onChange={set("email")}
                            aria-invalid={invalid("email")}
                            aria-describedby={describedBy("email")}
                          />
                          {errors.email && (
                            <p className="ax-contact__error" id="contact-email-error">
                              {errors.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="ax-contact__row">
                        <div className="ax-contact__field">
                          <label htmlFor="contact-company">Company</label>
                          <input
                            id="contact-company"
                            name="company"
                            autoComplete="organization"
                            placeholder="Company name or website"
                            value={form.company}
                            onChange={set("company")}
                          />
                        </div>

                        <div className="ax-contact__field">
                          <label htmlFor="contact-phone">Phone</label>
                          <input
                            id="contact-phone"
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            placeholder="Optional"
                            value={form.phone}
                            onChange={set("phone")}
                          />
                        </div>
                      </div>

                      {/* Chips rather than a select: five options is a set to
                          scan, and this is the answer that decides who reads
                          the message. */}
                      <fieldset className="ax-contact__fieldset">
                        <legend>What can we help with?</legend>
                        <div className="ax-contact__chips">
                          {TOPICS.map((t) => (
                            <label
                              key={t}
                              className="ax-contact__chip"
                              data-on={form.topic === t ? "true" : undefined}
                            >
                              <input
                                type="radio"
                                name="topic"
                                value={t}
                                checked={form.topic === t}
                                onChange={set("topic")}
                              />
                              <span>{t}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>

                      <div className="ax-contact__row">
                        <div className="ax-contact__field">
                          <label htmlFor="contact-budget">Budget range</label>
                          <div className="ax-contact__select">
                            <select
                              id="contact-budget"
                              name="budget"
                              value={form.budget}
                              onChange={set("budget")}
                            >
                              <option value="">Select a range</option>
                              {BUDGETS.map((b) => (
                                <option key={b} value={b}>
                                  {b}
                                </option>
                              ))}
                            </select>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path
                                d="M6 9.5l6 6 6-6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>

                        <div className="ax-contact__field">
                          <label htmlFor="contact-timeline">Timeline</label>
                          <div className="ax-contact__select">
                            <select
                              id="contact-timeline"
                              name="timeline"
                              value={form.timeline}
                              onChange={set("timeline")}
                            >
                              <option value="">Select a timeline</option>
                              {TIMELINES.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path
                                d="M6 9.5l6 6 6-6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="ax-contact__field">
                        <label htmlFor="contact-message">
                          About the project <span aria-hidden="true">*</span>
                        </label>
                        <textarea
                          id="contact-message"
                          name="message"
                          rows={6}
                          placeholder="What are you trying to automate or decide better? What systems does it have to talk to? Anything already in flight?"
                          value={form.message}
                          onChange={set("message")}
                          aria-invalid={invalid("message")}
                          aria-describedby={describedBy("message")}
                        />
                        {errors.message && (
                          <p className="ax-contact__error" id="contact-message-error">
                            {errors.message}
                          </p>
                        )}
                      </div>

                      {/* Not `display: none`: a bot reading the DOM sees a
                          normal text input, while the stylesheet takes it out
                          of sight and `tabIndex={-1}` keeps it out of the tab
                          order. Anything that arrives with it filled is
                          dropped server-side. */}
                      <div className="ax-contact__pot" aria-hidden="true">
                        <label htmlFor="contact-website">Leave this field empty</label>
                        <input
                          id="contact-website"
                          name="website"
                          tabIndex={-1}
                          autoComplete="off"
                          value={form.website}
                          onChange={set("website")}
                        />
                      </div>

                      <div className="ax-contact__consent">
                        <label
                          className="ax-contact__check"
                          data-invalid={invalid("consent")}
                        >
                          <input
                            type="checkbox"
                            name="consent"
                            checked={form.consent}
                            onChange={set("consent")}
                            aria-invalid={invalid("consent")}
                            aria-describedby={describedBy("consent")}
                          />
                          <span className="ax-contact__check-box" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12.5l4.5 4.5L19 7" />
                            </svg>
                          </span>
                          <span className="ax-contact__check-text">
                            I have read and accept the terms of the{" "}
                            <a
                              href="https://www.aibrigade.ai/privacy-policy"
                              target="_blank"
                              rel="noreferrer"
                            >
                              Privacy Policy
                            </a>
                            .
                          </span>
                        </label>
                        {errors.consent && (
                          <p className="ax-contact__error" id="contact-consent-error">
                            {errors.consent}
                          </p>
                        )}
                      </div>

                      {status === "error" && failure && (
                        <p className="ax-contact__failure" role="alert">
                          {failure}
                        </p>
                      )}

                      <div className="ax-contact__submit-row">
                        <Magnetic>
                          <button
                            type="submit"
                            className="ax-contact__submit"
                            disabled={status === "sending"}
                          >
                            <span>{status === "sending" ? "Sending…" : "Send message"}</span>
                            {status === "sending" ? (
                              <span className="ax-contact__spinner" aria-hidden="true" />
                            ) : (
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                  d="M5 12h13M13 6l6 6-6 6"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.7"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </button>
                        </Magnetic>
                        <p className="ax-contact__submit-note">
                          We never share your details. One reply, from a person.
                        </p>
                      </div>
                    </form>
                  </>
                )}
              </div>

              {/* ---- the direct routes ---- */}
              <aside className="ax-contact__aside">
                <Reveal variant="stagger" selector=".ax-contact__channel" className="ax-contact__channels">
                  {CHANNELS.map((c) => (
                    <a
                      key={c.label}
                      href={c.href}
                      className="ax-contact__channel"
                      {...(c.external ? { target: "_blank", rel: "noreferrer" } : null)}
                    >
                      <span className="ax-contact__channel-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          {c.icon}
                        </svg>
                      </span>
                      <span className="ax-contact__channel-body">
                        <span className="ax-contact__channel-label">{c.label}</span>
                        <span className="ax-contact__channel-value">{c.value}</span>
                        <span className="ax-contact__channel-note">{c.note}</span>
                      </span>
                    </a>
                  ))}
                </Reveal>

                <Reveal variant="rise" className="ax-contact__block">
                  <h3 className="ax-contact__block-title">What happens next</h3>
                  <ol className="ax-contact__steps">
                    {NEXT_STEPS.map((s, i) => (
                      <li key={s.title}>
                        <span className="ax-contact__step-n" aria-hidden="true">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="ax-contact__step-body">
                          <strong>{s.title}</strong>
                          <span>{s.body}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </Reveal>

                <Reveal variant="rise" className="ax-contact__block">
                  <h3 className="ax-contact__block-title">Where we are</h3>
                  <ul className="ax-contact__offices">
                    {OFFICES.map((o) => (
                      <li key={o.city}>
                        <span className="ax-contact__office-city">{o.city}</span>
                        <span className="ax-contact__office-country">{o.country}</span>
                        <span className="ax-contact__office-role">{o.role}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
