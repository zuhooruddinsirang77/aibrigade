/**
 * The two legal documents, as content rather than markup.
 *
 * ⚠️  These are drafted to describe what this site and this business
 * actually do — the enquiry form that emails a mailbox over SMTP (see
 * app/api/contact/route.js), Google Tag Manager (the container id is in
 * app/layout.jsx), Vercel hosting, and the processor/controller split
 * that matters for a firm that builds systems on top of client data.
 * They are not legal advice and have not been reviewed by counsel.
 * Before this goes live, have a lawyer check it and confirm the four
 * things that cannot be inferred from the codebase:
 *
 *   1. the registered legal entity name and address (`ENTITY` below),
 *   2. the governing-law state and venue (`GOVERNING_LAW`),
 *   3. the retention periods in "How long we keep information",
 *   4. whether a UK/EU representative is required under Art. 27 GDPR.
 *
 * Each section is `{ id, heading, blocks }`. A block is a string
 * (paragraph), `{ list: [...] }`, `{ heading, list }` for a titled list,
 * or `{ note: "..." }` for a callout.
 */

export const ENTITY = "AI Brigade";
export const ENTITY_ADDRESS = "Perth Amboy, New Jersey, United States";
export const CONTACT_EMAIL = "contact@aibrigade.ai";
export const CONTACT_PHONE = "+1 (845) 300-2429";
export const GOVERNING_LAW = "the State of New Jersey, United States";
export const UPDATED = "22 September 2026";

