# AIBrigade — marketing site

Next.js 16 (App Router) + React 19. GSAP/ScrollTrigger for scroll motion,
Swiper for the reviews carousel.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

Node 18.18+ (20+ recommended for Next 16).

---

## What changed in this pass

### Read this before touching `app/globals.css`

```css
[data-w-id] { opacity: 1 !important; }
.header_component h1, .header_text_wrapper .d1, .header_image_gallery,
.cases_bg-2, .services_photo, .button_bg-2 { opacity: 1 !important; … }
```

Those rules look like dead weight. They are not. The two linked Webflow
stylesheets ship IX2 initial states — `opacity: 0` — for every one of those
selectors, and `webflow.js` is not running to reveal them. Weaken them in any
way, including scoping them behind a class, and the hero headline, hero
paragraph, case backgrounds, services photo and CTA background all disappear
the moment the page hydrates.

The motion layer is therefore built to never need them released. It animates
only elements it owns: `Reveal`'s wrapper divs, `MaskHeading`'s spans, and
`Parallax`'s cloned refs. Nothing it animates opacity on appears in that list.

The reason the page felt static is upstream of CSS: the recreation kept the
layout but dropped the whole interaction layer, and the stopgap that replaced
it was a single 0.7s fade on a handful of headings.

### Added

```
app/motion.css                     motion layer, all `ax-` namespaced
app/deployments.css                the reels section
components/motion/MotionProvider   mounts the ax-motion / ax-reduced flags
components/motion/Reveal           four scroll-reveal variants
components/motion/MaskHeading      word-masked headline reveal
components/motion/StoryRail        the seven-chapter narrative spine
components/motion/Cursor           reactive pointer ring
components/motion/Magnetic         pointer-following CTA (clones, no wrapper)
components/motion/Parallax         scroll-scrubbed drift for decorations
components/motion/ScrollProgress   hairline page-progress bar
components/motion/Counter          count-up figures
components/motion/gsapLoader       one shared GSAP + ScrollTrigger instance
components/Deployments             the video section (no longer mounted — see below)
components/deployments.data.js     its content — all placeholder; still read by ProofStrip
```

### Navigation

```
app/nav.css                        the bar, the case-study menu, the drawer
components/Navbar.jsx              rebuilt on `ax-nav-*`; no Webflow navbar markup left
```

Two states: transparent with white labels over a dark hero, light glass
with dark labels once the page turns white underneath. 78px at the top,
62px scrolled — the top height is unchanged, so every section's
`scroll-margin-top: 5.5rem` (app/refine.css) still clears it.

`#nav` and `data-menu="open"` are kept as hooks because refine.css locks
body scroll off `body:has(#nav[data-menu="open"])`. The Webflow navbar
rules in globals.css and refine.css (`.nav-menu-white`, `.navbar_link_p`,
`.menu_box-btn`, `.nav-up`/`.nav-down`) are now inert — no element carries
those class names — and were left in place rather than deleted.

Two things the old bar got wrong, both fixed here: every link pointed at a
bare `#id`, so on `/icu`, `/halyk` and `/uub` — which mount this same
navigation — `getElementById` returned null and the whole nav silently did
nothing; and those three case-study pages were reachable only by finding
the Cases section on the home page. They are in the "use cases" menu now.

### Project showcase (replaces the reels console in the same band)

