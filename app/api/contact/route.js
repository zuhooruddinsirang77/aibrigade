import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

/**
 * Enquiry delivery over SMTP.
 *
 * The site had no server side at all: PopupForm validated its fields and
 * then called `setDone(true)` — the visitor was told "your submission has
 * been received" and nothing had been received by anyone. This is the
 * endpoint /contact posts to, and it is deliberately the only place the
 * mail credentials are read, so they stay out of the client bundle.
 *
 * Configuration (all from the environment, never hard-coded — see
 * .env.example):
 *
 *   SMTP_HOST      smtp.your-provider.com
 *   SMTP_PORT      587 (STARTTLS) or 465 (implicit TLS)
 *   SMTP_SECURE    "true" only for port 465; 587 upgrades via STARTTLS
 *   SMTP_USER      mailbox / API user
 *   SMTP_PASS      password or app-specific token
 *   CONTACT_TO     where enquiries land (comma-separated for several);
 *                  CONTACT_TO_EMAIL is accepted as an alias
 *   CONTACT_FROM   the envelope sender (SMTP_FROM accepted as an alias,
 *                  a bare address gets the "AI Brigade Website" name) — must be an address the SMTP
 *                  account is allowed to send as, which is why the
 *                  visitor's own address goes in Reply-To instead
 *   CONTACT_AUTOREPLY  "true" to also acknowledge to the sender
 */

