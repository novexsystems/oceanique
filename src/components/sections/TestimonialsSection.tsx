/**
 * ============================================================
 * OCEANIQUE — TestimonialsSection
 * ============================================================
 * Horizontally scrollable testimonials carousel on the homepage.
 * Each card supports an optional experience photo (shown at the
 * top of the card) and an optional guest avatar (shown in the
 * author row with a gold-monogram fallback).
 *
 * Background matches ServicesSection (bg-midnight) so it
 * bookends the white PremiumExtrasSection cleanly.
 *
 * LAYOUT:
 *  - Centered heading
 *  - Horizontal scroll track — cards snap into place
 *  - ~3 cards visible on desktop, ~1.2 on mobile (peek effect)
 *  - Auto-advances every AUTO_ADVANCE_MS ms; pauses on hover
 *  - Prev / Next arrows + dash indicator strip + "01/04" counter
 *
 * HOW TO CUSTOMISE:
 *  ┌─────────────────────────────────────────────────────────┐
 *  │ 1. HEADING TEXT                                         │
 *  │    → edit the CONTENT object below                      │
 *  │                                                         │
 *  │ 2. ADD / EDIT / REMOVE TESTIMONIALS                     │
 *  │    → edit the testimonials array below                  │
 *  │    → adding more objects automatically grows the track  │
 *  │                                                         │
 *  │ 3. ADD A PROFILE PICTURE                                │
 *  │    → set avatar: "/images/testimonials/name.jpg"        │
 *  │    → place the file in /public/images/testimonials/     │
 *  │    → without avatar: gold monogram circle is shown      │
 *  │                                                         │
 *  │ 4. ADD AN EXPERIENCE PHOTO                              │
 *  │    → set photo: "/images/testimonials/name-exp.jpg"     │
 *  │    → landscape images look best (16:9 or 4:3)           │
 *  │    → without photo: card shows a text-only layout       │
 *  │                                                         │
 *  │ 5. AUTO-ADVANCE SPEED                                   │
 *  │    → change AUTO_ADVANCE_MS below                       │
 *  └─────────────────────────────────────────────────────────┘
 * ============================================================
 */

"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Shared easing curve — matches every other homepage section. */
const EASE = [0.25, 0.1, 0, 1] as const;

// ─────────────────────────────────────────────────────────────────────────────
// ✏️  EDIT HERE — Auto-advance speed
// ─────────────────────────────────────────────────────────────────────────────
/** Milliseconds between automatic card advances. Set to 0 to disable. */
const AUTO_ADVANCE_MS = 5500;

