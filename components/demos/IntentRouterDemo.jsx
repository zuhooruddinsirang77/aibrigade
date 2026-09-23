"use client";

import { useRef, useState } from "react";
import DemoShell from "@/components/demos/DemoShell";
import useDemoRun from "@/components/demos/useDemoRun";
import KbdHint from "@/components/demos/KbdHint";
import { submitOnModEnter, useRunOnView } from "@/components/demos/labHooks";

/**
 * What an agent decides to DO with what it just heard.
 *
 * The examples are chosen to walk a reader through the three outcomes,
 * because the third one is the whole point: a clear request gets acted on,
 * an ambiguous one gets a question, and one carrying distress goes to a
 * person no matter how confident the classifier was. Most agent demos only
 * ever show the first.
 *
 * Picking an example routes it straight away; typing your own waits for
 * the button (or ⌘/Ctrl + Enter), because routing half a sentence on every
 * keystroke would show the classifier guessing at words not yet written.
 */

const EXAMPLES = [
  { label: "Clear request", text: "I've lost my card, can you freeze it please" },
  { label: "With details", text: "There's a charge at Brightwave Media for £89.99 I don't recognise on my card ending 4417" },
  { label: "Ambiguous", text: "it's about my account" },
  { label: "Needs a person", text: "I'm calling about my mother's account, she passed away last week" },
];

const ACTIONS = {
  act: { label: "Act", tone: "act", hint: "Call the tool" },
  clarify: { label: "Ask", tone: "clarify", hint: "One question" },
  escalate: { label: "Hand over", tone: "escalate", hint: "To a person" },
};

const MAX = 400;

export default function IntentRouterDemo() {
  const [utterance, setUtterance] = useState(EXAMPLES[0].text);
  const { status, result, error, run, reset } = useDemoRun("intent");
  const rootRef = useRef(null);

  const tooShort = utterance.trim().length < 3;
  const picked = EXAMPLES.find((ex) => ex.text === utterance);

  useRunOnView(rootRef, () => {
    if (status === "idle" && !tooShort) run({ utterance });
  });

  const submit = (e) => {
    e.preventDefault();
    if (tooShort) return;
    run({ utterance });
  };

  const action = result ? ACTIONS[result.route.action] : null;

  return (
    <div className="ax-demo__split" ref={rootRef}>
      <form className="ax-demo__controls" onSubmit={submit} aria-label="Customer utterance">
        <div className="ax-demo__presets" role="group" aria-label="Example utterances">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              className="ax-demo__preset"
              aria-pressed={picked?.label === ex.label}
              onClick={() => {
                setUtterance(ex.text);
                run({ utterance: ex.text });
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>

        <label className="ax-demo__field">
          <span className="ax-demo__field-label">
            What the customer said
            <em>
              {utterance.length}/{MAX}
            </em>
          </span>
          <textarea
            className="ax-demo__textarea"
            value={utterance}
            maxLength={MAX}
            rows={4}
            onKeyDown={submitOnModEnter}
            onChange={(e) => {
              setUtterance(e.target.value);
              if (status !== "idle") reset();
            }}
            placeholder="Type what a customer might say…"
          />
        </label>

        <div className="ax-demo__actions">
          <button
            type="submit"
            className="ax-demo__run"
            disabled={tooShort || status === "running"}
          >
            {status === "running" ? "Routing…" : "Route it"}
          </button>
          {tooShort ? (
            <p className="ax-demo__hint">Type a few words to run.</p>
          ) : (
            <KbdHint action="to route" />
          )}
        </div>
      </form>

      <DemoShell
        path="agent · POST /route"
        status={status}
        error={error}
        onRetry={() => run({ utterance })}
        emptyTitle="Nothing routed yet"
        emptyHint="Pick an example or write your own, then route it."
        runningLabel="Classifying and planning"
        steps={["Tokenise utterance", "Score intents", "Apply routing policy"]}
        raw={result}
        footer={
          result && (
            <>
              <span>{result.taxonomySize} intents in the taxonomy</span>
              <span>{result.ms}ms</span>
            </>
          )
        }
      >
        {result && (
          <div className="ax-demo__result">
            {/* The three outcomes the policy can reach, the chosen one lit. */}
            <ol className="ax-intent__paths" aria-label="Possible outcomes">
              {Object.entries(ACTIONS).map(([k, a]) => (
                <li
                  key={k}
                  data-tone={a.tone}
                  data-on={result.route.action === k ? "true" : undefined}
                  aria-current={result.route.action === k ? "true" : undefined}
                >
                  <strong>{a.label}</strong>
                  <span>{a.hint}</span>
                </li>
              ))}
            </ol>

            <div className={`ax-intent__route ax-intent__route--${action.tone}`}>
              <span className="ax-intent__action">{action.label}</span>
              <div className="ax-intent__route-body">
                <p className="ax-intent__route-title">{result.route.title}</p>
                <p className="ax-intent__route-detail">{result.route.detail}</p>

                {result.route.question && (
                  <p className="ax-intent__question">“{result.route.question}”</p>
                )}

                {result.route.tool && (
                  <p className="ax-intent__tool">
                    <code>{result.route.tool}</code>
                    {result.route.args && Object.keys(result.route.args).length > 0 && (
                      <span>({Object.entries(result.route.args).map(([k, v]) => `${k}: ${v}`).join(", ")})</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {result.care && (
              <p className="ax-intent__care">
                <strong>Policy override — {result.care.reason}.</strong> This path
                ignores the classifier entirely. It is a rule in the routing
                policy, not an instruction in a prompt, so it can be evidenced
                and tested.
              </p>
            )}

            {result.ranked.length > 0 && (
              <div className="ax-demo__block">
                <h3 className="ax-demo__block-title">Intent confidence</h3>
                <ul className="ax-intent__ranked">
                  {result.ranked.map((r, i) => (
                    <li key={r.id} data-top={i === 0 ? "true" : undefined}>
                      <span className="ax-intent__name">
                        {r.label}
                        <em>{r.domain}</em>
                      </span>
                      <span
                        className="ax-intent__bar"
                        aria-hidden="true"
                        style={{
                          "--clarify": `${result.thresholds.clarify * 100}%`,
                          "--act": `${result.thresholds.act * 100}%`,
                        }}
                      >
                        <i style={{ width: `${Math.round(r.confidence * 100)}%` }} />
                      </span>
                      <span className="ax-intent__pct">
                        {Math.round(r.confidence * 100)}%
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="ax-intent__thresholds">
                  Acts above {Math.round(result.thresholds.act * 100)}% · asks above{" "}
                  {Math.round(result.thresholds.clarify * 100)}% · hands over below
                </p>
              </div>
            )}

            {result.slots.length > 0 && (
              <div className="ax-demo__block">
                <h3 className="ax-demo__block-title">Entities pulled from the sentence</h3>
                <ul className="ax-intent__slots">
                  {result.slots.map((s) => (
                    <li key={s.key}>
                      <span>{s.label}</span>
                      <code>{s.value}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </DemoShell>
    </div>
  );
}