// nodemailer opens a TCP socket; the edge runtime has no net module.
export const runtime = "nodejs";
// Nothing here is cacheable, and a cached POST route would be a silent
// black hole for enquiries.
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LIMIT_WINDOW_MS = 10 * 60 * 1000;
const LIMIT_MAX = 5;
/* Per-instance, in-memory, and that is understood: on serverless this
   resets with every cold start and is not shared between lambdas, so it is
   a courtesy brake on a stuck submit button rather than a defence. The
   honeypot below is what actually catches bots; a real rate limit belongs
   at the edge, not here. */
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < LIMIT_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (!times.some((t) => now - t < LIMIT_WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > LIMIT_MAX;
}

const clean = (v, max = 2000) => String(v ?? "").trim().slice(0, max);

const escape = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/* Header injection: a newline in a field that ends up in Subject or
   Reply-To would let a submitter append headers of their own. */
const oneLine = (v) => clean(v, 200).replace(/[\r\n]+/g, " ");

function transport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  const port = Number(SMTP_PORT) || 587;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    // Implicit TLS on 465, STARTTLS on everything else.
    secure: SMTP_SECURE ? SMTP_SECURE === "true" : port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

function render(data) {
  const rows = [
    ["Name", data.name],
    ["Email", data.email],
    ["Company", data.company],
    ["Phone", data.phone],
    ["Interested in", data.topic],
    ["Budget", data.budget],
    ["Timeline", data.timeline],
  ].filter(([, v]) => v);

  const text = [
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "Message:",
    data.message,
    "",
    `Sent from ${data.source} at ${new Date().toISOString()}`,
  ].join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f7f5fb;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#17161b;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 12px 32px rgba(63,22,110,.1);">
      <tr>
        <td style="background:linear-gradient(90deg,#672ca9,#3f166e);padding:24px 28px;color:#fff;">
          <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;opacity:.75;">AI Brigade</div>
          <div style="font-size:20px;font-weight:600;margin-top:6px;">New enquiry from ${escape(
            data.name
          )}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 28px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;">
            ${rows
              .map(
                ([k, v]) => `<tr>
              <td style="padding:7px 0;color:#7a7683;width:130px;vertical-align:top;">${escape(k)}</td>
              <td style="padding:7px 0;font-weight:500;">${escape(v)}</td>
            </tr>`
              )
              .join("")}
          </table>
          <div style="margin-top:20px;padding-top:20px;border-top:1px solid rgba(22,29,37,.1);">
            <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#7a7683;margin-bottom:8px;">Message</div>
            <div style="font-size:15px;line-height:1.6;white-space:pre-wrap;">${escape(
              data.message
            )}</div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 28px;background:#f7f5fb;font-size:12px;color:#7a7683;">
          Sent from ${escape(data.source)} · ${new Date().toUTCString()}
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { text, html };
}

function acknowledgement(data) {
  const first = data.name.split(" ")[0];

  const text = `Hi ${first},

Thanks for reaching out to AI Brigade. Your message is with our team and
someone will come back to you within one business day.

For reference, here is what you sent:

${data.message}

— AI Brigade
contact@aibrigade.ai · +1 (845) 300-2429`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f7f5fb;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#17161b;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 12px 32px rgba(63,22,110,.1);">
      <tr>
        <td style="background:linear-gradient(90deg,#672ca9,#3f166e);padding:26px 28px;color:#fff;">
          <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;opacity:.75;">AI Brigade</div>
          <div style="font-size:20px;font-weight:600;margin-top:6px;">We have your message</div>
        </td>
      </tr>
      <tr>
        <td style="padding:26px 28px;font-size:15px;line-height:1.65;">
          <p style="margin:0 0 14px;">Hi ${escape(first)},</p>
          <p style="margin:0 0 14px;">Thanks for reaching out. Your message is with our team and someone will come back to you within one business day.</p>
          <div style="margin:20px 0;padding:16px 18px;background:#f7f5fb;border-left:3px solid #9248e4;border-radius:8px;font-size:14px;white-space:pre-wrap;color:#4a4754;">${escape(
            data.message
          )}</div>
          <p style="margin:0;color:#7a7683;font-size:13px;">AI Brigade · contact@aibrigade.ai · +1 (845) 300-2429</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { text, html };
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  /* The honeypot is a field hidden from people and left empty by them;
     anything that fills it is filling the form blind. Answer 200 rather
     than 4xx — a bot told it failed just retries with the field dropped. */
  if (clean(body.website)) {
    return NextResponse.json({ ok: true });
  }

  const data = {
    name: oneLine(body.name),
    email: oneLine(body.email).toLowerCase(),
    company: oneLine(body.company),
    phone: oneLine(body.phone),
    topic: oneLine(body.topic),
    budget: oneLine(body.budget),
    timeline: oneLine(body.timeline),
    message: clean(body.message, 5000),
    source: oneLine(body.source || "aibrigade.ai/contact"),
  };

  /* The client validates the same rules for the sake of instant feedback,
     but the client is not where they are enforced — this endpoint is
     reachable without it. */
  const errors = {};
  if (data.name.length < 2) errors.name = "Please tell us your name.";
  if (!EMAIL_RE.test(data.email)) errors.email = "Please enter a valid email address.";
  if (data.message.length < 10) errors.message = "Please add a little more detail.";
  if (!body.consent) errors.consent = "Please accept the privacy policy to continue.";
  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many messages from this connection. Please try again shortly." },
      { status: 429 }
    );
  }

  const mailer = transport();
  /* `CONTACT_TO_EMAIL` and `SMTP_FROM` are accepted as aliases: a local
     .env was written with those names, and a deployment configured the
     same way would otherwise fall back to SMTP_USER without saying so. */
  const to = process.env.CONTACT_TO || process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;
  if (!mailer || !to) {
    /* Never swallow this into a fake success: a misconfigured deployment
       that answers "thank you" loses every enquiry silently, which is the
       exact failure this endpoint exists to end. */
    console.error(
      "[contact] SMTP is not configured — set SMTP_HOST, SMTP_USER, SMTP_PASS, CONTACT_TO."
    );
    return NextResponse.json(
      {
        ok: false,
        error:
          "Our contact form is temporarily unavailable. Please email contact@aibrigade.ai directly.",
      },
      { status: 503 }
    );
  }

  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
  const from =
    process.env.CONTACT_FROM ||
    (fromAddress.includes("<") ? fromAddress : `AI Brigade Website <${fromAddress}>`);
  const subjectWho = data.company ? `${data.name} · ${data.company}` : data.name;
  const { text, html } = render(data);

  try {
    await mailer.sendMail({
      from,
      to,
      // The visitor is not the sender — SPF/DKIM stay aligned to our own
      // domain — but hitting Reply in the inbox has to reach them.
      replyTo: `${data.name} <${data.email}>`,
      subject: `New enquiry — ${subjectWho}`,
      text,
      html,
    });
  } catch (err) {
    console.error("[contact] send failed:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "We could not send your message. Please email contact@aibrigade.ai directly.",
      },
      { status: 502 }
    );
  }

  if (process.env.CONTACT_AUTOREPLY === "true") {
    /* Best effort by design. The enquiry is already delivered at this
       point, so a bounced acknowledgement must not turn a successful
       submission into an error the visitor sees. */
    try {
      const ack = acknowledgement(data);
      await mailer.sendMail({
        from,
        to: `${data.name} <${data.email}>`,
        replyTo: to,
        subject: "We have your message — AI Brigade",
        text: ack.text,
        html: ack.html,
      });
    } catch (err) {
      console.error("[contact] acknowledgement failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
