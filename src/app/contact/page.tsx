/**
 * ============================================================
 * OCEANIQUE — Contact Page  (Route: /contact)
 * ============================================================
 * Public contact page with the full enquiry form and
 * business contact details.
 * ============================================================
 */

import type { Metadata } from "next";
import { WebsiteLayout } from "@/components/layout/WebsiteLayout";
import { ContactSection } from "@/components/sections/ContactSection";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${siteConfig.brand.name}. Our charter specialists are ready to craft your perfect bespoke voyage.`,
};

export default function ContactPage() {
  return (
    <WebsiteLayout>
      {/* Page banner */}
      <div className="bg-midnight pt-32 pb-16 px-6 text-center">
        <p className="text-gold tracking-[0.4em] uppercase text-xs font-body mb-4">
          Enquiries
        </p>
        <h1 className="font-heading text-5xl md:text-7xl text-white font-light">
          Contact Us
        </h1>
        <div className="w-14 h-px bg-gold mx-auto mt-6" />
      </div>

      <ContactSection />
    </WebsiteLayout>
  );
}
