/**
 * ============================================================
 * OCEANIQUE — HeroSection
 * ============================================================
 * Full-viewport hero section on the homepage. Features a
 * full-bleed looping background video (separate cuts for
 * mobile and desktop), a multi-layer overlay for legibility,
 * Framer Motion stagger entrance animation, dual CTAs, and
 * an animated scroll indicator.
 *
 * DATA SOURCES:
 * - Tagline / description → src/config/site.config.ts (brand)
 * - CTA buttons           → src/config/site.config.ts (cta.primary / cta.secondary)
 * - Desktop video         → /public/videos/hero/HeroSection-video-desk.mp4
 * - Mobile video          → /public/videos/hero/HeroSection-video-mob.mp4
 *
 * CUSTOMIZE:
 * - To change text:       edit site.config.ts > brand.tagline / brand.description
 * - To change CTAs:       edit site.config.ts > cta.primary / cta.secondary
 * - To replace videos:    swap the mp4 files in /public/videos/hero/ keeping
 *                         the same filenames, or update the src paths below.
 * - Mobile breakpoint:    videos switch at Tailwind's `md` (768 px). To change
 *                         this, update both `block md:hidden` / `hidden md:block`
 *                         classes on the two <video> elements below.
 * - Overlay opacity:      adjust the opacity stop values inside `.overlay-midnight`
 *                         in src/app/globals.css.
 * - Z-index layers:       videos = z-0 | overlays = z-0 | content = z-20 | scroll = z-20
 *
 * BOOKING MODAL:
 * - Primary CTA opens <WebsiteBookingModal> via useWebsiteBooking().open().
 * - The modal is mounted at the app root (ClientProviders → WebsiteBookingProvider)
 *   so it appears above all page content, including the website navigation.
 * ============================================================
 */

"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { useWebsiteBooking } from "@/contexts/WebsiteBookingContext";

/** Luxury bezier easing curve — cast to satisfy Framer Motion's BezierDefinition */
const LUXURY_EASE = [0.25, 0.1, 0, 1] as [number, number, number, number];

/** Stagger parent — each child animates in sequence */
const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

/** Child fade-up variant */
const item: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: LUXURY_EASE },
  },
};

