import { NextResponse } from "next/server";

import * as fraud from "./_engines/fraud";
import * as extraction from "./_engines/extraction";
import * as intent from "./_engines/intent";
import * as knowledge from "./_engines/knowledge";

/**
 * The one endpoint behind every demo on /demos.
 *
 * Why a server route at all, when the arithmetic could run in the browser:
 * because the architecture is part of what the page is demonstrating. In a
 * real deployment the model, the policy set and the corpus are things a
 * customer does not hand to the client, and the boundary they sit behind is
 * where validation, rate limiting and audit belong. Running the demos the
 * same way keeps the shape honest — and keeps the engines out of the
 * JavaScript bundle, where anyone could read the thresholds.
 *
 * Security posture, deliberately the same as app/api/contact/route.js:
 *
 *   - No secrets. These engines read no environment variable and call no
 *     third party, so there is nothing here to leak and no key to rotate.
 *     That is a design choice, not an omission: a public demo endpoint
 *     holding a model-provider key is an invoice waiting to happen.
 *   - Every input is type-checked and length-capped HERE, on the server,
 *     regardless of what the client already did. The client is not a
 *     validator; it is a convenience.
 *   - Errors are answered as a short sentence. No stack, no engine
 *     internals, no upstream detail. The real error goes to the log.
 *   - Responses are explicitly uncacheable — they are a function of
 *     visitor input and must never be served to the next visitor.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Free text arriving from the page. The engines are linear-time in the
   length of their input (see the regex note in _engines/extraction.js), so
   these caps are about response size and courtesy rather than safety — but
   they are the outer bound either way. */
const LIMITS = {
  text: 6000,
  utterance: 400,
  question: 300,
};

/* Per-instance, in-memory, and understood to be exactly that: it resets on
   a cold start and is not shared between lambdas, so it is a brake on a
   stuck key-repeat or a naive script rather than a defence against a
   determined one. Real rate limiting belongs at the edge. The window is
   looser than the contact form's because these demos are meant to be
   played with — a reader dragging a slider is a legitimate burst. */
const WINDOW_MS = 60 * 1000;
const MAX_IN_WINDOW = 60;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (!times.some((t) => now - t < WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > MAX_IN_WINDOW;
}

const text = (v, max) => String(v ?? "").slice(0, max);

/**
 * Each demo declares how to validate its own input and how to run it. A
 * demo that is not in this table does not exist as far as the endpoint is
 * concerned — there is no dynamic dispatch on a visitor-supplied name.
 */
const DEMOS = {
  fraud: {
    validate: (input) => {
      // Everything is clamped inside the engine; the only way to be wrong
      // here is to send something that is not an object at all.
      if (input === null || typeof input !== "object" || Array.isArray(input)) {
        return "Expected a transaction object.";
      }
      return null;
    },
    run: (input) => fraud.run(input),
  },

  extraction: {
    validate: (input) => {
      const body = text(input?.text, LIMITS.text).trim();
      if (body.length < 20) return "Paste at least 20 characters of document text.";
      return null;
    },
    run: (input) => extraction.run({ text: text(input?.text, LIMITS.text) }),
  },

  intent: {
    validate: (input) => {
      const utterance = text(input?.utterance, LIMITS.utterance).trim();
      if (utterance.length < 3) return "Type what the customer said.";
      return null;
    },
    run: (input) => intent.run({ utterance: text(input?.utterance, LIMITS.utterance) }),
  },

  knowledge: {
    validate: (input) => {
      const question = text(input?.question, LIMITS.question).trim();
      if (question.length < 3) return "Ask a question about the knowledge base.";
      return null;
    },
    run: (input) => knowledge.run({ question: text(input?.question, LIMITS.question) }),
  },
};

const uncacheable = (payload, status = 200) =>
  NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "no-store" },
  });

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return uncacheable({ ok: false, error: "Malformed request." }, 400);
  }

  const name = String(body?.demo ?? "");
  const demo = Object.prototype.hasOwnProperty.call(DEMOS, name) ? DEMOS[name] : null;
  if (!demo) {
    return uncacheable({ ok: false, error: "Unknown demo." }, 404);
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return uncacheable(
      { ok: false, error: "That is a lot of runs in a short time. Give it a moment and try again." },
      429
    );
  }

  const input = body?.input;
  const invalid = demo.validate(input);
  if (invalid) {
    return uncacheable({ ok: false, error: invalid }, 422);
  }

  try {
    const result = demo.run(input);
    return uncacheable({ ok: true, demo: name, result });
  } catch (err) {
    /* The visitor gets a sentence. The detail goes to the server log, which
       is the only place it belongs — an error page that prints a stack is
       a free map of the codebase. */
    console.error(`[demos] ${name} failed:`, err);
    return uncacheable(
      { ok: false, error: "The demo could not complete that run. Please try again." },
      500
    );
  }
}

/* A GET here would be a cached, shareable URL containing whatever the
   visitor typed. Say no explicitly rather than 405-ing by accident. */
export async function GET() {
  return uncacheable({ ok: false, error: "Use POST." }, 405);
}
