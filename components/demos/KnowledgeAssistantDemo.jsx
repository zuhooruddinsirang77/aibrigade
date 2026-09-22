"use client";

import { useState } from "react";
import DemoShell from "@/components/demos/DemoShell";
import useDemoRun from "@/components/demos/useDemoRun";

/**
 * Retrieval over a private corpus, with a refusal it is willing to give.
 *
 * The last suggested question is deliberately outside the corpus. A reader
 * who only ever sees successful answers has learned nothing about whether
 * the thing can be trusted — what they need to see is what happens when
 * the documents do not contain the answer, because that is the moment a
 * generative system invents policy. This one stops, says so, and shows the
 * scores that made it stop.
 */

const MAX = 300;

const SUGGESTIONS = [
  "How long are model inputs retained?",
  "Who has to approve a change to a production model?",
  "Can protected health information go to a public model?",
  "When can the system act without a human?",
  "Can this run fully on premises?",
  "What is the refund policy for late deliveries?",
];

export default function KnowledgeAssistantDemo() {
  const [question, setQuestion] = useState(SUGGESTIONS[0]);
  const { status, result, error, run, reset } = useDemoRun("knowledge");

  const tooShort = question.trim().length < 3;

  const submit = (e) => {
    e.preventDefault();
    if (tooShort) return;
    run({ question });
  };

  const ask = (q) => {
    setQuestion(q);
    run({ question: q });
  };

  return (
    <div className="ax-demo__split">
      <form className="ax-demo__controls" onSubmit={submit} aria-label="Knowledge base question">
        <label className="ax-demo__field">
          <span className="ax-demo__field-label">
            Question
            <em>
              {question.length}/{MAX}
            </em>
          </span>
          <textarea
            className="ax-demo__textarea"
            value={question}
            maxLength={MAX}
            rows={3}
            onChange={(e) => {
              setQuestion(e.target.value);
              if (status !== "idle") reset();
            }}
            placeholder="Ask something about the policy documents…"
          />
        </label>

        <div className="ax-demo__actions">
          <button
            type="submit"
            className="ax-demo__run"
            disabled={tooShort || status === "running"}
          >
            {status === "running" ? "Retrieving…" : "Ask"}
          </button>
        </div>

        <div className="ax-demo__suggest">
          <p className="ax-demo__suggest-title">Try one</p>
          <ul>
            {SUGGESTIONS.map((q, i) => (
              <li key={q}>
                <button type="button" onClick={() => ask(q)}>
                  {q}
                  {i === SUGGESTIONS.length - 1 && (
                    <em> — not in the corpus</em>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <p className="ax-demo__privacy">
          The corpus is ten short sample policy passages written for this demo.
          It is not AI Brigade&rsquo;s own documentation.
        </p>
      </form>

      <DemoShell
        path="knowledge · POST /ask"
        status={status}
        error={error}
        onRetry={() => run({ question })}
        emptyTitle="No question asked yet"
        emptyHint="Pick a suggestion or write your own."
        runningLabel="Retrieving passages"
        footer={
          result && (
            <>
              <span>{result.corpusSize} passages indexed · BM25</span>
              <span>{result.ms}ms</span>
            </>
          )
        }
      >
        {result && (
          <div className="ax-demo__result">
            {result.answered ? (
              <div className="ax-kb__answer">
                <span className="ax-kb__badge ax-kb__badge--ok">Answered from source</span>
                {result.answer.map((a, i) => (
                  <p key={`${a.citation}-${i}`} className="ax-kb__sentence">
                    {a.text}
                    <sup className="ax-kb__cite" title={`${a.doc} — ${a.section}`}>
                      {a.citation}
                    </sup>
                  </p>
                ))}
                <p className="ax-kb__extractive">
                  Every sentence above appears verbatim in the cited passage.
                  Nothing was generated.
                </p>
              </div>
            ) : (
              <div className="ax-kb__refusal">
                <span className="ax-kb__badge ax-kb__badge--stop">Refused — not in corpus</span>
                <p>{result.refusal}</p>
                {result.gate && (
                  <p className="ax-kb__gate">
                    Best passage scored {result.gate.score} against a floor of{" "}
                    {result.gate.scoreFloor}; question coverage {Math.round(result.coverage * 100)}%
                    against a floor of {Math.round(result.gate.coverageFloor * 100)}%.
                  </p>
                )}
                {result.topics && (
                  <div className="ax-kb__topics">
                    <p>What the corpus does cover:</p>
                    <ul>
                      {result.topics.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {result.passages.length > 0 && (
              <div className="ax-demo__block">
                <h3 className="ax-demo__block-title">Retrieved passages</h3>
                <ul className="ax-kb__passages">
                  {result.passages.map((p, i) => (
                    <li key={p.id} data-top={i === 0 ? "true" : undefined}>
                      <div className="ax-kb__passage-head">
                        <code>{p.id}</code>
                        <span className="ax-kb__passage-doc">
                          {p.doc} — {p.section}
                        </span>
                        <span className="ax-kb__passage-score">{p.score}</span>
                      </div>
                      <p className="ax-kb__passage-text">{p.text}</p>
                      {p.matched.length > 0 && (
                        <p className="ax-kb__matched">
                          matched: {p.matched.join(", ")}
                        </p>
                      )}
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
