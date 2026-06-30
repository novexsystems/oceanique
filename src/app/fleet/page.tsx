/**
 * ============================================================
 * OCEANIQUE — Fleet Page  (Route: /fleet)
 * ============================================================
 * Public page displaying the full yacht fleet.
 * Reuses the FleetSection component with showAll={true}
 * to render all boats (not just featured ones).
 *
 * SEO:
 * - Title and description are set via the exported metadata object.
 * - Edit them directly below or wire them to site.config.ts.
 * ============================================================
 */

import type { Metadata } from "next";
import { WebsiteLayout } from "@/components/layout/WebsiteLayout";
import { FleetSection } from "@/components/sections/FleetSection";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: "Our Fleet",
  description: `Explore the ${siteConfig.brand.name} yacht fleet — luxury motor yachts, sailing yachts, catamarans, and super yachts available for private charter.`,
};

export default function FleetPage() {
  return (
    <WebsiteLayout>
      {/* Page hero — simple banner above the fleet grid */}
      <div className="bg-midnight pt-32 pb-16 px-6 text-center">
        <p className="text-gold tracking-[0.4em] uppercase text-xs font-body mb-4">
          Private Charter
        </p>
        <h1 className="font-heading text-5xl md:text-7xl text-white font-light">
          Our Fleet
        </h1>
        <div className="w-14 h-px bg-gold mx-auto mt-6" />
      </div>

      {/* Full fleet grid — showAll renders every boat */}
      <FleetSection showAll />
    </WebsiteLayout>
  );
}
