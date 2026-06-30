/**
 * ============================================================
 * OCEANIQUE — About Page  (Route: /about)
 * ============================================================
 * Public page with the full company story, values, and team.
 * Composes the AboutSection and TestimonialsSection components.
 * ============================================================
 */

import type { Metadata } from "next";
import { WebsiteLayout } from "@/components/layout/WebsiteLayout";
import { AboutSection } from "@/components/sections/AboutSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn the story behind ${siteConfig.brand.name} — ${siteConfig.brand.tagline}`,
};

export default function AboutPage() {
  return (
    <WebsiteLayout>
      {/* Page banner */}
      <div className="bg-midnight pt-32 pb-16 px-6 text-center">
        <p className="text-gold tracking-[0.4em] uppercase text-xs font-body mb-4">
          Our Story
        </p>
        <h1 className="font-heading text-5xl md:text-7xl text-white font-light">
          About {siteConfig.brand.name}
        </h1>
        <div className="w-14 h-px bg-gold mx-auto mt-6" />
      </div>

      <AboutSection />
      <StatsSection />
      <TestimonialsSection />
    </WebsiteLayout>
  );
}
