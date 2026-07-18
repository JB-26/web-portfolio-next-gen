import "../styles/global.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Instrument_Sans, Spline_Sans_Mono } from "next/font/google";

// Self-hosted via next/font: no fonts.googleapis.com round-trip, and Next
// generates size-adjusted fallback metrics, which protects the LCP/CLS work
// from commit 2eb33dc. Both families are variable fonts, so one file each
// covers every weight the design uses.
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const splineSansMono = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-spline-mono",
  display: "swap",
});

export default function App({ Component, pageProps }) {
  return (
    <>
      {/* The font variables have to land on :root, not on a wrapper element.
          styles/global.css maps them into @theme at :root (--font-sans,
          --font-mono), and a custom property whose value references an
          undefined variable resolves at its declaration scope — so defining
          them further down the tree would leave those theme values empty. */}
      <style jsx global>{`
        :root {
          --font-instrument-sans: ${instrumentSans.style.fontFamily};
          --font-spline-mono: ${splineSansMono.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