// ─────────────────────────────────────────────────────────────────────────────
// ✏️  EDIT HERE — Section heading copy
// ─────────────────────────────────────────────────────────────────────────────
/** All heading text for this section. */
const CONTENT = {
  /** Small uppercase label flanked by gold hairlines. */
  eyebrow: "Client Stories",
  /** Main section title in white heading font. */
  title: "Words from Our Guests",
  /** Muted subtitle below the title. Set to "" to hide. */
  subtitle: "The measure of our success is the joy of those we serve.",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// ✏️  EDIT HERE — Testimonials
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Each object renders one card in the carousel.
 *
 *  - quote    : the testimonial text (2–4 sentences recommended)
 *  - author   : guest full name
 *  - location : "City, Country" format
 *  - rating   : integer 1–5 (renders filled gold stars)
 *  - boat     : (optional) vessel name shown in gold uppercase
 *
 *  - avatar   : (optional) path to a profile photo
 *               → place the file in /public/images/testimonials/
 *               → e.g.  avatar: "/images/testimonials/alexandre.jpg"
 *               → if omitted, a gold circle with the guest's initial is shown
 *
 *  - photo    : (optional) path to an experience / charter photo
 *               → landscape images look best (16:9 or 4:3 ratio)
 *               → e.g.  photo: "/images/testimonials/alexandre-exp.jpg"
 *               → if omitted, the card uses a text-only layout
 *
 * Add as many objects as you like — the carousel handles any count.
 */
const testimonials = [
  {
    quote:
      "An utterly flawless experience from start to finish. The crew anticipated our every need, the vessel was immaculate, and the sunset over Monaco was simply breathtaking.",
    author: "Alexandre Dupont",
    location: "Paris, France",
    rating: 5,
    boat: "Azure Horizon",
    avatar: "",   // e.g. "/images/testimonials/alexandre.jpg"
    photo: "",    // e.g. "/images/testimonials/alexandre-exp.jpg"
  },
  {
    quote:
      "We brought our executive team aboard Obsidian for a strategy retreat and it was transformative. Oceanique delivered perfection — professionalism at every turn.",
    author: "Isabella Romano",
    location: "Milan, Italy",
    rating: 5,
    boat: "Obsidian",
    avatar: "",
    photo: "",
  },
  {
    quote:
      "Our anniversary charter on Celeste was the most romantic evening of our lives. The crew prepared a private dinner on deck as the stars came out. Truly magical.",
    author: "Margot Lefèvre",
    location: "Brussels, Belgium",
    rating: 5,
    boat: "Celeste",
    avatar: "",
    photo: "",
  },
  {
    quote:
      "From the first enquiry to the final farewell, every interaction with Oceanique was exceptional. I cannot recommend them highly enough to anyone seeking genuine luxury at sea.",
    author: "James Whitfield",
    location: "London, United Kingdom",
    rating: 5,
    boat: "Azure Horizon",
    avatar: "",
    photo: "",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Main section export — "Spotlight" design
// One testimonial shown at a time; AnimatePresence fades between them.
// No horizontal scrolling, no flex-row track — zero layout ambiguity.
// ─────────────────────────────────────────────────────────────────────────────

export function TestimonialsSection() {
  /** Index of the currently displayed testimonial. */
  const [active, setActive] = useState(0);
  /** When true the auto-advance timer is suspended. */
  const [paused, setPaused] = useState(false);

  const count    = testimonials.length;
  const ref      = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  /** Jump to a specific testimonial index. */
  const goTo = useCallback((idx: number) => setActive(idx), []);

  /** Step one testimonial forward or backward, wrapping at ends. */
  const go = useCallback(
    (dir: 1 | -1) => goTo((active + dir + count) % count),
    [active, count, goTo],
  );

  /* Auto-advance — pauses on hover or touch. */
  useEffect(() => {
    if (!AUTO_ADVANCE_MS || paused) return;
    const timer = setTimeout(() => go(1), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [active, paused, go]);

  /** Active testimonial data. */
  const t       = testimonials[active];
  /** Monogram fallback — first letter of the author's name. */
  const initial = t.author.charAt(0).toUpperCase();

  return (
    <section
      ref={ref}
      className="bg-midnight py-20 sm:py-32 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="max-w-2xl mx-auto px-8">

        {/* ══ Section heading ══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: EASE }}
          className="text-center mb-14 sm:mb-20"
        >
          {/* Eyebrow with flanking gold hairlines */}
          <div className="flex items-center justify-center gap-5 mb-6">
            <div className="w-12 h-px bg-gold/50" />
            <p className="text-gold text-[10px] font-body tracking-[0.35em] uppercase">
              {CONTENT.eyebrow}
            </p>
            <div className="w-12 h-px bg-gold/50" />
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white font-light leading-tight">
            {CONTENT.title}
          </h2>

          {CONTENT.subtitle && (
            <p className="text-silver/35 font-body text-sm tracking-[0.06em] mt-4">
              {CONTENT.subtitle}
            </p>
          )}
        </motion.div>

        {/* ══ Spotlight testimonial ══ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
        >
          {/* Decorative oversized opening-quote glyph */}
          <div className="text-center mb-2" aria-hidden>
            <span
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "5rem",
                lineHeight: 0.8,
                color: "rgba(201,162,39,0.12)",
                display: "block",
              }}
            >
              &ldquo;
            </span>
          </div>

          {/* Animated testimonial body — fades on every change */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {/* ── Stars ── */}
              <div
                aria-label={`${t.rating} out of 5 stars`}
                className="flex justify-center gap-1 mb-7"
              >
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span
                    key={i}
                    style={{ color: "#C9A227", fontSize: 16, lineHeight: 1 }}
                    aria-hidden
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* ── Quote ── */}
              <blockquote className="font-heading text-lg sm:text-xl text-white/70 font-light italic leading-relaxed text-center mb-10">
                {t.quote}
              </blockquote>

              {/* Gold ornamental rule */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-10 h-px bg-gold/25" />
                <div className="w-1 h-1 rounded-full bg-gold/40" />
                <div className="w-10 h-px bg-gold/25" />
              </div>

              {/* ── Author ── */}
              <div className="flex flex-col items-center gap-4">

                {/* Avatar — profile photo or gold monogram */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "1px solid rgba(201,162,39,0.25)",
                    background: "rgba(201,162,39,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {t.avatar ? (
                    <img
                      src={t.avatar}
                      alt={`${t.author} profile photo`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span
                      className="text-gold font-body font-semibold"
                      style={{ fontSize: 18 }}
                    >
                      {initial}
                    </span>
                  )}
                </div>

                {/* Name, location, vessel */}
                <div className="text-center">
                  <p
                    className="text-white font-body font-semibold"
                    style={{ fontSize: 14, letterSpacing: "0.03em" }}
                  >
                    {t.author}
                  </p>
                  <p
                    className="font-body"
                    style={{
                      fontSize: 11,
                      color: "rgba(192,200,215,0.35)",
                      marginTop: 4,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {t.location}
                  </p>
                  {t.boat && (
                    <p
                      className="font-body"
                      style={{
                        fontSize: 9,
                        color: "rgba(201,162,39,0.5)",
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        marginTop: 10,
                      }}
                    >
                      {t.boat}
                    </p>
                  )}
                </div>
              </div>

            </motion.div>
          </AnimatePresence>

          {/* ══ Navigation ══ */}
          <div className="flex items-center justify-center gap-6 mt-14">

            {/* Prev */}
            <button
              onClick={() => go(-1)}
              aria-label="Previous testimonial"
              className="w-9 h-9 border border-white/[0.1] flex items-center justify-center text-white/35 hover:border-gold/70 hover:text-gold transition-colors duration-200"
            >
              <ChevronLeft size={15} />
            </button>

            {/* Dash indicator strip */}
            <div className="flex items-center gap-2" role="tablist" aria-label="Testimonial indicators">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Go to testimonial ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`
                    h-px rounded-full transition-all duration-300
                    ${i === active ? "w-8 bg-gold" : "w-3.5 bg-white/15 hover:bg-white/35"}
                  `}
                />
              ))}
            </div>

            {/* Next */}
            <button
              onClick={() => go(1)}
              aria-label="Next testimonial"
              className="w-9 h-9 border border-white/[0.1] flex items-center justify-center text-white/35 hover:border-gold/70 hover:text-gold transition-colors duration-200"
            >
              <ChevronRight size={15} />
            </button>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
