/* system.css first — it defines the design tokens (`--violet-500`,
   `--coral`, `--ease`, `--ink-canvas`, `--line-invert`, `--sp-*`) that
   every stylesheet below references. */
import "./system.css";
import "./globals.css";
import "./motion.css";
import "./hero.css";
import "./deployments.css";
import "./casestudy.css";
import "./path.css";
import "./sysv.css";
import "./svc.css";
/* film.css after the sections it layers into — it positions backdrops
   against rules in hero.css and deployments.css. */
import "./film.css";
/* refine.css corrects layout and interaction problems that only the
   finished cascade produces. */
import "./refine.css";
/* immersive.css after it: the depth, material and micro-interaction layer
   is built on top of that finished cascade rather than being part of it.
   Nothing in it introduces a colour, a typeface or a layout — see its own
   header. */
import "./immersive.css";
import Script from "next/script";
import { PopupProvider } from "@/components/PopupContext";
import Preloader from "@/components/Preloader";
import PageTransition from "@/components/PageTransition";
import PopupForm from "@/components/PopupForm";
import MotionProvider from "@/components/motion/MotionProvider";
import SmoothScroll from "@/components/motion/SmoothScroll";
import Cursor from "@/components/motion/Cursor";
import ScrollProgress from "@/components/motion/ScrollProgress";




const WF_SHARED_CSS =
  "https://cdn.prod.website-files.com/64147b2316f5ef0922b44617/css/fintech-auxility-ca.webflow.shared.8bf8d5ffb.min.css";
const WF_CUSTOM_CSS =
  "https://s3.amazonaws.com/assets.vvmd.team/Auxility/styles/3hhyvl-6.csb.app_style.css";

export const metadata = {
  title: "AI Brigade | Custom AI Systems for FinTech & HealthTech",
  description:
    "AI Brigade builds production-grade AI systems — copilots, automation agents, GPT platforms, and decision intelligence workflows — for FinTech and HealthTech companies, from initial discovery through production deployment.",
  metadataBase: new URL("https://aibrigade.vercel.app"),
  icons: {
    icon: "https://cdn.prod.website-files.com/64147b2316f5ef0922b44617/641832e35aac6568d9a90013_favicon32x32-fintech.png",
    apple:
      "https://cdn.prod.website-files.com/64147b2316f5ef0922b44617/6418342a3c418513b24385a0_favicon256x256-fintech.png",
  },
  openGraph: {
    title: "AI Brigade | Custom AI Systems for FinTech & HealthTech",
    description:
      "AI Brigade builds production-grade AI systems — copilots, automation agents, GPT platforms, and decision intelligence workflows — for FinTech and HealthTech companies.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-US">
      <head>
        {/* Exact visual parity: reuse the original Webflow stylesheets. */}
        <link rel="preconnect" href="https://cdn.prod.website-files.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={WF_SHARED_CSS} />
        <link rel="stylesheet" href={WF_CUSTOM_CSS} />
      </head>
      <body className="bodywhite" data-scroll-time="0">
        {/* Google Tag Manager */}
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-KSRF9Q88');`}
        </Script>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KSRF9Q88"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="gtm"
          />
        </noscript>

        <MotionProvider />
        {/* Interpolated scrolling, mounted above everything that scrubs
            against scroll position. Every scrubbed effect on this page —
            the WhyUs pin, Parallax, ScrubFilm, Pipeline's rail, the hero's
            StageDepth — inherits the easing without changing, because they
            all read the same document offset this smooths. Desktop and
            fine-pointer only; see the component. */}
        <SmoothScroll />
        <Cursor />
        <ScrollProgress />
        {/* StoryRail removed: the fixed-bottom "XX/09 — chapter" pill it
            drew is bottom-anchored to the viewport rather than to any one
            section, so on a page this long it lands over whatever content
            happens to be at the bottom of the screen at that scroll
            position — card copy in WhyUs, the stage list in Deployments,
            the item list in Infrastructure. It was also a second readout
            of information `Kicker` already prints at the top of every
            section ("02 What we build", "03 Inside the system", …), so
            removing it drops a redundant, occasionally content-covering
            element rather than losing any information the page no longer
            states elsewhere. `ScrollProgress`'s hairline bar above stays
            as the one page-position indicator. */}

        <PopupProvider>
          <Preloader />
          <PageTransition />
          <div className="page-wrapper">
            {children}
            <PopupForm />
          </div>
        </PopupProvider>
      </body>
    </html>
  );
}
