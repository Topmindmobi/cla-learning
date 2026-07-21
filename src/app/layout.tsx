import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import "@/styles/tokens.css";
import "@/styles/public.css";
import "@/styles/dashboard.css";
import "@/styles/student.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});
const ibmPlexMono = IBM_Plex_Mono({
  weight: "500",
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: "CLA Learning — Cornerstone & Luthien Advisory",
  description: "Accredited professional education for procurement, finance and leadership across Africa.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable}`}>
      <body style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