export function HeroSection() {
  /** Opens the 4-step charter booking modal from the primary CTA. */
  const { open: openBookingModal } = useWebsiteBooking();

  return (
    <section className="relative min-h-screen flex items-end justify-center overflow-hidden bg-midnight-mid">
      {/* ---- Background videos ----
          Two separate video files are used so each can be shot/cropped for its
          target viewport. Both autoplay muted and loop with no controls.
          Visibility is toggled at the `md` breakpoint (768 px) via Tailwind.
          To replace: swap the files in /public/videos/hero/ or update src below.
      */}

      {/* Mobile video — shown below md (portrait crop) */}
      <video
        className="absolute inset-0 z-0 w-full h-full object-cover block md:hidden"
        src="/videos/hero/HeroSection-video-mob.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />

      {/* Desktop video — shown at md and above (landscape crop) */}
      <video
        className="absolute inset-0 z-0 w-full h-full object-cover hidden md:block"
        src="/videos/hero/HeroSection-video-desk.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />

      {/* Decorative radial glow behind headline */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,162,39,0.10) 0%, transparent 70%)",
        }}
      />

      {/* Global top-to-bottom fade */}
      <div className="absolute inset-0 overlay-midnight pointer-events-none" />

      {/* Dedicated content scrim — strong dark gradient covering only the
          lower 55 % of the viewport where all text and CTAs live.
          This ensures legibility regardless of what the video shows. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[55%] pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(10,15,26,0.55) 40%, rgba(10,15,26,0.82) 100%)",
        }}
      />

      {/* ---- Content ---- */}
      <motion.div
        className="relative z-20 text-center px-6 max-w-5xl mx-auto pb-40 pt-32"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* Eyebrow */}
        <motion.p
          variants={item}
          className="text-gold tracking-[0.5em] uppercase text-xs font-body font-medium mb-8 [text-shadow:0_1px_12px_rgba(0,0,0,0.9)]"
        >
          Luxury Yacht Charter
        </motion.p>

        {/* Main headline */}
        <motion.h1
          variants={item}
          className="font-heading text-5xl sm:text-7xl md:text-8xl text-white font-light leading-none mb-8 [text-wrap:balance] [text-shadow:0_2px_24px_rgba(0,0,0,0.8),0_1px_6px_rgba(0,0,0,0.6)]"
        >
          {siteConfig.brand.tagline}
        </motion.h1>

        {/* Gold divider */}
        <motion.div variants={item} className="flex justify-center mb-8">
          <div className="w-16 h-px bg-gold [filter:drop-shadow(0_0_6px_rgba(201,162,39,0.6))]" />
        </motion.div>

        {/* Description */}
        <motion.p
          variants={item}
          className="text-white/95 text-base md:text-lg font-body font-light max-w-2xl mx-auto mb-12 leading-relaxed [text-shadow:0_2px_20px_rgba(0,0,0,1),0_1px_6px_rgba(0,0,0,0.9)]"
        >
          {siteConfig.brand.description}
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={item}
          className="flex items-center justify-center gap-5 flex-wrap"
        >
          {/* ── Primary: gold gradient + shimmer sweep + glow lift ── */}
          <motion.div
            initial="rest"
            whileHover="hover"
            whileTap={{ scale: 0.97 }}
            variants={{
              rest: { y: 0, boxShadow: "0 0 0px rgba(201,162,39,0)" },
              hover: {
                y: -3,
                boxShadow: "0 12px 40px rgba(201,162,39,0.50), 0 4px 12px rgba(201,162,39,0.30)",
                transition: { duration: 0.25, ease: "easeOut" },
              },
            }}
            className="relative overflow-hidden"
          >
            {/*
             * Renders as a <button> (not a link) because clicking opens the
             * 4-step booking modal rather than navigating to a new page.
             * All visual styles are preserved identically from the previous Link.
             */}
            <button
              onClick={() => openBookingModal()}
              aria-label={siteConfig.cta.primary.ariaLabel}
              className="relative flex items-center px-10 py-[15px] text-midnight text-xs font-body font-semibold tracking-[0.3em] uppercase overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #D4B245 0%, #C9A227 50%, #A8851E 100%)",
              }}
            >
              {/* Diagonal shimmer sweep */}
              <motion.span
                aria-hidden="true"
                className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                variants={{
                  rest: { x: "-130%" },
                  hover: { x: "230%", transition: { duration: 0.55, ease: "easeInOut" } },
                }}
              />
              <span className="relative z-10">{siteConfig.cta.primary.text}</span>
            </button>
          </motion.div>

          {/* ── Secondary: ghost border + gold fill from bottom ── */}
          <motion.div
            initial="rest"
            whileHover="hover"
            whileTap={{ scale: 0.97 }}
            variants={{
              rest: { borderColor: "rgba(255,255,255,0.50)", y: 0 },
              hover: {
                borderColor: "rgba(201,162,39,1)",
                y: -3,
                transition: { duration: 0.2, ease: "easeOut" },
              },
            }}
            className="relative overflow-hidden border"
          >
            {/* Gold fill that rises from bottom */}
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 bg-gold pointer-events-none"
              style={{ transformOrigin: "bottom" }}
              variants={{
                rest: { scaleY: 0 },
                hover: { scaleY: 1, transition: { duration: 0.35, ease: [0.25, 0.1, 0, 1] } },
              }}
            />
            <Link
              href={siteConfig.cta.secondary.href}
              aria-label={siteConfig.cta.secondary.ariaLabel}
              className="relative z-10 flex items-center px-10 py-[15px] text-xs font-body font-medium tracking-[0.3em] uppercase"
            >
              <motion.span
                variants={{
                  rest: { color: "rgba(255,255,255,0.95)" },
                  hover: { color: "#0A0F1A", transition: { duration: 0.15, delay: 0.1 } },
                }}
                className="[text-shadow:0_1px_8px_rgba(0,0,0,0.8)]"
              >
                {siteConfig.cta.secondary.text}
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ---- Animated scroll indicator ---- */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
      >
        {/* Two staggered chevrons — top one slightly faded, bottom one bright */}
        <motion.div
          animate={{ y: [0, 6, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="text-gold [filter:drop-shadow(0_0_6px_rgba(201,162,39,0.7))]"
        >
          <ChevronDown size={20} />
        </motion.div>
        <motion.div
          animate={{ y: [0, 6, 0], opacity: [0.9, 1, 0.9] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut", delay: 0.15 }}
          className="text-gold -mt-2 [filter:drop-shadow(0_0_8px_rgba(201,162,39,0.9))]"
        >
          <ChevronDown size={22} />
        </motion.div>

        <span className="mt-2 text-white/70 text-[10px] tracking-[0.4em] uppercase font-body [text-shadow:0_1px_8px_rgba(0,0,0,0.9)]">
          Scroll
        </span>
      </motion.div>
    </section>
  );
}
