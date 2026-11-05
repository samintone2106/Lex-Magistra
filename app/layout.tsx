import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import { getSettings } from "@/lib/data";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const description =
    "Soluciones jurídicas estratégicas y personalizadas en Colombia: tránsito, penal, económico y financiero, digital, migratorio y protección del buen nombre.";
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${s.firm_name} — ${s.firm_tagline}`, template: `%s · ${s.firm_name}` },
    description,
    openGraph: { type: "website", locale: "es_CO", siteName: s.firm_name, description },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = { themeColor: "#1A1B1D", colorScheme: "dark" };

// Marca .js antes de pintar; si GSAP no arranca en 2.5 s, se muestra todo (.js-fallback).
const BOOT = `document.documentElement.classList.add('js');try{if(sessionStorage.getItem('intro'))document.documentElement.classList.add('no-intro');else sessionStorage.setItem('intro','1')}catch(e){}setTimeout(function(){if(!window.__motionReady)document.documentElement.classList.add('js-fallback')},2500);`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO" className={`${geist.variable} ${instrument.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
