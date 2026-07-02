/**
 * ============================================================
 * OCEANIQUE — PremiumExtrasSection
 * ============================================================
 * Editorial "Premium Extras" showcase. Renders a series of
 * alternating image / text rows, each describing a premium
 * add-on available to charter guests. Sits between the
 * SignatureExperienceSection (dark) and AboutSection (white).
 *
 * LAYOUT:
 *  - Centered headline with gold eyebrow
 *  - Alternating rows: odd = photo left / text right,
 *                       even = text left / photo right
 *  - Mobile: stacked (photo then text every time)
 *  - No individual CTAs — purely editorial
 *
 * HOW TO CUSTOMISE:
 *  ┌─────────────────────────────────────────────────────────┐
 *  │ 1. HEADING TEXT                                         │
 *  │    → edit the CONTENT object below                      │
 *  │                                                         │
 *  │ 2. ADD / REMOVE / RENAME EXTRAS                         │
 *  │    → edit the EXTRAS array below                        │
 *  │    → each item: number, category, title, description,   │
 *  │      and an image { src, alt }                          │
 *  │                                                         │
 *  │ 3. SWAP PHOTOS                                          │
 *  │    → place your images in /public/images/               │
 *  │    → update each item's image.src string                │
 *  │    → e.g.  src: "/images/extras/champagne.jpg"          │
 *  │                                                         │
 *  │ 4. BACKGROUND / BORDER COLOUR                           │
 *  │    → change bg-white on the <section> element           │
 *  └─────────────────────────────────────────────────────────┘
 *
 * DATA SOURCES:
 *  - Photos  → EXTRAS[n].image.src (defaults to boatsConfig
 *              gallery images — swap for your own photos)
 * ============================================================
 */

"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { boatsConfig } from "@/config/boats.config";

/** Shared easing curve — matches every other homepage section. */
const EASE = [0.25, 0.1, 0, 1] as const;

// ─────────────────────────────────────────────────────────────────────────────
// ✏️  EDIT HERE — Section heading copy
// ─────────────────────────────────────────────────────────────────────────────
/**
 * All heading text for this section.
 * The `headlineHighlight` word is rendered in italic gold.
 */
