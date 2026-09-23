# Home page copy — "AI That Does the Work"

Source: `Agentic_AI_That_Does_The_Work_Executive_Deck.pdf` (12 slides).
Target: `app/page.jsx` and the components it mounts.

This is a **content spec**. Every block below names the file and line that
held the old string, the deck slide it now has to carry, and the replacement
copy.

> **Status: applied.** All of this is in the code. Line numbers below refer to
> where each string sat *before* the rewrite, so they are useful for reading
> the diff and stale for navigating the current files. See **As built** at the
> end for the four places the implementation departed from this spec.

---

## The shift, in one line

The site currently sells **a consultancy** — *"Intelligence, engineered for
production… from first discovery to a system your team runs every day"*, scoped
to Fintech & HealthTech, structured as Discover → Design → Build → Deploy →
Scale.

The deck sells **an execution layer** — *"AI that does the work"*, scoped to six
verticals, structured as Identify → Prove → Measure → Scale, and it closes on a
question rather than a service menu: *"Bring us one problem."*

Three consequences run through every section:

1. **The subject of every sentence changes.** Today the subject is *we* ("we
   design", "we build", "our engineers"). In the deck the subject is *the
   agent* ("scores suspicious activity", "captures outcomes", "escalates
   exceptions"). Copy that says what we do gets rewritten to say what the
   system does once it is running.
2. **Two verticals become six.** Fintech and HealthTech stay, and retail,
   customer operations, industrial and energy join them. Every place the page
   currently hardcodes "fintech and healthtech" is a rewrite.
3. **Proof before promise.** The deck never claims an outcome without naming
   the thing that was built. Where the current page reaches for a superlative
   ("cutting-edge", "production-grade", "trusted"), the replacement names an
   artifact instead.

### Voice rules carried over from the deck

- **Keep the hedges.** The deck writes *"supported banking workflows"*, not
  "banking workflows"; *"creates explainable intervention context"*, not
  "stops fraud". Those qualifiers are doing legal work. They survive the port.
- **No invented metrics.** The deck contains no percentages, no ROI, no
  headcount saved. Nothing below introduces one either.
- **The arrow is the brand.** `LISTEN → UNDERSTAND → REASON → ACT` is the
  deck's signature device. It appears in the hero, the architecture section and
  the capability cards — the same four words, in the same order, three times.

---

## 0. Page metadata

**`app/layout.jsx:81–95`**

| Slot | Now | New |
|---|---|---|
| `title` | AI Brigade \| Custom AI Systems for FinTech & HealthTech | **AIBrigade \| AI That Does the Work** |
| `description` | "…copilots, automation agents, GPT platforms, and decision intelligence workflows — for FinTech and HealthTech companies, from initial discovery through production deployment." | **"Enterprise AI that listens, understands, reasons, connects to the systems you already run — and executes real business workflows. Agentic AI for fintech, healthtech, retail, customer operations, industrial and energy."** |
| `openGraph.title` | (same as title) | **AIBrigade \| AI That Does the Work** |
| `openGraph.description` | (shortened title copy) | **"Most enterprise AI stops at the answer. We build the kind that does the work — understands, reasons, and executes inside the systems you already own."** |

---

## 1. Hero — Slide 1

**`components/Hero.jsx`**

| Slot | Line | New copy |
|---|---|---|
| Kicker | 85 | `Listen → Understand → Reason → Act` |
| H1 (`MaskHeading`, `\n` = line break) | 87–89 | `AI that\ndoes the\nwork.` |
| Lede | 95–101 | **Enterprise AI that listens, understands, reasons, connects to the systems you already run — and executes real business workflows. Not one more answer for somebody on your team to act on.** |
| Primary CTA | 123 | `Bring us one problem` |
| Ghost CTA | 147 | `See what we've built` |
| Trust chips (`ax-hero__trust`) | 163–169 | `Fintech` · `Healthtech` · `Retail` · `Customer operations` · `Industrial` · `Energy` |
| Ticker label | 197 | `Trusted by teams at` *(unchanged)* |

**On the H1.** The deck's own title is *"AI That Does the Work."* — four words,
full stop, no subtitle needed. It fits the existing three-line `MaskHeading`
shape exactly, so the animation needs no change.

**On the chips.** They currently list what we build (`AI agents`, `Decision
intelligence`, `Automation`, `HIPAA-compliant infrastructure`). The deck puts
the six verticals in that position on slide 1, and the vertical row is the
thing that tells a reader in two seconds whether this page is for them. The
capability vocabulary moves down to the Services strip (§7), where it is no
longer competing with the claim.

**On the CTA.** `Book a technical review` (`Navbar.jsx:96`, and quoted in the
hero comment at 115–122) directly contradicts slide 10 — *"You should not need
to choose a model, design a RAG architecture or define an agent framework
before talking to us."* A button asking for a **technical** review asks for
exactly the readiness the deck says not to require. `Bring us one problem` is
the deck's own ask, and it is short enough for the nav bar.

> **One change outside this file:** `CTA_LABEL` at `Navbar.jsx:96` must change
> with it. The Hero comment at 115–122 exists specifically to keep those two
> strings identical; it should be updated to explain the new reasoning rather
> than left describing a decision that no longer applies.

---

## 2. WhyUs — Slide 4, "What we've already taught AI to do"

**`components/data.js:3–55`** (`whyUs`) and **`components/WhyUs.jsx:387–396`**

### Section head

| Slot | Line | New copy |
|---|---|---|
| Kicker | 387 | `Our actual capability` |
| H2 | 389–392 | `What we've already\ntaught AI to do` |
| Lede | 393–396 | **These are the reusable building blocks behind new client solutions. Your use case becomes the next workflow.** |

### The cards — 6 become 8

The deck's slide 4 is eight capabilities, and they are the page's spine: the
first four are the hero's arrow, in order. The current six cards are vertical
use cases (fraud detection, underwriting, clinical documentation…), which now
belong in Services (§7) where the verticals are the organising idea.

| # | Title | `domain` | Body | `icon` |
|---|---|---|---|---|
| 1 | **Listen** | Input | Multilingual voice and speech, across phone, web and mobile — the conversation starts wherever the customer already is. | `waveform` *(new)* |
| 2 | **Understand** | Input | Intent, documents and enterprise knowledge. The request is read against what your organisation actually knows, not against a generic model's guess. | `document` |
| 3 | **Reason** | Judgement | Models, rules and business context together. The reasoning step is where a policy your team owns meets a model's output. | `pulse` |
| 4 | **Decide** | Judgement | Risk, policy, confidence and approvals. Where the threshold sits is a business decision, and it lives somewhere your risk team can change it. | `scale` |
| 5 | **Act** | Execution | APIs, applications and workflows. This is the step most enterprise AI skips: the system does the thing, in the system of record, and the record proves it did. | `automation` |
| 6 | **Communicate** | Execution | Voice, web, mobile and outbound. The agent closes its own loop — it tells the customer, the queue and the operator what just happened. | `network` |
| 7 | **Escalate** | Control | Human-in-the-loop wherever judgement is required. The handoff is designed first, not added after the first incident. | `shield` |
| 8 | **Operate privately** | Control | Cloud, on-prem, hybrid or air-gapped. Regulated teams get the capability without sending sensitive data to public AI. | `lock` *(new)* |

**Build note.** `WHYUS_ICONS` (`WhyUs.jsx:12`) holds six keys: `shield`,
`automation`, `document`, `pulse`, `scale`, `network`. Two new SVGs are needed —
`waveform` and `lock`. `Infrastructure.jsx:60–66` already contains a `lock`
glyph drawn in the identical style (24×24, `strokeWidth="1.4"`, round caps);
lift it rather than draw a second one.

**Layout note.** The row is a GSAP horizontal scroll whose travel is measured
from `scrollWidth - clientWidth` (`WhyUs.jsx`, the `measure()` function), so
eight cards need no tuning — the distance is derived, not tabled.

**Card keys to keep:** `bg`, `animWrapCls`, `animCls`, `grad` are layout
decoration and carry over positionally. The `domain` field currently prints
"Fintech"/"Healthtech" on each card; these eight are cross-sector, so it becomes
the four-phase grouping above (Input / Judgement / Execution / Control), which
also gives the row a readable rhythm as it scrolls.

---

## 3. DecisionPath — Slide 2, "Most enterprise AI still stops at the answer"

**`components/motion/DecisionPath.jsx:53–101`** (`STAGES`) and **`212–228`** (head)

This section already draws the deck's central diagram — a request crossing six
nodes — so it becomes slide 2's argument told as a trace. The current six
stages are fraud-specific (`feature store`, `risk model v3.2`); the new six are
the deck's arrow plus the two things slide 5 lists under the execution layer
(*Human Control*, *Audit*).

### Section head

| Slot | Line | New copy |
|---|---|---|
| Kicker | 213–215 | `03` `The difference` |
| H2 | 216–220 | `Most AI stops\nat the answer` |
| Lede | 221–227 | **Traditional AI: you ask, it answers, and a human still does the work. The value gap opens after the model responds. This is the other shape — one request, from the moment it arrives to the record of what the system did about it.** |

### The six stages

| # | `node` | `title` | `payload` | `text` |
|---|---|---|---|---|
| 1 | `listen` | The request arrives | `POST /intake · req_8f2a41` | A call, a message, a transaction, a scheduled event. One endpoint, called from the systems you already run — no migration, no second source of truth. |
| 2 | `understand` | It reads it against what you know | `retrieve · policy_v14 + 3 docs` | Intent and documents resolved against governed enterprise knowledge, so the answer is grounded in your approved sources rather than the model's general impression of your industry. |
| 3 | `reason` | Models, rules and context together | `reason · ctx=account+policy` | The model proposes; your business context constrains. Neither one decides alone, which is what makes the outcome defensible later. |
| 4 | `decide` | Your policy sets the threshold | `policy · auto \| review \| hold` | Risk, confidence and approval limits live in a policy your team owns and can change without a deployment. Where the line sits is a business decision, not a modelling one. |
| 5 | `act` | It executes, or it escalates | `execute · 2 calls · 1 escalation` | Inside the supported workflow, the agent does the work — updates the record, sends the message, moves the case. Outside it, a person gets the decision with the context already assembled. |
| 6 | `audit` | Everything is written down | `audit · immutable · 6 entries` | Inputs, knowledge versions, model version, policy version, what was done and who approved it. Every action this system has ever taken can be reconstructed exactly as it was taken. |

**Copy that survives verbatim** (it was already right, just aimed at a narrower
case): *"a business decision, not a modelling one"*, *"lives in a policy your
risk team owns and can change without a deployment"*, and the audit
reconstruction sentence. Those three are the strongest lines on the current
page and the deck's slide 5 says the same thing less well.

**One line to delete.** The current lede opens *"The console on the first
screen answers a transaction in 22 milliseconds."* The hero no longer has that
console, so the sentence already points at nothing. It goes, and the 22ms
figure goes with it — there is no source for it on this page.

---

## 4. Cases — Slide 3, "Built. Not conceptual."

**`components/Cases.jsx:32–50`** (`ACTS`), **`110–119`** (head), **`226–246`** (CTA card)

### Section head

| Slot | Line | New copy |
|---|---|---|
| Kicker | 110 | `Proof before promise` |
| H2 | 112–115 | `Built.\nNot conceptual.` |
| Lede | 116–119 | **Our product portfolio demonstrates the core capabilities required to make enterprise agents useful in the real world — not in a pitch.** |

### The three acts

The three case pages (`/icu`, `/halyk`, `/uub`) stay where they are; only the
framing changes. Each act now leads with the **workflow chain** the deck uses
on slide 3, then names the client.

| # | `sector` / `client` | `title` | `body` |
|---|---|---|---|
| 1 | Fintech · ICU Capital | **Transaction → score → explain → intervene** | Live fraud detection for a self-contained asset and investment management company. The agent scores activity as it happens, builds the explainable context a reviewer needs to act, and routes the case — rather than filling a queue somebody has to work through afterwards. |
| 2 | Fintech · Meridian Capital | **Request → reason → decide → write back** | Underwriting for a leading investment bank. The clear files are decided straight through against a policy the risk team owns; the files that need judgement arrive at an analyst with the reasoning already assembled. Every decision stays auditable. |
| 3 | Healthtech · UUB Health | **Listen → draft → approve → write back** | A documentation agent inside a multi-site clinical network. It drafts in the chart the clinician already has open, integrated with Epic via HL7 FHIR, and never writes back without a human approving the write. |

### The closing card

`Will / your <app> / be next?` (lines 228–234) is a consumer-app line on a page
selling enterprise execution, and it has nothing to do with the deck.

| Slot | Line | New copy |
|---|---|---|
| Line 1 | 228 | `Bring` |
| Line 2 | 231–233 | `us one <problem>` *(keeps the `<` `>` treatment)* |
| Line 3 | 234 | `to start.` |
| Button | 245 | `Bring us one problem` |

---

## 5. ProjectShowcase — Slide 3, the product portfolio

**`components/projects/ProjectShowcase.jsx:90–99`**

| Slot | Line | New copy |
|---|---|---|
| Kicker | 90 | `The portfolio` |
| H2 | 91–93 | `Demo-ready.\nNot slideware.` |
| Lede | 94–99 | **Eight AI products you can watch run, in the languages they ship in. Reusable engineering capabilities behind each one — which is why a new workflow starts from proven components rather than from a blank page.** |

> **Discrepancy to settle.** Slide 3 says *"Seven demo-ready AI products."*
> `components/projects.data.js` holds **eight**: Fitzy, InCall, Fraud
> Detection, AutoVista, Axon, RM2, AI Zakat Engine, QuickBite AI (formerly listed as Foodpanda). The copy above
> says eight because the page shows eight. Either the deck is one behind the
> portfolio, or one of these eight is not demo-ready and should be cut from the
> showcase — worth confirming before this ships, since the two artefacts will
> be read side by side.

The four the deck singles out — **AXON**, **LIVE Fraud**, **Outbound AI**,
**Private LLM** — map to Axon, Fraud Detection, InCall and the private
knowledge assistant on `/demos`. Consider ordering the showcase so those four
lead.

---

## 6. Environments — Slide 5, "Don't replace your systems"

**`components/video.data.js:161–194`** (`environments`) and **`Environments.jsx:123–133`**

### Section head

| Slot | Line | New copy |
|---|---|---|
| Kicker | 123 | `Low-disruption transformation` |
| H2 | 124–126 | `Don't replace your systems.\nPut intelligence across them.` |
| Lede | 127–133 | **Agentic AI can sit across the technology estate you already own — reasoning, retrieval, voice, rules, workflow, tool use, human control and audit, in one layer above the systems that already hold your data.** |

### The four tabs

Same four films, re-aimed at slide 5's estate list (core banking, EHR, CRM,
ERP, WMS/POS, contact center, data/APIs, IoT/OT).

| `id` | `film` | `kicker` | `label` | `line` | `tags` |
|---|---|---|---|---|---|
| `banking` | `operations` | Core banking | **The banking floor** | Agents that work supported service requests, disputes, reconciliation and exception queues against the core you already run — and hand a person the file that needs judgement. | Core banking · Contact center · Audit trail |
| `clinical` | `geneEditing` | EHR | **The clinical floor** | Scheduling, eligibility, billing follow-up and documentation that move before staff have to chase them, drafted inside the chart the clinician already has open. | HL7 FHIR · Human-in-the-loop · Approval gate |
| `floor` | `logistics` | WMS / POS | **The store and the warehouse** | Hands-free stock, location and movement for the people actually standing in front of the shelf, plus the exception that would otherwise surface a shift later. | Voice · WMS / POS · Exception routing |
| `field` | `factory` | IoT / OT | **The plant and the field** | Manuals, work orders and spares reachable by voice at the point of work, and operational exceptions classified before the shift report would have caught them. | Edge · Work orders · Drift alerts |

**Footnote to carry over.** Slide 5 carries an asterisk the site should not
drop: *"Industrial/energy integration depends on the client's OT/SCADA
architecture and permitted interfaces."* It belongs under the tab panel, in the
same small caption style the section already uses for `ax-env__count`.

---

## 7. Services — Slides 6–9, the digital workforce

**`components/Services.jsx:13–24`** (`STACK`), **`28–32`** (ticker), **`68–77`** (head),
**`components/motion/ServiceExplorer.jsx:30–62`** (`DETAIL`), **`components/data.js:55–80`** (`services`)

### Section head

| Slot | Line | New copy |
|---|---|---|
| Kicker | 68 | `The digital workforce` |
| H2 | 70–73 | `Imagine your business\nwith a digital workforce` |
| Lede | 74–77 | **Instead of isolated AI tools, think in terms of agents assigned to specific business outcomes — each one owning a workflow end to end, with a human wherever judgement is required.** |

### The capability strip (`STACK`)

This is where the hero's old chips land. Every phrase already appears in full
sentences elsewhere on the page, which is the rule the file's own header sets.

`Voice & speech` · `Intent & documents` · `Retrieval over private knowledge` ·
`Models + rules` · `Policy & approvals` · `Tool use & APIs` · `Human-in-the-loop` ·
`Immutable audit trail`

### The rotating ticker (`Services.jsx:28–32`)

| Now | New |
|---|---|
| Discovery to deployment in months | **One workflow, proven against real conditions** |
| Fintech & HealthTech clients nationwide | **Six sectors, one execution layer** |
| HIPAA-compliant AI systems | **Cloud, on-prem, hybrid or air-gapped** |

### The four tracks

`data.js:55–80` holds the tab titles; `ServiceExplorer.jsx:30–62` holds the
`short`, `builds` and `note` for each. The four deck verticals map one-to-one
onto the four existing tracks, films and all.

**0 — `short`: AI in Fintech**
`title`: **Fintech — a digital workforce for the bank**
`builds`: `Customer agent — supported service and banking requests, conversationally` · `Fraud agent — scores suspicious activity and creates explainable intervention context` · `Collections agent — contacts customers, captures outcomes, escalates exceptions` · `Operations agent — disputes, reconciliation and exception queues`
`note`: **Proof built: AXON · LIVE fintech fraud detection · AI outbound voice engagement · private enterprise LLM.**

**1 — `short`: AI in Healthcare**
`title`: **Healthtech — administrative work that moves before staff chase it**
`builds`: `Patient access agent — scheduling, navigation, FAQs and service requests` · `RCM agent — eligibility, AR follow-up, billing and denial workflow` · `Patient financial agent — multilingual billing support and proactive follow-up` · `Supply agent — voice-driven stock for pharmacy and clinical supplies`
`note`: **Transferable proof: voice AI · outbound voice · private RAG/LLM · voice inventory.**

**2 — `short`: Retail & Customer Ops**
`title`: **Retail and customer operations — an AI operator beside every frontline team**
`builds`: `Inventory agent — hands-free stock, location, movement and exceptions` · `Store ops agent — tasks, SOPs and operational issue escalation` · `Customer service agent — supported requests across voice and digital` · `Agent assist — retrieves knowledge, summarizes calls, suggests next actions`
`note`: **Proof built: AI voice retail inventory manager · AXON · AXON 2.0 · AI outbound voice engagement.**

**3 — `short`: Industrial & Energy**
`title`: **Industrial and energy — governed AI at the point of work**
`builds`: `Maintenance agent — manuals, history and SOPs for troubleshooting` · `Work order agent — creates, enriches, prioritizes and updates` · `Field voice copilot — hands-free procedures and work instructions` · `Exception agent — classifies operational, meter, billing and process exceptions`
`note`: **Transferable proof: private enterprise LLM/RAG · voice inventory · AXON voice stack · workflow orchestration. Integration depends on the client's OT/SCADA architecture and permitted interfaces.**

> **Build note.** `ServiceExplorer.jsx:154` derives each tab's headline by
> splitting `s.title` on an em dash and taking the second half. The titles above
> keep that em dash, so the split still works — but check the rendered width:
> the new right-hand halves are longer than "real-time fraud detection and
> autonomous underwriting". `DETAIL[n].builds` also grows from three items to
> four in every track.

**Knowledge agent and the employee copilot.** Slides 6 and 7 both list a
Knowledge Agent and a Copilot, and they recur on 8 and 9 under different names.
They are cross-sector, so rather than repeating them in all four tracks they are
covered once — by `Understand` and `Operate privately` in the capability cards
(§2) and by the private-knowledge demo on `/demos`.

---

## 8. Features — Slide 11, "Start with one workflow"

**`components/Features.jsx:13`** (`STAGE_TITLES`), **`24–32`** (head), **`components/data.js:82–113`** (`features`)

### Section head

| Slot | Line | New copy |
|---|---|---|
| Kicker | 24 | `A lower-risk way to start` |
| H2 | 26–29 | `Start with one workflow.` + `<span class="text-span">` **Earn the right to expand** |
| Lede | 30–32 | **No enterprise-wide transformation program is required to establish whether the approach works.** |

### The pipeline — 5 stages, renamed

Slide 11 has four steps; the pipeline has five slots and so does every
deployment reel. Splitting the deck's *Prove* into **Design** and **Prove**
keeps both intact and maps 1:1 onto the existing reel chapters.

| Old | New | Body |
|---|---|---|
| Discover | **Identify** | Choose one meaningful workflow with measurable pain — slow, expensive, manual, risky or frustrating. We'll tell you whether AI can materially improve it. |
| Design | **Design** | Workflow design, then agent architecture: what the agent decides, what the policy decides, and where a human has to. |
| Build | **Prove** | Built against real business conditions and the systems you actually permit us to reach — not a sandbox with synthetic data. |
| Deploy | **Measure** | Outcomes compared against your own operating baseline, on numbers your team already trusts. |
| Scale | **Scale** | Productionize, then reuse the capabilities across adjacent workflows. The second workflow costs less than the first. |

**The closer** (`features[5]`, currently *"People-first approach"*):

`title`: **Evidence, not dependency**
`text`: **The first engagement should leave you with proof you can act on and a system your team can run — not a vendor you cannot leave.**

> **Ripple.** `STAGE_TITLES` (`Features.jsx:13`), the `title` fields in
> `data.js:82–113`, `STAGES` in `components/deployments.data.js:2`, and the
> `stage:` key on all 20 chapter entries in that file must move together, or
> the deployment reels will caption with stage names the pipeline no longer
> has. The mapping is positional and lossless: Discover→Identify,
> Design→Design, Build→Prove, Deploy→Measure, Scale→Scale.

---

## 9. Infrastructure — the control surface

**`components/Infrastructure.jsx:31–58`** (`COMMITMENTS`), **`88–105`** (head)

Slide 5 lists *Human Control* and *Audit* inside the execution layer, and slide
4 ends on *Operate Privately*. This section is where those three become
promises rather than feature words.

| Slot | Line | New copy |
|---|---|---|
| Status | 92 | `Always on` *(unchanged)* |
| Kicker | 94 | `Control and governance` |
| H2 | 96 | `The part that\nruns at 3am` *(unchanged — it is the best line on the page)* |
| Lede | 98–105 | **An agent that executes is an agent that can be wrong at scale. Everything it is allowed to do is bounded, everything it does is recorded, and the boundary is a thing your team sets — not a thing we tune.** |

| `k` | `v` | `d` | `icon` |
|---|---|---|---|
| **Bounded** | You set what it may do | Scope, thresholds and approval limits live in a policy your team owns and changes without a deployment. The agent acts inside it and escalates outside it. | `lock` |
| **Recorded** | Every action, reconstructable | Inputs, knowledge versions, model version, policy version, output and approver. Not a log — a record a regulator can read. | `eye` |
| **Yours** | Your accounts, your choice of ground | Cloud, on-prem, hybrid or air-gapped. Code, runbooks and retraining procedure hand over to the people who inherit it. | `handoff` |

The three existing icons (`lock`, `eye`, `handoff`, lines 60–85) still fit.

---

## 10. Reviews

**`components/Reviews.jsx:156–161`**

| Slot | Line | New copy |
|---|---|---|
| Kicker | 156 | `Who vouches` *(unchanged)* |
| H2 | 158 | `What our clients say about us` *(unchanged)* |
| Lede | 159–161 | **Regulated teams who let an AI system touch their operations — and the people who had to defend that decision internally.** |

**The nine testimonial bodies in `data.js:117–175` are not touched.** They are
attributed quotes; rewriting them to match new positioning would be fabricating
what named people said. Their language stays fintech/healthtech because that is
what those engagements were — which is also the honest reason the two new
verticals appear in the copy as capability, not as testimony.

---

## 11. Featured — Slide 10, "Give us a business problem"

**`components/Featured.jsx:39`** (H3), **`54–58`** (body)

| Slot | Line | New copy |
|---|---|---|
| H3 | 39 | **Give us a business problem. Not an AI requirement.** |
| Body | 54–58 | **You should not need to choose a model, design a RAG architecture or define an agent framework before talking to us. Bring us the process that is too slow, too expensive, too manual, too risky, or too frustrating to keep defending — and we'll determine whether AI can materially improve it, and build it if it can.** |

The five problem types (**slow · expensive · manual · risky · frustrating**)
carry the whole argument of slide 10 and are the most quotable thing in the
deck. They are set inline here rather than as a fifth card row, because this
band already holds a heading, a body and the terminal, and a chip row would be
the fourth list on a page that already has three.

---

## 12. Cta — the invitation

**`components/Cta.jsx:27`** (H2), **`30–34`** (body), **`46`** (button)

| Slot | Line | New copy |
|---|---|---|
| H2 | 27 | `Bring us one problem` |
| Body | 30–34 | **We'll show you what AI can actually do with it — one workflow, measured against your own baseline, in weeks rather than a transformation program.** |
| Button | 46 | `Bring us one problem` |

> H2 and button now read the same, which is fine when the button is the literal
> instruction and the heading is the invitation — but if it grates, the button
> can be `Start the conversation`. The one string that must not come back is
> **"Request Free Strategy Session"**: `free` prices the engagement before the
> buyer does, and `strategy session` is what an agency sells, not what an
> execution layer sells. (The same string still sits at `Cases.jsx:245`.)

---

## 13. CtaDark — Slide 12, the close

**`components/CtaDark.jsx:44`** (H2), **`56`** (button)

| Slot | Line | New copy |
|---|---|---|
| H2 | 44 | **What work should AI be doing in your business?** |
| Button | 56 | `bring us one problem` *(lowercase, matching the existing treatment)* |

Slide 12 also lists seven work categories — *customer operations, back office,
risk & compliance, knowledge work, field operations, revenue operations,
technology operations*. If the closing frame has room for a chip row beneath the
heading, that is the list; if not, it is better content for the **footer's**
first column than whatever sits there now.

The deck's final line, **"AI that does the work."**, is the H1. Repeating it
here would close the page on the same four words it opened with — which is
either a frame or a loop depending on taste. Worth a look once it's on screen.

---

## 14. Structural copy outside the sections

### Chapter spine — `components/motion/chapters.js:16–27`

`Kicker` numbers every section from this array and `StoryRail` prints it, so it
has to move with the sections. Order is unchanged; only labels change.

| `id` | Now | New |
|---|---|---|
| `header` | The brief | **AI that does the work** |
| `whyus` | What we build | **Our actual capability** |
| `inside` | Inside the system | **The difference** |
| `cases` | Evidence | **Proof before promise** |
| `reels` | The work, playing | **The portfolio** |
| `environments` | Where it runs | **Across your estate** |
| `services` | The offer | **The digital workforce** |
| `features` | How we run it | **A lower-risk way to start** |
| `reviews` | Who vouches | **Who vouches** *(unchanged)* |
| `ctadark` | Start something | **Bring us one problem** |

### Navigation — `components/Navbar.jsx:57–96`

| Slot | Line | Change |
|---|---|---|
| `CTA_LABEL` | 96 | `Book a technical review` → **`Bring us one problem`** |
| `DOMAINS` | 85–88 | Two entries (`fintech`, `healthtech`) → **six**: `fintech` · `healthtech` · `retail` · `customer ops` · `industrial` · `energy`, all targeting `#services` |
| `LINKS[0]` | 58 | `Platform` → **`Capability`** (it points at `#whyus`, which is now the capability grid) |
| `LINKS[1]` | 61 | `Deployments` → **`Proof`** |

Six domain chips may not fit the bar at the width two occupied. If they don't,
the honest fallback is four — `fintech` · `healthtech` · `retail` ·
`industrial` — with the full six living in the Services section and the hero
chips.

---

## What this spec does not do

- **No new testimonials, metrics, logos or client names.** Every number and
  name on the page after this rewrite is one that was already there.
- **No reordering of `app/page.jsx`.** The deck's argument order is hook →
  problem → proof → capability → estate → verticals → method → close. The page
  runs capability before problem (WhyUs sits above DecisionPath). It reads fine
  either way, but if you want the deck's order exactly, the single move is
  `<DecisionPath />` above `<WhyUs />` in `app/page.jsx:24–25`. Decide before
  the copy goes in, because the chapter numbers in `chapters.js` follow page
  order.
- **No claim that the four new verticals have delivered clients.** The deck is
  careful about this — slides 7 and 9 say *"transferable proof"*, not *"proof
  built"*, precisely because healthtech, industrial and energy are backed by
  capability rather than by a named engagement. That distinction is preserved
  word for word in §7 above, and it should survive any later editing pass.

---

## As built

Four departures from the spec above, and why.

**1. The Cta button is `Start the conversation`, not `Bring us one problem`.**
§12 flagged the risk and offered this as the alternative. With the heading two
lines above now reading *Bring us one problem*, a button repeating it verbatim
read as a stutter. The nav and hero still carry the phrase, so it is not lost.

**2. DecisionPath lost its millisecond readout entirely.** §3 only called for
deleting the 22ms sentence from the lede, but the panel also printed a live
`{elapsed}/22ms` meter and stamped each step with its own `ms`. Those numbers
were correct while the six stages described a synchronous fraud score — they
matched the hero console's fraud trace step for step. The new stages include
placing a call and writing to a system of record, and no millisecond total
spans that honestly. So:

- `ms` on each stage became `mode` — what *governs* the step (`any channel`,
  `governed sources`, `models + rules`, `your policy`, `human gate`,
  `immutable`) rather than how long it takes.
- `TOTAL_MS` became `TOTAL_STEPS`, and the meter counts steps, which is true
  by construction and needs no source.
- The hero's own console (`AgentConsole` via `IntelligenceSystem`) **keeps**
  its timings. What it times really is sub-second, and it was never the thing
  making the unsourceable claim.

**3. The Environments footnote needed a style.** §6 said to set the OT/SCADA
qualifier in the caption style already used by `ax-env__count`. That class is
`margin: auto 0 0` and lives in the panel's footer, so reusing it would have
pushed the footnote away from the claim it qualifies. A new `.ax-env__note`
rule sits in `app/film.css` beside the other `ax-env` rules, at the same
weight as the index readout — deliberately quieter than the line above it,
because a footnote that competes with the claim reads as a warning.

**4. The footer was repositioned too.** §13 suggested slide 12's seven work
categories as footer content. That was not done — the footer already carries
four bands and a seventh list would crowd it. What did change, because the
footer ships on the home page and still said the old thing:

- Tagline: *"Production-grade AI systems for fintech and healthtech"* →
  **"Enterprise AI that understands, reasons and executes — inside the systems
  you already own."**
- Explore labels: `Platform` → **Capability**, `What we build` → **Digital
  workforce**, `Inside the system` → **How we start**, `Deployments` →
  **Proof**.
- Footer CTA: `Start a project` → **Bring us one problem**.

### Second pass — the diagrammatic content

The spec above ported the deck's *copy*. It did not port the deck's
*diagrams*, and six pieces of the argument lived only in those. All six are
now on the page; each needed markup and styles, not just strings.

| Deck | Was missing | Now |
|---|---|---|
| 2 | The `ASK → AI ANSWERS → HUMAN DOES THE WORK` vs `REQUEST → UNDERSTANDS → REASONS → ACTS` contrast, *"We build the second kind."*, and the execution-layer line | `.ax-path__contrast` + `.ax-path__verdict` above the trace in `DecisionPath.jsx`. The left chain's last link is marked in coral — it is the one a person does, which is the whole comparison |
| 3 | AXON, Live Fraud, Outbound AI and Private LLM with their chains | `PROOF` strip in `Cases.jsx`, four colour-keyed cards between the heading and the three client acts |
| 5 | The eight-tile estate, the `AIBRIGADE AGENTIC INTELLIGENCE + EXECUTION LAYER` band, and the four audiences | `.ax-estate` block under the four film tabs in `Environments.jsx` — systems owned, the layer across them, who feels it |
| 6–9 | 8 of the 24 sector agents (I had shipped 4 per track; the deck has 6) | `DETAIL[n].builds` now carries all six per track, in the deck's order |
| 10 | The five problem cards and `Business problem → … → measurable pilot` | `PROBLEMS` and `ROUTE` under the Featured band |
| 12 | The seven work categories and *"Bring us one problem. We'll show you what AI can actually do with it."* | `AREAS` chips and `.ax-close__ask` between the closing heading and its button |

**One thing was removed rather than added.** The OT/SCADA qualifier was
showing twice in Environments — once on the plant-and-field tab, once under
the new estate diagram. The tab copy is gone; the footnote now sits under the
diagram bound to the asterisk on `IoT / OT*`, which is the deck's own
placement.

**Where the sector agents actually render.** `ServiceExplorer` only mounts the
active track, so the server HTML contains six agents and the other eighteen
arrive with the client bundle on tab change. That is correct behaviour for the
component and fine for a reader, but worth knowing: a crawler reading the
prerendered page sees the fintech track only.

### Third pass — the design fix

The six blocks above were built to the right content but the wrong finish.
Screenshotting the page at 1440 and 390 found three real faults, two of them
bugs rather than taste:

**1. The Environments heading was overlapping itself.** `compose.css` sets
`line-height: 0.98` on the three dark-band titles (`.ax-reels__title`,
`.ax-env__title`, `.ax-infra__title`). That is safe for a heading whose every
line is authored — which all three were, two short `\n`-split lines each. This
one is now two full sentences; both wrapped, and because `MaskHeading` wraps
every word in an `inline-flex` box carrying `0.18em` of descender padding
(`.ax-mask__word`), a line box under ~1.1 lets a wrapped line render **on top
of** the line above it. `.ax-env__title` now takes its own
`clamp(2rem, 3.4vw, 3rem) / 1.12`, which puts each sentence on one line at
desktop and keeps them clear if a narrower viewport wraps one.

> Worth knowing for the next heading: any `MaskHeading` whose text can wrap
> needs leading of at least ~1.1. The tight display setting is only safe on
> hand-broken lines.

**2. Wrapped chains opened on a stray arrow.** `.ax-route__chain`,
`.ax-path__contrast-chain` and `.ax-estate__layer-parts` all drew their
separator with `li + li::before`. At phone width that put a leading `→` or `•`
at the start of every wrapped line, pointing at nothing. All three now use
`li:not(:last-child)::after`, so a wrapped line *ends* on the separator and
reads as "continues".

**3. The new blocks read as bolted on.** Fixed per block: the problems strip
pulled up tight under the violet band it belongs to (it was floating a full
section gap below it); the route chain and the portfolio note each given a
hairline and real room so they close their blocks instead of trailing off
them; proof and problem cards given `min-height` so a one-line chain still
reads as a card; the estate's layer band given connector cues at top and
bottom and the audience row given top rules, so the three bands read as a
stack that flows; ~200px of dead band removed between the Environments tab
panel and the estate.

**A note on the local server.** Rebuilding `.next` underneath a running
`next start` leaves it serving 500s for the CSS chunks, which renders the page
completely unstyled and looks exactly like a broken stylesheet. Kill the
server before rebuilding.

### Fourth pass — a regression the copy rewrite caused

Screenshotting the *whole* page, not just the new blocks, turned up a fault the
earlier passes had shipped: **renaming content also broke two film lookups**,
because both are keyed by the very strings that were renamed.

| Map | Keyed by | What broke |
|---|---|---|
| `filmFor.whyUs` | WhyUs card `title` | All **8** capability cards. Titles went from "Fraud detection" etc. to "Listen"/"Understand"/…, every key missed, `AmbientVideo` returned `null`, and each card rendered as a black box with a paragraph at the bottom of it |
| `filmFor.stages` | Pipeline stage `title` | **3 of 5** stages. Discover→Identify, Build→Prove, Deploy→Measure |

`AmbientVideo` does `if (!spec) return null`, so a missed key fails silently —
nothing throws, nothing logs, the build passes, and the section just looks
empty. Both maps are now re-keyed, with a comment on each saying which file
owns the strings they must match.

Films were reassigned by what each clip actually shows rather than by what was
left over: a conversation for Listen, documents for Understand, the chip for
Reason, a trading floor for Decide, the agent interface for Act, the network
for Communicate, clinicians for Escalate, infrastructure for Operate privately.

> **If you rename anything on this page again, grep `components/video.data.js`
> first.** `whyUs` and `stages` are keyed by display strings; `cases`, `reels`
> and `services` are keyed by id or index and are safe.

Also verified in this pass, at 1440 / 1024 / 390: no clipped blocks, and no
horizontal page scroll at any width. Two stale comments naming the old titles
were corrected, and the Features heading got the full stop the deck gives it.

### Fifth pass — the last of the deck, and an audit of what sits behind it

A read of the deck against the built page found one block of slide content
still unplaced and four clips standing behind copy they do not illustrate.

**What was missing: the four sector headlines (slides 6–9).**

Slides 6, 7, 8 and 9 each open on their own sentence, and those four
sentences are the only place the deck says what a digital workforce *is* for
a bank as against a hospital as against a shop floor. The port kept the
24 agents and the proof lines from those slides but not the headlines: the
Services section opened on one general form of the claim ("Imagine your
business with a digital workforce") and the panel titled itself `short` —
"AI in Fintech", which is the tab's own label, repeated.

`DETAIL[n]` now carries a `headline`, and the panel renders `short` as an
eyebrow above it:

| Track | Headline |
|---|---|
| 0 | Imagine your bank with a digital workforce. |
| 1 | Imagine administrative work moving before staff have to chase it. |
| 2 | Imagine every frontline team having an AI operator beside them. |
| 3 | Imagine field and operations teams with governed AI at the point of work. |

`.ax-svc__panel-title` was a fixed `1.75rem / 1.15` — right for a two-word
label, wrong for a sentence up to four times as long that wraps in every
track. It is `clamp(1.25rem, 1.9vw, 1.625rem) / 1.25` now, which is the same
lesson the Environments heading taught in the third pass: **tight leading is
only safe on hand-broken lines.**

**Also added: slide 12's last line.** `AI THAT DOES THE WORK.` now closes the
page under the button, as `.ax-close__stamp` — small, tracked out and
`aria-hidden`, because a screen reader has already had this sentence as the
h1. §13 left this open as a taste call; set at sign-off size rather than
heading size it reads as a frame, not a loop.

**What was behind the wrong thing.** Four assignments in `filmFor` described
one clip and pointed at another — the kind of drift the fourth pass warned
about, except here nothing broke loudly, the section just illustrated a
claim it wasn't making:

| Slot | Was | Now | Why |
|---|---|---|---|
| `whyUs.Understand` | `geneEditing` | `diagnosticSupport` | The comment said "documents"; the clip is a DNA strand over a lab bench. A healthtech image under an explicitly cross-sector card |
| `whyUs.Escalate` | `diagnosticSupport` | `operations` | The comment said "clinicians"; the clip is a wireframe head with no people in it. The card is about handing a decision to a person |
| `services[1]` (Healthtech) | `geneEditing` | `healthcare` | The track is scheduling, eligibility, RCM and billing. Gene editing is research imagery; this is administration |
| `services[2]` (Retail) | `agentsInterface` | `logistics` | The track is inventory, store ops and the shelf. A laptop on a desk shows none of it |
| `environments.clinical` | `geneEditing` | `healthcare` | Kicker reads "EHR" |

`modern-healthcare-loop.mp4` had been sitting in `/public/video` referenced
by nothing at all while `geneEditing` was stretched across six slots. It now
carries the two health surfaces that are about administration, and
`geneEditing` keeps the two that are genuinely clinical — the UUB case and
the clinical reel.

The comment over `filmFor.services` was also stale: it named "Custom AI
Development" and "Automation", two offers that stopped existing when the
tracks became the deck's four sectors, and the films under it were still
assigned to them.

**Verified on a clean build** at 1440 and 390: all eight capability cards
resolve to a clip, all four tracks render their headline over the right
footage with six agents and their proof line, and there is no horizontal
page scroll at 1440 / 1024 / 390.

> **Read the note on the local server above before trusting a measurement.**
> It cost an hour this pass. A rebuild under a running `next start` left one
> CSS chunk serving a 500, and a page missing `projects.css` reports ~400px
> of horizontal overflow and a `<video>` laid out at its intrinsic 1280px —
> which looks exactly like a real layout bug and is not one. If a
> measurement says something is broken, curl the CSS chunks for a 500 before
> believing it. Kill the server, delete `.next`, rebuild, restart.

### Sixth pass — DecisionPath's opening band

The head and the contrast block were reported as not looking good, and the
measurements agreed. Three faults, all composition rather than colour:

**1. The band used 40% of its width.** `.ax-path__head` was `max-width:
44rem` inside a 1386px container, with the lede stacked under the heading.
That left ~850px of black to the right of the widest band on the page, and it
was the only section opening this way — WhyUs, Services and Features all put
the heading left and the lede right (`._3-columns-grid`). The head is now a
two-column grid with the kicker spanning, and the lede sits on the heading's
last baseline rather than at the top of its column.

**2. The chains filled about 40% of their columns.** Each column was 674px;
the left chain's content measured ~290px and the right's ~360px, because the
links were `flex-wrap` pills sized to their own text — "Ask" was a 48px tag.
So both chains floated at the left edge of an oversized column, and the
hairline divider added in the third pass to separate them sat at x=739
relating to nothing on either side. At that size they also read as filter
chips, which is the wrong genre entirely: this block is the half-second
version of the node diagram below it and should look like it.

The links are `flex: 1 1 0` now, so three split their panel in three and four
split it in four — the chain fills by construction at any width. Each link is
a real box (min-height, centred label, step index from a CSS counter, the same
radius and hairline as the diagram's nodes), and the arrow is absolutely
positioned in the gap at `left: 100%` with the gap's own width, so it centres
between two links whatever they measure.

**3. The two columns weren't two objects.** The divider is gone; each column
is a panel with its own border and fill. The agentic one carries a faint
violet — the hue the lit route below already uses — so the page marks which
of the two it is arguing for without deciding it before the chains are read.
The verdict then centres under both, as the conclusion drawn from a
comparison rather than a footnote to the left column, which is also where the
deck sets it on slide 2.

> **One bug worth keeping in mind.** The stacked layout collapsed: `flex: 1 1
> 0` is what makes the links share the row at desktop, but `flex-basis`
> resolves against the *main axis*, so the moment the container turns
> `column` that same declaration sets each box's **height** to zero and lets
> it grow only into free space there isn't any of. The boxes shrank under
> their own content and the step number rendered on top of the border. The
> mobile query resets them to `flex: 0 0 auto`. Any flex row that becomes a
> column at a breakpoint has this in it.

Verified at 1440 / 1024 / 768 / 390: panels equal, no link clipping its own
content, no horizontal page scroll.

### Still open

- **Seven vs eight products** (§5). `components/projects.data.js` holds eight
  (Fitzy, InCall, Fraud Detection, AutoVista, Axon, RM2, AI Zakat Engine,
  QuickBite AI) and the showcase renders all eight, so the page says eight and
  the deck's "Seven demo-ready AI products" is one behind. The page is left
  as the accurate artefact; **the deck is the one to correct**, since the two
  will be read side by side.
- **The hero console's four traces** (`AgentConsole.jsx:7`) are fraud,
  underwriting, clinical documentation and compliance monitoring — fintech and
  healthtech only. They are accurate to real products and were out of this
  spec's scope, but a page now claiming six sectors shows a first screen that
  demonstrates two. Adding a retail or field-service trace would close that gap.
- **`npm run lint` does not run.** ESLint 9 wants `eslint.config.js` and the
  project has none, so the script fails before it lints anything. Unrelated to
  this rewrite, but it means the build is the only check currently enforcing
  anything.