export const legal = {
  "privacy-policy": {
    slug: "privacy-policy",
    kicker: "Legal",
    title: "Privacy Policy",
    updated: UPDATED,
    summary:
      "What we collect when you use aibrigade.ai or send us an enquiry, why we hold it, who it reaches, and how to have it removed. In short: we collect what you send us and a small amount of anonymous usage data. We do not sell anything to anyone.",
    sections: [
      {
        id: "who-we-are",
        heading: "Who we are",
        blocks: [
          `${ENTITY} builds production AI systems for financial services and healthcare organisations. This policy covers aibrigade.ai and any enquiry you send through it.`,
          `For the purposes of the UK and EU General Data Protection Regulation, ${ENTITY} is the data controller for the information described in this policy. Where we process information inside a system we have built for a client, that client is the controller and we act as their processor — see “Client data and the systems we build”.`,
          `You can reach us about anything in this policy at ${CONTACT_EMAIL}, or by post at ${ENTITY}, ${ENTITY_ADDRESS}.`,
        ],
      },
      {
        id: "what-we-collect",
        heading: "What we collect",
        blocks: [
          "We collect two kinds of information: what you choose to send us, and a small amount of technical data your browser reports automatically.",
          {
            heading: "Information you give us",
            list: [
              "Your name and email address, which the enquiry form requires.",
              "Your company, phone number, the type of work you are interested in, your budget range and your timeline — all optional, and all used only to route your enquiry to the right person.",
              "Whatever you write in the message field, and anything you send us by email, phone or during a call.",
              "Your acceptance of this policy, recorded with the enquiry so we can show the basis on which we hold it.",
            ],
          },
          {
            heading: "Information collected automatically",
            list: [
              "Standard server logs from our hosting provider: IP address, user agent, the pages requested and when. These are kept short-term for security and troubleshooting.",
              "Analytics events delivered through Google Tag Manager — pages viewed, approximate location at city level, device type, and how you arrived at the site.",
              "A record of enquiry submissions per connection, held in memory for ten minutes, used only to stop the same connection flooding the form.",
            ],
          },
          {
            note: "We do not ask for, and the site has no field for, financial details, government identifiers, health information or any other special category of personal data. Please do not send them to us in the message field.",
          },
        ],
      },
      {
        id: "how-we-use-it",
        heading: "How we use information",
        blocks: [
          {
            list: [
              "To read your enquiry and reply to it — this is the only reason the form exists.",
              "To prepare a proposal, a scope or an estimate you have asked for.",
              "To deliver and support work under a signed engagement.",
              "To keep the site working, secure and reasonably fast, and to understand in aggregate which pages are useful.",
              "To meet our legal, accounting and regulatory obligations.",
            ],
          },
          "We do not use your information to train models. We do not sell it, rent it, or share it with anyone for their own marketing. We do not add you to a mailing list because you sent an enquiry.",
        ],
      },
      {
        id: "legal-bases",
        heading: "Our legal bases",
        blocks: [
          "If you are in the United Kingdom, the European Economic Area or another region with similar law, we rely on the following bases:",
          {
            list: [
              "Consent — for analytics cookies, and for holding the enquiry you chose to send. You can withdraw it at any time.",
              "Legitimate interests — to respond to business enquiries, to secure the site and to keep records of the work we have done. We have weighed these against your rights and consider them proportionate.",
              "Performance of a contract — where we are delivering an engagement to you or your organisation.",
              "Legal obligation — where tax, accounting or regulatory rules require us to keep something.",
            ],
          },
        ],
      },
      {
        id: "cookies",
        heading: "Cookies and analytics",
        blocks: [
          "The site itself sets no advertising or tracking cookies of its own. Google Tag Manager loads analytics on our behalf, which sets first-party cookies to distinguish one visit from another and to measure how the site is used.",
          "Your browser can block or clear these at any time. Google also publishes an opt-out add-on for its analytics products. Blocking them does not affect any part of this site, including the enquiry form.",
          "Some pages store a small amount of data in your own browser — a preference, a remembered tab — which never leaves your device and is never sent to us.",
        ],
      },
      {
        id: "who-we-share-with",
        heading: "Who else sees it",
        blocks: [
          "A short list, and each one only gets what it needs to do its job:",
          {
            list: [
              "Our hosting and delivery provider, which serves the site and keeps server logs.",
              "Our email provider, which carries enquiry messages from the site to our mailbox and holds them there.",
              "Google, which provides the tag manager and analytics described above.",
              "Professional advisers — lawyers, accountants, auditors — where they need it and are bound to keep it confidential.",
              "A purchaser or successor, if the business or part of it is ever sold, under the same commitments made here.",
              "A court, regulator or law enforcement body, where we are legally required to produce it.",
            ],
          },
          "Each provider is bound by a written agreement to process information only on our instructions and to protect it appropriately.",
        ],
      },
      {
        id: "international",
        heading: "Where information goes",
        blocks: [
          `We work from the United States, the United Arab Emirates and Pakistan, and our providers operate globally. Information you send us may therefore be processed outside the country you are in, including in countries that have not been assessed as providing an equivalent standard of protection.`,
          "Where we transfer personal data out of the UK or the EEA we rely on the UK Addendum and the European Commission's Standard Contractual Clauses, together with any additional measures the transfer needs. You can ask us for details of the safeguards in place for a specific transfer.",
        ],
      },
      {
        id: "retention",
        heading: "How long we keep information",
        blocks: [
          {
            list: [
              "Enquiries that do not become engagements: up to 24 months from your last message, then deleted.",
              "Client records: for the life of the engagement and for as long afterwards as tax, accounting and limitation rules require.",
              "Server logs: short-term, on our provider's standard retention.",
              "Analytics: on the retention period configured in the analytics product, in aggregate form.",
            ],
          },
          "If you ask us to delete your enquiry sooner, we will, unless we are required to keep a copy.",
        ],
      },
      {
        id: "security",
        heading: "How we protect it",
        blocks: [
          "Traffic to and from this site is encrypted in transit. Mail credentials live only on the server and are never present in anything sent to your browser. Access to the enquiry mailbox is limited to the people who need it, and everyone working with client information is under a written confidentiality obligation.",
          "No system is perfectly secure, and we will not pretend otherwise. If a breach affects your information and is likely to present a risk to you, we will tell you and the relevant regulator within the time the law requires.",
        ],
      },
      {
        id: "your-rights",
        heading: "Your rights",
        blocks: [
          "Wherever you are, you can ask us to show you what we hold about you, correct it, or delete it. Depending on where you live you may also have the right to:",
          {
            list: [
              "object to processing we carry out on the basis of legitimate interests,",
              "ask us to restrict processing while a question about it is resolved,",
              "receive a copy in a portable, machine-readable format,",
              "withdraw consent at any time, without affecting anything done before you withdrew it,",
              "know the categories of personal information collected and disclosed, and to opt out of its sale or sharing — we do not sell or share personal information as those terms are defined under California law,",
              "be free from discrimination for exercising any of these rights.",
            ],
          },
          `Write to ${CONTACT_EMAIL} and we will respond within one month, or sooner where the law requires it. If you are not satisfied, you can complain to your data protection authority — in the UK, the Information Commissioner's Office.`,
        ],
      },
      {
        id: "client-data",
        heading: "Client data and the systems we build",
        blocks: [
          "This section matters more than the rest of this policy for anyone who engages us.",
          "When we build or operate a system that processes your organisation's data, your organisation remains the controller of that data and we act solely as its processor. What we may do with it is set by the engagement agreement and its data processing terms — not by this policy — and those terms always govern where they differ from anything written here.",
          {
            list: [
              "We process client data only on documented instructions from the client.",
              "We do not use client data to train models for ourselves or for anyone else.",
              "We do not move client data outside the environments agreed in writing, and in regulated engagements that usually means it never leaves the client's own infrastructure.",
              "Sub-processors are named, and a client can object to a new one before it is engaged.",
              "On termination we return or delete client data, at the client's choice.",
            ],
          },
          {
            note: "Please do not send confidential material through the enquiry form. Ask us for an NDA first — we will send one the same day — and we will give you a secure route for anything sensitive.",
          },
        ],
      },
      {
        id: "children",
        heading: "Children",
        blocks: [
          "This is a business-to-business site. It is not directed at children, and we do not knowingly collect information from anyone under 16. If you believe a child has sent us something, write to us and we will delete it.",
        ],
      },
      {
        id: "changes",
        heading: "Changes to this policy",
        blocks: [
          `We update this policy when what we do changes. The date at the top is the date of the current version, and material changes will be announced on this page before they take effect. This version is effective from ${UPDATED}.`,
        ],
      },
      {
        id: "contact",
        heading: "Contact us",
        blocks: [
          `Questions, requests and complaints about this policy all go to the same place: ${CONTACT_EMAIL}, or ${CONTACT_PHONE} during business hours, or by post to ${ENTITY}, ${ENTITY_ADDRESS}.`,
        ],
      },
    ],
  },

  "terms-of-use": {
    slug: "terms-of-use",
    kicker: "Legal",
    title: "Terms of Use",
    updated: UPDATED,
    summary:
      "The terms on which you may use aibrigade.ai. They cover the site itself — what is on it, what you may do with it, and the limits of what it promises. They are not the terms of any engagement: that is a separate signed agreement.",
    sections: [
      {
        id: "agreement",
        heading: "Agreement to these terms",
        blocks: [
          `These terms are between you and ${ENTITY}. By using aibrigade.ai you accept them. If you do not accept them, please do not use the site.`,
          "If you are using the site on behalf of an organisation, you confirm you are authorised to accept these terms for that organisation, and “you” means both of you.",
        ],
      },
      {
        id: "the-site",
        heading: "What this site is",
        blocks: [
          "This site describes what we do and how to reach us. Everything on it — the case studies, the metrics, the process descriptions, the estimates of what a system can achieve — is provided for information.",
          {
            note: "Nothing on this site is an offer, a quote, a warranty of any outcome, or professional advice. No engagement begins, and no obligation on either side arises, until there is a written agreement signed by both parties.",
          },
        ],
      },
      {
        id: "acceptable-use",
        heading: "Using the site",
        blocks: [
          "You may read the site, print or save pages for your own reference, and share links to it. You may not:",
          {
            list: [
              "copy, republish or resell its content as your own, or present our case studies or descriptions as your work;",
              "use automated means to scrape, harvest or bulk-download it, or to mine it for training data, except for search engine indexing under our robots directives;",
              "probe, scan, overload or attempt to gain unauthorised access to the site, its API or the infrastructure behind it;",
              "submit anything unlawful, defamatory, infringing, malicious or designed to interfere with the site or anyone using it;",
              "misrepresent who you are or what organisation you act for;",
              "remove or obscure any notice of ownership on anything you take from the site.",
            ],
          },
          "We may suspend or block access where we reasonably believe any of the above is happening.",
        ],
      },
      {
        id: "intellectual-property",
        heading: "Ownership",
        blocks: [
          `The site and everything in it — text, design, code, diagrams, logos and the arrangement of it all — belongs to ${ENTITY} or to those who licensed it to us, and is protected by copyright, trade mark and other laws. Nothing here transfers any of it to you.`,
          "Client names, logos and product screenshots appear with permission and remain the property of their owners. Their appearance here is not an endorsement of you or of anyone else.",
          "Ownership of anything we build under an engagement is set by that engagement's agreement, not by this page.",
        ],
      },
      {
        id: "submissions",
        heading: "What you send us",
        blocks: [
          "You are responsible for what you send through the enquiry form or by email, and for having the right to send it.",
          "Please do not send confidential or sensitive material before there is an NDA in place. Anything you do send us without one is received on a non-confidential basis, and we cannot be responsible for holding it in confidence — ask us for an NDA first and we will send one.",
          "If you send us feedback, a suggestion or an idea about the site or our services, you grant us a free, perpetual, worldwide licence to use it, without obligation or payment. This does not apply to anything covered by a signed NDA or engagement agreement, which always takes precedence.",
        ],
      },
      {
        id: "ai-outputs",
        heading: "AI systems and outputs",
        blocks: [
          "Any demonstration, sample output, benchmark or figure shown on this site is illustrative. AI systems are probabilistic: their output varies with the data, the prompt, the model version and the environment they run in, and results achieved for one organisation do not guarantee the same results for another.",
          "Nothing on this site should be relied on as financial, clinical, legal or regulatory advice, or used as the sole basis for a decision that affects a person. Systems we build for regulated use are specified, tested and governed under their own engagement agreement, which is where any commitment about performance, accuracy or human oversight is made.",
        ],
      },
      {
        id: "third-party",
        heading: "Links and third-party services",
        blocks: [
          "The site links to places we do not control — client sites, professional networks, review platforms. We are not responsible for their content, their practices or their privacy policies, and a link is not an endorsement. Their terms apply when you are there, not ours.",
          "Parts of this site depend on third-party services for hosting, media delivery and analytics. Their availability is not something we can guarantee.",
        ],
      },
      {
        id: "availability",
        heading: "Availability and changes",
        blocks: [
          "We may change, suspend or withdraw any part of the site at any time, and we may update these terms. The date at the top is the date of the current version; continuing to use the site after a change means you accept the updated terms.",
          "We do not promise the site will be uninterrupted, timely, error-free, or that its content is complete or current at any given moment.",
        ],
      },
      {
        id: "disclaimers",
        heading: "Disclaimers",
        blocks: [
          "To the fullest extent the law allows, the site and its content are provided “as is” and “as available”, without warranty of any kind, express or implied, including any implied warranty of merchantability, fitness for a particular purpose, non-infringement, accuracy or freedom from harmful code.",
          "Some jurisdictions do not allow the exclusion of certain warranties. Where that is so, the exclusions above apply only as far as that jurisdiction permits, and nothing here limits liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot lawfully be limited.",
        ],
      },
      {
        id: "liability",
        heading: "Limitation of liability",
        blocks: [
          `To the fullest extent the law allows, ${ENTITY} and its people will not be liable for any indirect, incidental, special, consequential or punitive loss, or for lost profit, revenue, data, goodwill or business opportunity, arising out of your use of this site — whether the claim is in contract, tort, statute or otherwise, and whether or not we were told such loss was possible.`,
          "Our total liability arising out of or relating to this site will not exceed one hundred US dollars (US$100). Liability under a signed engagement agreement is governed by that agreement instead, and this limit does not apply to it.",
        ],
      },
      {
        id: "indemnity",
        heading: "Indemnity",
        blocks: [
          `You agree to indemnify ${ENTITY} against any claim, loss or reasonable cost arising from your breach of these terms, your misuse of the site, or your infringement of anyone's rights through it.`,
        ],
      },
      {
        id: "privacy",
        heading: "Privacy",
        blocks: [
          "Our Privacy Policy explains what we collect through this site and what we do with it. It forms part of these terms.",
        ],
      },
      {
        id: "governing-law",
        heading: "Governing law",
        blocks: [
          `These terms, and any dispute arising out of them or out of your use of the site, are governed by the laws of ${GOVERNING_LAW}, without regard to its conflict-of-law rules. The state and federal courts located there have exclusive jurisdiction, and both parties submit to it.`,
          "If you are a consumer resident in a jurisdiction whose law gives you the right to bring proceedings locally or to the protection of mandatory local law, nothing here removes that right.",
        ],
      },
      {
        id: "general",
        heading: "General",
        blocks: [
          {
            list: [
              "If any provision of these terms is found unenforceable, the rest continues in force and the unenforceable part is read as narrowly as necessary to make it valid.",
              "Not enforcing a term on one occasion is not a waiver of it on another.",
              "These terms, together with the Privacy Policy, are the whole agreement between us about the site, and replace anything said about it before.",
              "You may not assign these terms; we may assign them as part of a reorganisation or sale of the business.",
            ],
          },
        ],
      },
      {
        id: "contact",
        heading: "Contact us",
        blocks: [
          `Questions about these terms go to ${CONTACT_EMAIL}, or ${ENTITY}, ${ENTITY_ADDRESS}.`,
        ],
      },
    ],
  },
};

export const getLegal = (slug) => legal[slug] || null;
