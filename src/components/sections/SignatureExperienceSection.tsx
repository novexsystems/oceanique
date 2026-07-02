/**
 * ============================================================
 * OCEANIQUE — SignatureExperienceSection
 * ============================================================
 * Full-bleed editorial section showcasing a flagship charter
 * experience ("The Sunset Tour"). Rendered between
 * ServicesSection and AboutSection on the public homepage.
 *
 * LAYOUT:
 *  - Desktop: two-column — left = asymmetric photo collage (3
 *    images in a 2×2 grid), right = editorial content block.
 *  - Mobile: single column, content stacks below photos.
 *
 * HOW TO CUSTOMISE THIS SECTION:
 *  ┌─────────────────────────────────────────────────────────┐
 *  │ 1. ALL TEXT (headline, description, price, CTA label)   │
 *  │    → edit the CONTENT object below                      │
 *  │                                                         │
 *  │ 2. FEATURE BADGE PILLS (icons + labels)                 │
 *  │    → edit the FEATURES array below                      │
 *  │                                                         │
 *  │ 3. COLLAGE PHOTOS (3 images on the left)                │
 *  │    → edit the COLLAGE_IMAGES array below                │
 *  │    → place your images in /public/images/               │
 *  │    → update the src strings to match                    │
 *  │                                                         │
 *  │ 4. BACKGROUND COLOUR                                    │
 *  │    → change bg-midnight on the <section> element        │
 *  └─────────────────────────────────────────────────────────┘
 *
 * DATA SOURCES:
 *  - Photo collage  → COLLAGE_IMAGES array (defaults to fleet
 *                     gallery images from boatsConfig)
 *  - Booking modal  → WebsiteBookingContext.open()
 * ============================================================
 */

"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Clock, Users, Wine, ArrowRight } from "lucide-react";
import { boatsConfig } from "@/config/boats.config";
import { useWebsiteBooking } from "@/contexts/WebsiteBookingContext";

/** Shared easing curve — matches every other section on the homepage. */
const EASE = [0.25, 0.1, 0, 1] as const;

// ─────────────────────────────────────────────────────────────────────────────
// ✏️  EDIT HERE — All text content for this section
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Every piece of copy shown in this section lives here.
 * Change any field to instantly update the homepage without
 * touching the JSX below.
 */