```
app/projects.css                   the showcase — featured project, grid, stage, switcher
components/projects.data.js        one entry per PRODUCT; language cuts + documents under it
components/projects/ProjectShowcase   the `#reels` section
components/projects/ProjectCard       one project: brief, stage, languages, resources
components/projects/ProjectMedia      adaptive stage — portrait/landscape per cut, preload none
components/projects/LanguageSwitcher  "Watch demo in" — only the languages that exist
components/projects/ProjectResources  attached PDFs
public/projecs/posters/            one frame per cut, so nothing downloads before play
```

The demo files live in `public/projecs/` (sic). Add a project by adding an
entry to `projects.data.js` — never by rendering the directory. `width`,
`height` and `duration` per cut were read from the files; the stage uses them
to lay out before metadata arrives and corrects itself from the element.
`components/Deployments.jsx` and `app/deployments.css` are kept but unused.

No new dependencies. GSAP and ScrollTrigger were already in `package.json`.

### Wired up

- `app/layout.jsx` — imports both stylesheets, mounts `MotionProvider`,
  `Cursor`, `StoryRail`. `metadataBase` moved off `fintech.auxility.ca`.
- `app/page.jsx` — `<Deployments />` sits between `Cases` and `Services`:
  where someone who just read a case study wants proof, and the last beat
  before the site starts selling.
- `Hero` — the three headline lines rise word by word on a cascade, the phone
  gallery unveils by clip, the CTA is magnetic.
- `Cases`, `Features`, `Proud` — staggered card entrances.
- `CtaDark` — masked headline, magnetic CTA.
- Scroll-scrubbed parallax on the floating 3D figures in `Hero`, the gem in
  `Cases`, and each render behind a `Features` card. This is the motion you
  notice on a long page — depth moving at different rates — rather than an
  entrance you miss if you scroll past it.
- The violet wash behind the reels console tracks scroll position.

`Magnetic` clones its child and attaches a ref instead of rendering a wrapper.
The wrapper version broke `width-mob-100` on the hero CTA: the anchor sized to
a shrink-to-fit `inline-block` span instead of its container, so the full-width
mobile button stopped being full width. `Parallax` clones for the same reason —
most decorations are `position: absolute`, and a wrapper resets their
containing block.

Never put `Parallax` on `.services_photo`. `globals.css` pins it with
`transform: translate3d(0,0,0) !important` and the tween silently loses.
- `WhyUs`, `Cases` — section ids for the story rail. Two dead duplicate
  anchors (`#whyus`, `#cases`, both unreferenced) renamed to `-end`.

### What each section does now

| Section | Scroll | Pointer |
|---|---|---|
| `Navbar` | hide-on-scroll (pre-existing), scroll-progress hairline above it | link fade |
| `Hero` | headline rises word by word on a cascade, gallery clip-unveils, the two 3D figures and the two phone stacks drift at four different rates | magnetic CTA, ticker pauses on hover |
| `WhyUs` | heading rise; horizontal pin (pre-existing) | capability cards lift |
| `Featured` | staggered heading, gradient panel, body | — |
| `Cases` | heading rise, case rows stagger, gem drifts | card hover scales the phone screenshot |
| `Deployments` | clip reveal, violet wash tracks scroll | the whole console — reel select, chapter jump, scrub, mute, auto-advance |
| `Services` | heading rise, panels stagger | panels lift, stats ticker pauses on hover |
| `Features` | heading rise, cards stagger, each render drifts behind its card | cards lift |
| `Reviews` | cards stagger | cards lift |
| `Cta` | masked headline, body rise, chain drifts | magnetic CTA |
| `Proud` | badges stagger | badges lift |
| `CtaDark` | masked headline | magnetic CTA |
| `Footer` | columns stagger | social links slide, text links fade |
| Global | story rail pill tracks chapter, hairline tracks progress | reactive cursor ring |

Every pointer interaction is gated on `(hover: hover) and (pointer: fine)` so
a tap on mobile doesn't leave a card stuck in its hover state, and all of it
is gated on `html.ax-motion:not(.ax-reduced)`.

### Deliberately not done

- **No blanket fade-up.** A page where every section slides up 28px on entry is
  the clearest tell of generated work. The four `Reveal` variants exist so the
  motion says what kind of thing you're looking at: `clip` for media (heavy 3D
  renders shimmer under transform), `stagger` for card sets, `drift` for
  decorative objects, `rise` for single blocks. Apply them where they mean
  something, not everywhere.
- **Nothing added inside the `WhyUs` horizontal list.** That list is pinned by
  an existing ScrollTrigger and moved by a manual tween; a second trigger on
  its children fights the pin. The heading above it animates, the cards
  respond to hover, and the scroll behaviour is left alone.
- **The reviews Swiper is untouched.** Only the desktop three-column layout
  staggers; Swiper owns the tablet and mobile carousel and should keep owning
  it.
- **The reels section is not scroll-pinned.** `WhyUs.jsx` already pins a
  horizontal ScrollTrigger, and a second pin on one page is where scroll jank
  and broken `refresh()` cycles come from. A video the reader can't scrub is
  also worse than one they can.

---

## The reels section

The scrub bar is divided into the five stages the site already claims to run —
Discover, Design, Build, Deploy, Scale, the same five in `components/data.js`
`features`. Each reel carries chapter timestamps mapped onto them, and a
caption over the footage changes as it plays. Playing a reel walks a prospect
through the method; a sceptic can click "Deploy" and jump straight to the part
they care about.

