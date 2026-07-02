/**
 * ============================================================
 * OCEANIQUE — HOME PAGE  (Route: /)
 * ============================================================
 * The public-facing homepage. It composes all website sections
 * in order, each of which is a self-contained component that
 * can be individually edited or re-ordered below.
 *
 * SECTIONS (in render order):
 *  1. WebsiteLayout      — wraps everything with Header + Footer
 *  2. HeroSection        — full-screen hero with CTA
 *  3. StatsSection       — animated KPI numbers
 *  4. FleetSection       — fleet preview cards
 *  5. ServicesSection              — services offered
 *  6. SignatureExperienceSection    — The Sunset Tour editorial feature
 *  7. PremiumExtrasSection     — alternating editorial extras showcase
 *  8. TestimonialsSection      — client testimonials 2×2 grid
 *  9. ContactSection           — contact form / info
 *
 * To reorder sections: move the JSX elements below.
 * To hide a section: comment it out or delete the import + element.
 * ============================================================
 */

import { WebsiteLayout } from "@/components/layout/WebsiteLayout";
import { HeroSection } from "@/components/sections/HeroSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { FleetSection } from "@/components/sections/FleetSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { SignatureExperienceSection } from "@/components/sections/SignatureExperienceSection";
import { PremiumExtrasSection } from "@/components/sections/PremiumExtrasSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { ContactSection } from "@/components/sections/ContactSection";

export default function HomePage() {
  return (
    <WebsiteLayout>
      <HeroSection />
      <StatsSection />
      <FleetSection />
      <ServicesSection />
      <SignatureExperienceSection />
      <PremiumExtrasSection />
      <TestimonialsSection />
      <ContactSection />
    </WebsiteLayout>
  );
}