const CONTENT = {
  /** Small label shown above the headline with a gold leading line. */
  eyebrow: "Signature Experience",

  /** First part of the large headline — displayed in plain white. */
  headlinePrefix: "The",

  /**
   * The highlighted / italic gold word in the headline.
   * Keep it short (1–2 words) so the heading stays on one line.
   */
  headlineHighlight: "Sunset",

  /** Final word of the headline — displayed in plain white. */
  headlineSuffix: "Tour",

  /**
   * Main description paragraph. Supports plain text only.
   * Aim for 2–4 sentences for the best layout balance.
   */
  description:
    "Three hours along the coastline, chasing the dying light. " +
    "A chilled bottle of premier champagne, a bespoke tasting " +
    "menu by our private chef, and a glassy sea as the horizon " +
    "fades to violet. This is not a charter — this is a memory.",

  /** Small label rendered above the price figure (e.g. "From", "Starting at"). */
  priceLabel: "From",

  /**
   * Price figure shown in the large heading font.
   * Include the currency symbol here (e.g. "$890", "€750", "£650").
   */
  price: "$890",

  /** Unit appended after the price in smaller muted text. */
  priceUnit: "/voyage",

  /** Text on the gold CTA button that opens the booking modal. */
  ctaLabel: "Book Sunset Tour",

  /** Accessible label for the CTA button (used by screen readers). */
  ctaAriaLabel: "Book the Sunset Tour charter experience",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// ✏️  EDIT HERE — Feature badge pills
// ─────────────────────────────────────────────────────────────────────────────
/**
 * The three (or more) highlight badges shown below the description.
 * Each badge renders an icon and a short label.
 *
 * Icons must be Lucide components — import any new icon at the top
 * of this file alongside Clock, Users, and Wine.
 *
 * Browse all available icons at: https://lucide.dev/icons/
 */
const FEATURES = [
  { icon: Clock, label: "3 Hours"          },
  { icon: Users, label: "Up to 12 Guests"  },
  { icon: Wine,  label: "Open Bar"         },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// ✏️  EDIT HERE — Photo collage (left side)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * The three images used in the editorial photo collage:
 *   [0] → large hero image  (spans the full left height, 2/3 of the width)
 *   [1] → top-right image   (small, upper quarter of the right column)
 *   [2] → bottom-right image (small, lower quarter of the right column)
 *
 * HOW TO SWAP IMAGES:
 *  1. Add your photo files to /public/images/  (JPG or WebP recommended).
 *  2. Replace the `src` strings below with your file paths,
 *     e.g. src: "/images/sunset-deck.jpg"
 *  3. Update each `alt` string to describe the new photo.
 *
 * DEFAULT: pulls gallery photos from the first three vessels in
 * boatsConfig so the collage automatically matches your fleet.
 * If a gallery image is missing it falls back to the vessel's
 * primary image (the PNG boat cutout).
 */
const COLLAGE_IMAGES = [
  {
    src: boatsConfig.fleet[0]?.images.gallery[0] ?? boatsConfig.fleet[0]?.images.primary,
    alt: "Oceanique sunset charter — main vessel",
  },
  {
    src: boatsConfig.fleet[1]?.images.gallery[0] ?? boatsConfig.fleet[1]?.images.primary,
    alt: "Luxury yacht at dusk",
  },
  {
    src: boatsConfig.fleet[2]?.images.gallery[1] ?? boatsConfig.fleet[2]?.images.primary,
    alt: "Charter vessel on open water",
  },
] as const;

export function SignatureExperienceSection() {
  const ref    = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  /** Opens the 4-step charter booking modal. */
  const { open: openBookingModal } = useWebsiteBooking();

  return (
    <section className="relative bg-midnight py-24 px-6 overflow-hidden border-t border-white/[0.05]">

      {/* ── Atmospheric dusk glow — evokes the sunset theme ── */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-72 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 100% at 50% 0%, rgba(201,162,39,0.07) 0%, transparent 70%)",
        }}
      />

      {/* ── Bottom fade to tie into the next (white) section ── */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(10,15,26,0.4) 100%)",
        }}
      />

      <div ref={ref} className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-14 xl:gap-20 items-center">

          {/* ══════════════════════════════════════════════════
              LEFT — asymmetric editorial photo collage
              ══════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.85, ease: EASE }}
            className="grid grid-cols-3 grid-rows-2 gap-2.5 h-[360px] sm:h-[440px] lg:h-[520px]"
          >
            {/* Large hero photo — spans 2 columns and both rows */}
            <div className="col-span-2 row-span-2 relative overflow-hidden group bg-midnight/60">
              {/* src + alt come from COLLAGE_IMAGES[0] above */}
              <img
                src={COLLAGE_IMAGES[0].src}
                alt={COLLAGE_IMAGES[0].alt}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              {/* Vignette — enriches the image depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/45 pointer-events-none" />
              {/* Top-left gold corner accent */}
              <div aria-hidden className="absolute top-0 left-0 w-12 h-px bg-gold/60" />
              <div aria-hidden className="absolute top-0 left-0 w-px h-12 bg-gold/60" />
            </div>

            {/* Top-right photo */}
            <div className="relative overflow-hidden group bg-midnight/60">
              {/* src + alt come from COLLAGE_IMAGES[1] above */}
              <img
                src={COLLAGE_IMAGES[1].src}
                alt={COLLAGE_IMAGES[1].alt}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/35 pointer-events-none" />
            </div>

            {/* Bottom-right photo */}
            <div className="relative overflow-hidden group bg-midnight/60">
              {/* src + alt come from COLLAGE_IMAGES[2] above */}
              <img
                src={COLLAGE_IMAGES[2].src}
                alt={COLLAGE_IMAGES[2].alt}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black/30 pointer-events-none" />
              {/* Bottom-right gold corner accent */}
              <div aria-hidden className="absolute bottom-0 right-0 w-12 h-px bg-gold/60" />
              <div aria-hidden className="absolute bottom-0 right-0 w-px h-12 bg-gold/60" />
            </div>
          </motion.div>

          {/* ══════════════════════════════════════════════════
              RIGHT — editorial content block
              ══════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.85, delay: 0.15, ease: EASE }}
          >
            {/* Eyebrow label — edit CONTENT.eyebrow above */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-px bg-gold/60 shrink-0" />
              <p className="text-gold text-[10px] font-body tracking-[0.32em] uppercase">
                {CONTENT.eyebrow}
              </p>
            </div>

            {/* Headline — edit CONTENT.headlinePrefix/Highlight/Suffix above */}
            <h2 className="font-heading text-[2.8rem] lg:text-5xl xl:text-[3.4rem] text-white font-light leading-[1.06] mb-5">
              {CONTENT.headlinePrefix}{" "}
              <span
                className="text-gold"
                style={{ fontStyle: "italic" }}
              >
                {CONTENT.headlineHighlight}
              </span>
              {" "}{CONTENT.headlineSuffix}
            </h2>

            {/* Gold hairline divider */}
            <div
              className="h-px mb-7"
              style={{
                background:
                  "linear-gradient(90deg, rgba(201,162,39,0.55) 0%, transparent 60%)",
              }}
            />

            {/* Description — edit CONTENT.description above */}
            <p className="text-silver/50 font-body text-[15px] leading-[1.85] mb-9 max-w-md">
              {CONTENT.description}
            </p>

            {/* ── Feature badges ── */}
            <div className="flex flex-wrap gap-3 mb-11">
              {FEATURES.map(({ icon: Icon, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.45, delay: 0.35 + i * 0.07, ease: EASE }}
                  className="flex items-center gap-2.5 border border-white/10 px-4 py-3 hover:border-gold/35 transition-colors duration-300"
                >
                  <Icon size={13} className="text-gold/65 shrink-0" aria-hidden />
                  <span className="text-white/55 text-[10px] font-body tracking-[0.2em] uppercase whitespace-nowrap">
                    {label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* ── Price + CTA row ── */}
            <div className="flex flex-wrap items-end gap-8">

              {/* Price block — edit CONTENT.priceLabel / price / priceUnit above */}
              <div>
                <p className="text-white/30 text-[9px] font-body tracking-[0.35em] uppercase mb-2">
                  {CONTENT.priceLabel}
                </p>
                <p className="font-heading text-[2.6rem] text-white font-light leading-none">
                  {CONTENT.price}
                  <span className="text-white/30 text-sm font-body font-normal ml-1.5">
                    {CONTENT.priceUnit}
                  </span>
                </p>
              </div>

              {/* Gold gradient CTA — same pattern as hero / header / services */}
              <motion.div
                initial="rest"
                whileHover="hover"
                whileTap={{ scale: 0.97 }}
                variants={{
                  rest: {
                    y: 0,
                    boxShadow: "0 0 0px rgba(201,162,39,0)",
                  },
                  hover: {
                    y: -3,
                    boxShadow:
                      "0 12px 36px rgba(201,162,39,0.45), 0 4px 14px rgba(201,162,39,0.28)",
                    transition: { duration: 0.25, ease: "easeOut" },
                  },
                }}
                className="relative overflow-hidden"
              >
                {/* CTA label — edit CONTENT.ctaLabel / ctaAriaLabel above */}
                <button
                  onClick={() => openBookingModal()}
                  aria-label={CONTENT.ctaAriaLabel}
                  className="relative flex items-center gap-3 px-9 py-4 text-midnight text-[10px] font-body font-bold tracking-[0.3em] uppercase overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, #D4B245 0%, #C9A227 50%, #A8851E 100%)",
                  }}
                >
                  {/* Diagonal shimmer sweep — identical to hero CTA */}
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                    variants={{
                      rest: { x: "-130%" },
                      hover: {
                        x: "230%",
                        transition: { duration: 0.55, ease: "easeInOut" },
                      },
                    }}
                  />
                  <span className="relative z-10">{CONTENT.ctaLabel}</span>
                  <ArrowRight size={12} className="relative z-10" aria-hidden />
                </button>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