That's why it isn't a thumbnail grid with a lightbox. A grid makes someone
choose before they know anything, and every studio site has one. This device
only works because it's bolted to *this* company's stated process.

**Videos.** Drop MP4s in `/public/reels/`. 25–60s, H.264 so Safari plays them
inline, muted-safe (no essential audio), ~1280px wide, under ~6MB. Give every
one a poster JPG. Until a file exists the stage renders an explicit empty state
naming the path it wants, so the section looks deliberate while you shoot.

**Get the chapter timestamps right per clip.** A marker landing mid-sentence
makes the whole device feel broken.

**Behaviour.** One reel at a time (fresh `<video>` per selection, so the
browser drops the previous buffer instead of stacking four downloads), muted
autoplay on selection, auto-advance on end, pauses when scrolled out of view,
full keyboard control with roving tabindex, and no motion at all under
`prefers-reduced-motion`.

---

## The film layer

Eight clips in `/public/video` are now used across the page, through one
primitive.

### Read this before using these clips anywhere new

Every file in `/public/video` is text-to-video output — each `.mp4` has a
`.json` sidecar recording the model and the prompt that made it. They are
**atmosphere, not evidence**, and the distinction decides where they may go:

- Fine: backgrounds, environments, texture behind a diagram, anything the
  page does not present as a record of work performed.
- Not fine: `Deployments` ("The work, playing"). That section presents its
  reels as systems shipped for named clients, so generated footage there
  would be a claim it cannot back. It keeps its own empty state until real
  capture exists. It has a graded backdrop and nothing in the console.

The same line applies to copy. `Environments` describes categories of system
and names no client and no metric, which is the only reason it can sit next
to generated footage. Put a real number in it and you need real capture in
it at the same time.

### The pieces

```
components/video.data.js          the manifest, the grades, and `filmFor`
components/motion/AmbientVideo    the primitive — lazy, polite, graded
components/motion/HoverFilm       film inside a card, on hover only
components/motion/ScrubFilm       playhead driven by the scrollbar
components/Environments           "Where it runs" — four environments
components/Infrastructure         "The part that runs at 3am" — scrubbed
app/film.css                      all of it, `ax-film` / `ax-env` / `ax-infra`
```

### Bandwidth is the whole design

`/public/video` is ~28MB and there are ~23 film surfaces on the page.
Nothing about this works without the three rules that keep those numbers
apart:

1. **`src` is never in the server-rendered markup.** A browser starts
   fetching `<video src>` before hydration, so an effect cannot intervene.
   `AmbientVideo` attaches `src` only once the element is within a screen of
   the viewport.
2. **Cards arm on hover, not on visibility** (`HoverFilm`). Scrolling past a
   six-card row costs nothing.
3. **Assignments are centralised in `filmFor` so the same files get reused.**
   Twenty-three surfaces resolve to eight files; a clip already fetched for
   the hero is instant in a card. Adding a ninth clip is a real cost — make
   that decision in `video.data.js`, where the whole table is visible, not
   in the component.

Measured on a full scroll-through at 1440px: 23 surfaces, 7 distinct files.

### The grade

The first version of this graded far too hard — a violet wash at
`mix-blend-mode: color` and 0.82 over footage already desaturated to 0.34,
then laid in at 30–55% opacity. Every clip came out the same flat lilac
smear. **If you change one thing in `film.css`, do not put that back.**

The premise was wrong. This footage was generated cyan-and-amber on
near-black, and cyan-and-amber on near-black *is* the premium AI-hardware
look — it is the reason the footage is worth using. Brand cohesion does not
come from recolouring the image; it comes from what sits on top of it, and
this site already has violet rules, labels, glows and chrome to do that.

So `.ax-film` now barely recolours. It deepens and adds contrast, lifts a
little violet into the shadows (`mix-blend-mode: color` at **0.26**, a
seating rather than a duotone), and adds a violet bloom at `screen` in one
corner — light entering the frame, not paint over the lens. Saturation stays
at ~0.88 so the accent lighting survives.

Nothing is faded to achieve subtlety. **A dimmed clip is not a subtle clip,
it is a grey one** — every film runs at `opacity: 1` and contrast is bought
with `brightness()` and scrims instead.

