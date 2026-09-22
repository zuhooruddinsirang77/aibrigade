"use client";

import { useState } from "react";
import { usePopup } from "@/components/PopupContext";

const CDN = "https://cdn.prod.website-files.com/64147b2316f5ef0922b44617";
const EMAIL_RE =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const positions = ["CEO", "CTO", "product manager"];
const topics = ["AI in Fintech", "AI in Healthcare", "custom AI development"];

export default function PopupForm() {
  const { popupOpen, closePopup } = usePopup();
  const [form, setForm] = useState({
    name: "",
    from: "",
    position: "",
    specific: "",
    topic: "",
    idea: "",
    email: "",
    telegram: "",
    check: false,
  });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const validate = () => {
    const err = {};
    if (form.name.trim().length < 2) err.name = "Name should be at least 2 characters";
    if (form.from.trim().length < 2) err.from = "Company name or website should be at least 2 characters";
    const validEmail = EMAIL_RE.test(form.email.trim().toLowerCase());
    const validTg = form.telegram.trim().length >= 2;
    if (!validEmail && !validTg) err.contact = "Please enter a valid email address or Telegram/WhatsApp";
    if (!form.check) err.check = "Please check this box if you want to proceed";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (validate()) setDone(true);
  };

  if (!popupOpen) return null;

  return (
    <div
      className="section_popup"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        overflowY: "auto",
        background: "rgba(22,29,37,0.4)",
        backdropFilter: "blur(4px)",
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="padding-global height _2">
        <div className="container-large height">
          <div className="padding-section-popup" style={{ paddingTop: "4vh", paddingBottom: "4vh" }}>
            <div className="popup_component">
              <div className="popap_wrapper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${CDN}/642182e4a4c76c3413e8becb_background%20(1).webp`}
                  alt=""
                  className="popup_bg pointer-events-off"
                />

                {!done && (
                  <div className="popap_text">
                    <h2 className="heading-style-h3 purple nobr">
                      &lt;<span className="text-span-3">Hi, AIBrigade team!</span>/&gt;
                    </h2>
                  </div>
                )}

                {done ? (
                  <div className="success-message" style={{ position: "relative", zIndex: 2 }}>
                    <div className="div-block-5">
                      <h2 className="heading-style-h3 purple nobr">
                        &lt;<span className="text-span-3">Thank you</span>/&gt;
                      </h2>
                      <div className="d1 text-weight-medium">Your submission has been received.</div>
                      <a
                        href="#"
                        className="button submit w-button"
                        onClick={(e) => {
                          e.preventDefault();
                          setDone(false);
                          closePopup();
                        }}
                      >
                        See you soon!
                      </a>
                    </div>
                  </div>
                ) : (
                  <form className="popup_form" onSubmit={onSubmit}>
                    <div className="popup_top _2">
                      <div className="popup_input_span">
                        <div className="d1 text-weight-medium _2">My name is</div>
                        <div className="input_box">
                          <input
                            className="popup_input l w-input"
                            placeholder="input your name*"
                            value={form.name}
                            onChange={set("name")}
                          />
                          {errors.name && <div className="text_val" style={{ color: "red" }}>{errors.name}</div>}
                        </div>
                      </div>
                      <div className="popup_input_span">
                        <div className="d1 text-weight-medium _2">from</div>
                        <div className="input_box">
                          <input
                            className="popup_input l w-input"
                            placeholder="company name or link to website*"
                            value={form.from}
                            onChange={set("from")}
                          />
                          {errors.from && <div className="text_val" style={{ color: "red" }}>{errors.from}</div>}
                        </div>
                      </div>
                    </div>

                    <div className="popup_second _5">
                      <div className="d1 text-weight-medium _2">My position in the company</div>
                      <div className="popup_second _4 _6">
                        <div className="popup_buttons _2">
                          {positions.map((p) => (
                            <label
                              key={p}
                              className="popup_radio_wrapper _2 w-radio"
                              style={{
                                cursor: "pointer",
                                background: form.position === p ? "#9248E4" : undefined,
                                color: form.position === p ? "#fff" : undefined,
                              }}
                            >
                              <input
                                type="radio"
                                name="Position"
                                value={p}
                                checked={form.position === p}
                                onChange={set("position")}
                                style={{ opacity: 0, position: "absolute", zIndex: -1 }}
                              />
                              <span className="radio-button-label w-form-label">{p}</span>
                            </label>
                          ))}
                        </div>
                        <input
                          className="popup_input _3 w-input"
                          placeholder="or specify your position"
                          value={form.specific}
                          onChange={set("specific")}
                        />
                      </div>
                    </div>

                    <div className="popup_second _5">
                      <div className="d1 text-weight-medium _2">I&rsquo;d like to discuss</div>
                      <div className="popup_buttons">
                        {topics.map((t) => (
                          <label
                            key={t}
                            className="popup_radio_wrapper w-radio"
                            style={{
                              cursor: "pointer",
                              background: form.topic === t ? "#9248E4" : undefined,
                              color: form.topic === t ? "#fff" : undefined,
                            }}
                          >
                            <input
                              type="radio"
                              name="Topic"
                              value={t}
                              checked={form.topic === t}
                              onChange={set("topic")}
                              style={{ opacity: 0, position: "absolute", zIndex: -1 }}
                            />
                            <span className="radio-button-label w-form-label">{t}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="popup_second">
                      <div className="d1 text-weight-medium _2">
                        Tell us about your AI project
                      </div>
                      <textarea
                        className="popup_input txt w-input"
                        placeholder="describe your project idea"
                        value={form.idea}
                        onChange={set("idea")}
                      />
                    </div>

                    <div className="popup_second _4 _5">
                      <div className="d1 text-weight-medium _2">Reach back to me*</div>
                      <div className="input_box _2">
                        <input
                          className="popup_input w-input"
                          placeholder="e-mail"
                          type="email"
                          value={form.email}
                          onChange={set("email")}
                        />
                      </div>
                      <div className="popup_input_span _2">
                        <div className="d1 text-weight-medium _2">or</div>
                        <div className="input_box _2">
                          <input
                            className="popup_input w-input"
                            placeholder="telegram/skype"
                            value={form.telegram}
                            onChange={set("telegram")}
                          />
                        </div>
                      </div>
                      {errors.contact && (
                        <div className="text_val" style={{ color: "red" }}>{errors.contact}</div>
                      )}
                    </div>

                    <div className="popup_second _3">
                      <div className="submit_button_wrapper">
                        <input type="submit" className="button submit w-button" value="Submit" />
                      </div>
                      <div className="form_checkbox-wrap">
                        <label className="w-checkbox checkbox-field" style={{ cursor: "pointer" }}>
                          <input type="checkbox" checked={form.check} onChange={set("check")} />
                          <span className="text-size-14pt is--checkbox w-form-label">
                            {" "}I have read and accept the terms of the{" "}
                            <a
                              href="/privacy-policy"
                              target="_blank"
                              rel="noreferrer"
                              className="link-underline is--check"
                            >
                              Privacy Policy
                            </a>
                          </span>
                        </label>
                        {errors.check && (
                          <div className="text_val" style={{ color: "red" }}>{errors.check}</div>
                        )}
                      </div>
                    </div>
                  </form>
                )}
              </div>

              <button
                onClick={closePopup}
                aria-label="Close"
                className="popup_close_wrapper"
                style={{
                  position: "absolute",
                  top: "1.5rem",
                  right: "1.5rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#161d25",
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="3rem" height="3rem" viewBox="0 0 48 48" fill="none">
                  <path
                    d="M36 12L12 36M12 12L36 36"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
