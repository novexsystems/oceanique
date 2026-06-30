/**
 * ============================================================
 * OCEANIQUE — AboutSection
 * ============================================================
 * The company story / "About Us" section used on the homepage
 * and the full /about page. Displays a headline, description,
 * and an optional side image of the team or the fleet.
 *
 * DATA SOURCES:
 * - Brand description → src/config/site.config.ts (brand.description)
 * - Founded year      → src/config/site.config.ts (brand.foundedYear)
 * - Image             → /public/images/about/about-image.jpg
 *
 * CUSTOMIZE:
 * - To change the text: edit the `content` object below.
 * - To change the image: replace /public/images/about/about-image.jpg
 * - To change layout (image left vs right): swap the order of
 *   the two grid children below.
 * ============================================================
 *
 * TODO: Build out this component — see design spec.
 * Planned features:
 *  - Two-column layout: text left, image right
 *  - Framer Motion slide-in from sides on scroll
 *  - Decorative gold corner accents on the image
 *  - List of key values/principles with gold check marks
 */

"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SectionHeading } from "@/components/common/SectionHeading";
import { siteConfig } from "@/config/site.config";

/**
 * Edit this object to change the About section text content.
 * These values are separate from site.config.ts so you can
 * have different text on the homepage vs the /about page.
 */
const content = {
  eyebrow: "Our Story",
  title: "A Legacy of Excellence at Sea",
  body: [
    `Founded in ${siteConfig.brand.foundedYear}, Oceanique was born from a singular passion: to redefine what luxury at sea truly means. We believe every voyage should be as memorable as the destination.`,
    `Our handpicked fleet, world-class crew, and obsessive attention to detail ensure that from the moment you step aboard, you inhabit a world apart — one where time slows, horizons open, and every wish is anticipated.`,
  ],
  values: [
    "Uncompromising craftsmanship",
    "Bespoke, personalised service",
    "Sustainable maritime practices",
    "Absolute discretion",
  ],
};

export function AboutSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="bg-white py-24 px-6">
      <div ref={ref} className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Text — slides in from the left */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0, 1] }}
        >
          <SectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            align="left"
          />
          <div className="mt-8 space-y-5">
            {content.body.map((paragraph, i) => (
              <p key={i} className="text-silver-dark font-body text-base leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Values list with gold dash */}
          <ul className="mt-8 space-y-3">
            {content.values.map((value, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.08, ease: "easeOut" }}
                className="flex items-center gap-3 text-midnight font-body text-sm"
              >
                <span className="w-5 h-px bg-gold flex-shrink-0" />
                {value}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Image — slides in from the right */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.1, 0, 1] }}
          className="relative aspect-[4/5] bg-midnight/5 border border-silver/40 overflow-hidden flex items-center justify-center"
        >
          {/*
            Replace this placeholder with a real image:
            import Image from "next/image";
            <Image src="/images/about/about-image.jpg" alt="Oceanique fleet" fill className="object-cover" />
          */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(160deg, #0A0F1A 0%, #1a2035 60%, #0D1526 100%)",
            }}
          />
          <p className="relative z-10 text-silver/30 text-xs font-body text-center px-8 leading-relaxed">
            Replace with
            <br />
            /public/images/about/about-image.jpg
          </p>

          {/* Decorative gold corner accents */}
          <div className="absolute top-5 right-5 w-10 h-10 border-t border-r border-gold/50" />
          <div className="absolute bottom-5 left-5 w-10 h-10 border-b border-l border-gold/50" />
        </motion.div>
      </div>
    </section>
  );
}