| grade  | for | notes |
|--------|-----|-------|
| `full` | full-bleed behind copy | deepened, strong edge falloff; the section adds its own scrim |
| `soft` | a framed panel — Pipeline screen, services panel, case tile | brightest; nothing written over it, so it may look like a product shot |
| `wash` | a **white card with black text** | the only inverting grade: lifted and veiled white |

Exposure varies wildly between clips (night data centre vs. white-walled
factory), so a fixed overlay cannot carry legibility on its own. Sections
with copy over footage get a scrim anchored to the *layout* rather than the
image — `.ax-env__stage::after`, `.ax-infra__inner::before`, and the hero's
own replacement for the primitive's vignette — so the copy column is dark
whichever clip is playing and wherever its bright areas fall. Those ramp
left-to-right on desktop and go flat below 992px, where the layout stacks.

`backdrop-filter` is treated as decoration everywhere it appears: every
frosted panel is opaque enough to read without it, because it is reported as
supported and then silently not painted often enough to matter.

### Two traps when adding a film to an existing section

Both of these cost real debugging time; neither is obvious from the markup.

**A Webflow card will paint over a negative-z-index child.**
`.featured_component` is a rounded violet card with `position: relative`,
`z-index: 0` and `overflow: hidden`. A negative-index child of a stacking
context is supposed to paint above that context's own background — here it
did not. The clip was confirmed mounted, `readyState: 4`, playing,
`opacity: 1` and sized exactly to the card, and the section still rendered
as a flat purple slab. The fix is to stop relying on it: put the film at
`z-index: 0` so it covers the card, and lift the real content above it with
`position: relative; z-index: 1`. It also degrades correctly — if the clip
never loads, the violet card is what remains.

**Check what is already painting a background there.** Before adding a film,
find the element that currently owns that section's colour. Two background
treatments stacked is one too many, and the one you did not know about is
usually on top.

### Declining to play

`AmbientVideo` mounts no `<video>` at all under `prefers-reduced-motion`,
Save-Data, or a 2g connection, and `HoverFilm` mounts none on a coarse
pointer. In each case `.ax-film`'s placeholder — a brand gradient, not a
black rectangle — is what stays, so the layout is unchanged and nothing
reads as a missing asset. Verified: reduced motion leaves 22 film surfaces
and 0 video elements.

### Scroll-driven, not pinned

`ScrubFilm` maps the clip's playhead onto the section's own pass through the
viewport. `WhyUs` already owns the page's one pin, and the note in
`Deployments.jsx` about a second one holds — this gets the same
reader-driven scrub with no height rewriting. It falls back to a plain loop
on coarse pointers, under reduced motion, and if GSAP never arrives. Seeks
are paced against the element's `seeked` event rather than a timer, so the
last write always lands.

## Open items — none of these are animation problems

**1. The stylesheets aren't yours.** `app/layout.jsx` still links
`fintech-auxility-ca.webflow.shared…css` from Auxility's Webflow CDN and a
custom stylesheet from their S3 bucket. Every visual on this site is served
from infrastructure you don't control. The day either file is rotated, renamed
or firewalled, the site doesn't degrade — it loses its entire design. Same for
every image: `data.js`, `Hero.jsx` and `Cases.jsx` pull 3D renders, client
logos and headshots from `cdn.prod.website-files.com`.

Pull both stylesheets and the assets you intend to keep into `/public` and
point at them locally. It's an afternoon, and it's the difference between a
site and a hotlink.

**2. Some assets shouldn't be kept.** The hero logo ticker runs Halyk, ICU,
Raiffeisen and Auchan — Auxility's clients, from Auxility's CDN, presented as
AIBrigade's. `Proud.jsx` shows Clutch and Manifest badges claiming 2026 awards.
`data.js` carries nine named testimonials with job titles and headshots. None
of it appears to be yours.

Fabricated endorsements and award badges are what a prospect's procurement team
checks, and Clutch badges are trademarked. Cut the ticker, cut the badges, and
either get real quotes or drop the reviews section. The reels are a better
answer to "prove it" than nine invented quotes — which is part of why they sit
where they do.

**3. Placeholder metrics in the hero.** The reels console is gone — the
`#reels` band now shows real product demos from `components/projects.data.js`
— but the hero's evidence row (`ProofStrip`) still prints the placeholder
metrics from `components/deployments.data.js`. Replace them or cut the row.

**3b. Demo file sizes.** `Call Center ENG.mp4` is 609MB and the Fitzy cuts run
150–290MB. Nothing downloads until play, but a visitor who presses play on a
phone will wait. Re-encode to ~1080p H.264, target under ~40MB each.

