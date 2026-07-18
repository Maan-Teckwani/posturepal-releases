import { Fraunces, Instrument_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Display serif — variable weight (comp uses 450/500) + optical sizing + italic
// for pull quotes.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

// Body/UI sans.
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-instrument-sans",
  display: "swap",
});

// Site-wide defaults — the B2B homepage and /individuals each export their own
// audience-specific title/description/OG tags from their page.js.
export const metadata = {
  title: {
    default: "PosturePal — AI Posture Coaching",
    template: "%s",
  },
  description:
    "On-device posture AI that nudges you the moment you slouch. Private, offline, no hardware.",
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrumentSans.variable} h-full antialiased`}
    >
      <head>
        <script src="https://heyo.so/embed/script?projectId=6a2ffb0cb2a7d1f432cfbe25" async></script>
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
