import "./globals.css";
import "./motion.css";
import "./deployments.css";
import Script from "next/script";
import { PopupProvider } from "@/components/PopupContext";
import Preloader from "@/components/Preloader";
import PageTransition from "@/components/PageTransition";
import PopupForm from "@/components/PopupForm";
import MotionProvider from "@/components/motion/MotionProvider";
import StoryRail from "@/components/motion/StoryRail";
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
        <Cursor />
        <ScrollProgress />
        <StoryRail />

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
