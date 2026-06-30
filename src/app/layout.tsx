/**
 * ============================================================
 * OCEANIQUE — ROOT LAYOUT
 * ============================================================
 * The root layout wraps every page in the application.
 * It loads fonts, sets global metadata, and applies CSS
 * variable classes so Tailwind can access the font names.
 *
 * CUSTOMIZE:
 * - To change fonts: swap the Google Font imports below and
 *   update the `--font-heading` / `--font-body` variables
 *   in src/app/globals.css to match the new variable names.
 * - To change global SEO defaults: edit src/config/site.config.ts
 *   (the `seo` object) — changes reflect here automatically.
 * ============================================================
 */

import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site.config";
import { ClientProviders } from "@/components/common/ClientProviders";

/* ----------------------------------------------------------
   FONT DEFINITIONS
   Each font is assigned a CSS variable that is referenced in
   globals.css under the @theme block.
   ---------------------------------------------------------- */

/**
 * Cormorant Garamond — Luxury serif font for headings.
 * Weights: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
 * To replace: swap "Cormorant_Garamond" with another Google Font import,
 * update the variable name, and change --font-heading in globals.css.
 */
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

/**
 * Montserrat — Clean sans-serif font for body text and UI.
 * Weights: 300–700 for full range of UI usage.
 * To replace: swap "Montserrat" with another Google Font import,
 * update the variable name, and change --font-body in globals.css.
 */
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

/**
 * Geist Mono — Monospace font for code/data displays.
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/* ----------------------------------------------------------
   GLOBAL METADATA
   Pulled from site.config.ts — edit the seo object there
   to change title, description, and social preview tags.
   ---------------------------------------------------------- */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.seo.canonicalUrl),
  title: {
    default: siteConfig.seo.title,
    template: siteConfig.seo.titleTemplate,
  },
  description: siteConfig.seo.description,
  keywords: [...siteConfig.seo.keywords],
  openGraph: {
    type: "website",
    locale: siteConfig.seo.locale,
    url: siteConfig.seo.canonicalUrl,
    siteName: siteConfig.brand.name,
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
    images: [
      {
        url: siteConfig.seo.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.brand.name,
      },
    ],
  },
  twitter: {
    card: siteConfig.seo.twitterCard,
    site: siteConfig.seo.twitterHandle,
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
    images: [siteConfig.seo.ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

/* ----------------------------------------------------------
   ROOT LAYOUT COMPONENT
   ---------------------------------------------------------- */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`
        ${cormorant.variable}
        ${montserrat.variable}
        ${geistMono.variable}
        h-full
      `}
    >
      {/*
        Note: The `dark` class is applied at the page/layout level
        for dashboard pages (see src/app/dashboard/layout.tsx).
        Do NOT add `dark` here unless you want the entire site
        to default to dark mode.
      */}
      {/*
        ClientProviders mounts all global client-side context providers
        (AvatarContext, etc.) without converting this server component
        to a client component. See src/components/common/ClientProviders.tsx.
      */}
      <body className="min-h-full flex flex-col">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