const CONTENT = {
  /** Small uppercase eyebrow label flanked by gold hairlines. */
  eyebrow: "Premium Extras",
  /** Plain white word before the italic-gold highlight. */
  headlinePrefix: "The",
  /**
   * Italic gold word(s) in the headline.
   * Keep to 2–3 words so the heading stays balanced.
   */
  headlineHighlight: "finer details",
  /** Remainder of the headline after the highlighted word. */
  headlineSuffix: "that turn a charter into a memory.",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// ✏️  EDIT HERE — Premium extras items
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Each entry renders one alternating image / text row.
 *
 *  - number      : decorative index shown as a ghost number behind the text
 *  - category    : small badge overlaid on the photo corner
 *  - title       : main heading for this extra
 *  - description : 2–3 sentence body copy
 *  - image.src   : path to the photo (relative to /public/)
 *  - image.alt   : accessible alt text for the photo
 *
 * DEFAULT: images pulled from boatsConfig gallery as placeholders.
 * Swap `image.src` with your own photos once available.
 */
const EXTRAS = [
  {
    number: "01",
    category: "Gastronomy",
    title: "Champagne & Caviar Service",
    description:
      "Dom Pérignon, Krug, and Imperial Oscietra served by a dedicated onboard sommelier. Every bottle chosen to complement the evening's mood — and the horizon that frames it.",
    image: {
      src: boatsConfig.fleet[2]?.images.gallery[1] ?? boatsConfig.fleet[2]?.images.primary,
      alt: "Champagne service onboard — replace with /public/images/extras/champagne.jpg",
    },
  },
  {
    number: "02",
    category: "On Water",
    title: "Water Toys & Jet Skis",
    description:
      "Seabobs, Yamaha WaveRunners, inflatable sun-lounges, and complete snorkelling kits. The sea is entirely yours — however you choose to meet it.",
    image: {
      src: boatsConfig.fleet[1]?.images.gallery[0] ?? boatsConfig.fleet[1]?.images.primary,
      alt: "Water sports at sea — replace with /public/images/extras/watersports.jpg",
    },
  },
  {
    number: "03",
    category: "Culinary",
    title: "Private Chef's Table",
    description:
      "A bespoke tasting menu crafted daily from the finest seasonal produce. Paired with curated wines from our cellar and served wherever you desire — on deck, ashore, or below.",
    image: {
      src: boatsConfig.fleet[0]?.images.gallery[0] ?? boatsConfig.fleet[0]?.images.primary,
      alt: "Private chef dining experience — replace with /public/images/extras/chef.jpg",
    },
  },
  {
    number: "04",
    category: "Suite & Wellness",
    title: "Onboard Suite Styling",
    description:
      "Fresh florals, signature candles, and bespoke fragrance settings tailored to your occasion. Crafted for proposals, anniversaries, or any moment that deserves to feel extraordinary.",
    image: {
      src: boatsConfig.fleet[0]?.images.gallery[1] ?? boatsConfig.fleet[0]?.images.primary,
      alt: "Styled yacht cabin suite — replace with /public/images/extras/suite.jpg",
    },
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component — one alternating row
// ─────────────────────────────────────────────────────────────────────────────

interface ExtraRowProps {
  /** The extra item to render. */
  extra: (typeof EXTRAS)[number];
  /** 0-based index; even = photo left, odd = photo right. */
  index: number;
}

/**
 * Renders a single premium extra as a two-column editorial row.
 * Alternates the photo / text order on every even index so the
 * page feels dynamic without repetition.
 */
function ExtraRow({ extra, index }: ExtraRowProps) {
  const ref      = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  /** true = photo on the RIGHT, text on the LEFT */
  const isEven = index % 2 === 1;

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 lg:grid-cols-2 border-b border-midnight/[0.07] last:border-b-0"
    >
      {/* ══ Photo column ══ */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? 30 : -30 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.85, ease: EASE }}
        className={`
          relative overflow-hidden group
          h-[380px] sm:h-[440px] lg:h-[520px]
          bg-midnight/5
          ${isEven ? "lg:order-2" : "lg:order-1"}
        `}
      >
        <img
          src={extra.image.src}
          alt={extra.image.alt}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />

        {/* Depth vignette */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-midnight/30 pointer-events-none" />

        {/* Category badge — dark pill at image corner */}
        <div className="absolute top-6 left-6 bg-midnight/80 backdrop-blur-sm px-3.5 py-1.5 pointer-events-none">
          <span className="text-gold text-[9px] font-body tracking-[0.32em] uppercase">
            {extra.category}
          </span>
        </div>

        {/* Gold corner accent — mirrors the alternating direction */}
        {isEven ? (
          <>
            <div aria-hidden className="absolute bottom-0 right-0 w-11 h-px bg-gold/55" />
            <div aria-hidden className="absolute bottom-0 right-0 w-px h-11 bg-gold/55" />
          </>
        ) : (
          <>
            <div aria-hidden className="absolute top-0 right-0 w-11 h-px bg-gold/55" />
            <div aria-hidden className="absolute top-0 right-0 w-px h-11 bg-gold/55" />
          </>
        )}
      </motion.div>

      {/* ══ Content column ══ */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? -20 : 20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.85, delay: 0.1, ease: EASE }}
        className={`
          relative flex flex-col justify-center
          px-8 sm:px-12 lg:px-16 py-14
          ${isEven ? "lg:order-1" : "lg:order-2"}
        `}
      >
        {/* Ghost number — large editorial digit behind the text */}
        <div
          aria-hidden
          className="absolute select-none pointer-events-none font-heading font-bold leading-none top-1/2 -translate-y-1/2"
          style={{
            fontSize: "clamp(120px, 14vw, 200px)",
            color: "rgba(10,15,26,0.04)",
            right: isEven ? "auto" : "-0.1em",
            left:  isEven ? "-0.1em" : "auto",
          }}
        >
          {extra.number}
        </div>

        {/* ── Number + category strip ── */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-gold/45 text-[10px] font-body tracking-[0.12em] tabular-nums">
            {extra.number}
          </span>
          <div className="w-8 h-px bg-gold/30" />
          <span className="text-gold text-[10px] font-body tracking-[0.28em] uppercase">
            {extra.category}
          </span>
        </div>

        {/* ── Title ── */}
        <h3 className="font-heading text-3xl lg:text-[2.1rem] xl:text-4xl text-midnight font-light leading-[1.15] mb-5">
          {extra.title}
        </h3>

        {/* Gold hairline below title */}
        <div
          className="w-10 h-px mb-6"
          style={{
            background:
              "linear-gradient(90deg, rgba(201,162,39,0.7) 0%, transparent 100%)",
          }}
        />

        {/* ── Description ── */}
        <p className="text-midnight/45 font-body text-[15px] leading-[1.9] max-w-[26rem]">
          {extra.description}
        </p>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main section export
// ─────────────────────────────────────────────────────────────────────────────

export function PremiumExtrasSection() {
  const headingRef     = useRef<HTMLDivElement>(null);
  const headingInView  = useInView(headingRef, { once: true, margin: "-60px" });

  return (
    /*
     * overflow-hidden is required here because each ExtraRow uses a slight
     * X-axis entrance animation. Without clipping, the animating element
     * briefly extends beyond the viewport and causes horizontal scroll.
     */
    <section className="bg-white overflow-hidden border-t border-midnight/[0.06]">

      {/* ══ Centered section heading ══ */}
      <div ref={headingRef} className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Eyebrow with flanking gold hairlines — edit CONTENT.eyebrow above */}
          <div className="flex items-center justify-center gap-5 mb-9">
            <div className="w-12 h-px bg-gold/50" />
            <p className="text-gold text-[10px] font-body tracking-[0.35em] uppercase">
              {CONTENT.eyebrow}
            </p>
            <div className="w-12 h-px bg-gold/50" />
          </div>

          {/* Headline — edit CONTENT.headlinePrefix/Highlight/Suffix above */}
          <h2 className="font-heading text-4xl lg:text-[3rem] xl:text-[3.2rem] text-midnight font-light leading-[1.2]">
            {CONTENT.headlinePrefix}{" "}
            <span
              className="text-gold"
              style={{ fontStyle: "italic" }}
            >
              {CONTENT.headlineHighlight}
            </span>
            {" "}{CONTENT.headlineSuffix}
          </h2>
        </motion.div>
      </div>

      {/* ══ Alternating extras rows ══ */}
      <div className="border-t border-midnight/[0.07]">
        <div className="max-w-7xl mx-auto">
          {EXTRAS.map((extra, i) => (
            <ExtraRow key={extra.number} extra={extra} index={i} />
          ))}
        </div>
      </div>

      {/* Bottom breathing room */}
      <div className="pb-6" />

    </section>
  );
}