**4. Favicons** still point at Auxility's Webflow CDN (`app/layout.jsx`).

---

## If something looks wrong

**A section is blank or text is missing.** Almost always the `globals.css`
overrides above. In devtools, find the missing element and check what is
applying `opacity: 0`. If it has a Webflow class and no `data-ax` attribute,
the override is not reaching it.

**A masked headline renders as empty space.** This one bit once already.
`MaskHeading` hides each word with a CSS `transform: translateY(105%)`. By the
time GSAP reads that back, `getComputedStyle` has resolved the percentage into
a pixel matrix, which GSAP parses as `y: <N>px` with `yPercent: 0` — it has no
way to know the author wrote a percentage. Animating `yPercent` to 0 then does
nothing, because GSAP already believes it is 0, and the pixel offset survives.
The words stay below their clipping box and the headline is invisible.

The tween therefore states both `yPercent` and `y` explicitly in its
from-vars. **General rule for this codebase: never set a percentage transform
in CSS and then animate its `*Percent` counterpart in GSAP.** Declare the
start state inside the tween.

**Nothing animates at all.** Check the console for a failed `gsap` chunk. If
GSAP never resolves, `MotionProvider` adds `ax-nomotion` to `<html>` after 9s
and releases everything the motion layer hid — so a page that is fully
visible but completely static usually means the library didn't load, not that
the animations are absent. Also check whether your OS has "Reduce motion" on;
that disables nearly all of this by design.

This window used to be 3.5s and that was too tight: on a cold `next dev`
server, Turbopack compiles the gsap/ScrollTrigger chunk on demand the first
time anything imports it, and that compile alone can take longer than 3.5s.
The failsafe fired on the very first load of every fresh dev session,
stripped every `data-ax="hide"` attribute, and made the entire site look
permanently static — a reload "fixed" it only because the chunk was cached
by then. If a fresh `npm run dev` still shows a static page for a few seconds
before this note gets edited out, that's expected: it's compiling, not
broken. Give it a normal page reload before concluding otherwise.

**The story rail isn't showing.** It needs `html.ax-motion`. It renders as a
dark pill docked to the bottom centre of the viewport, at every width.

It used to be a fixed column on the left at `left: 1.75rem`. That was wrong
here: `container-large` runs nearly edge to edge, so there is no side gutter
for it to live in and the ticks landed on top of the first column of content,
reading as stray debris rather than navigation. Don't move it back without
first giving the page a gutter to put it in.

**The cursor ring isn't showing.** Desktop, fine pointer, ≥992px, reduced
motion off.

**Animations fire at the wrong scroll position.** The remote stylesheets land
after first paint and change the page height. `MotionProvider` refreshes
ScrollTrigger on `fonts.ready`, on `window.load`, and once more at 1200ms. On a
slow connection they can arrive later than that; add another
`ScrollTrigger.refresh()` if so.

## Verify before shipping

- `npm run build` — passes on Next 16.2 / React 19 as committed.
- Toggle "Reduce motion" in your OS and reload: no cursor ring, no rail
  animation, no autoplay, all content visible, counters at final values.
- Disable JavaScript and reload: today's site, fully readable.
- Tab through the reels section end to end — every control reachable, focus
  ring visible against the dark band.
- Scroll the full page with devtools throttled to 4× CPU and watch the `WhyUs`
  horizontal pin for stutter. `MotionProvider` already calls
  `ScrollTrigger.refresh()` on `fonts.ready` and `window.load`, which is when
  the two remote stylesheets land and change the page height.
- Eyeball the three gradient-filled headings (`Cases`, `WhyUs`, `Proud`). They
  use `Reveal` rather than `MaskHeading` on purpose: `background-clip: text`
  and nested transformed spans don't always agree in Safari.

## Structure

```
app/
  layout.jsx        stylesheets, GTM, motion mount, preloader, popup provider
  page.jsx          composes all sections
  globals.css       ported Webflow embedded styles
  motion.css        motion layer
  deployments.css   reels section
  film.css          the video layer
  icu|halyk|uub/    placeholder case routes
components/
  Navbar Hero WhyUs Featured Cases Deployments Environments Services
  Features Infrastructure Reviews Cta Proud CtaDark Footer PopupForm
  PopupContext Preloader PageTransition
  data.js deployments.data.js video.data.js
  motion/
```
