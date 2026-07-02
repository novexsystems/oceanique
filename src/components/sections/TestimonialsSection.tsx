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
import type { CSSProperties } from "react";
import { motion, useInView } from "framer-motion";
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
// Type helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Shape of a single testimonial entry. */
type Testimonial = (typeof testimonials)[number];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component — individual card
// ─────────────────────────────────────────────────────────────────────────────

interface CardProps {
  /** Testimonial data for this card. */
  t: Testimonial;
  /** Whether this card is the currently active/focused card. */
  isActive: boolean;
  /** Click handler to promote this card to active. */
  onClick: () => void;
}

/**
 * Renders a single testimonial card.
 *
 * Layout variants:
 *  - With `photo`  : experience image fills the top of the card.
 *  - Without photo : full-height text card with decorative quote glyph.
 *  - With `avatar` : circular profile photo in the author row.
 *  - Without avatar: gold monogram circle (first initial) fallback.
 *
 * The active card has a gold border; inactive cards have a dim border
 * that brightens on hover, matching the ServicesSection card pattern.
 */
function TestimonialCard({ t, isActive, onClick }: CardProps) {
  /** First letter of the author's name — used as monogram fallback. */
  const initial = t.author.charAt(0).toUpperCase();

  return (
    <article
      onClick={onClick}
      /* scroll-snap-align via style — inline so it survives Tailwind purge */
      style={{ scrollSnapAlign: "start" }}
      className={`
        w-[300px] sm:w-[340px] lg:w-[380px]
        flex-shrink-0 flex flex-col
        border transition-all duration-300 cursor-pointer
        ${isActive
          ? "border-gold/50"
          : "border-white/[0.08] hover:border-white/20"}
      `}
    >
      {/* ── Experience photo (rendered only when photo path is set) ── */}
      {t.photo ? (
        <div className="h-48 overflow-hidden flex-shrink-0">
          <img
            src={t.photo}
            alt={`${t.author}'s charter experience`}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
          />
        </div>
      ) : null}

      {/* ── Card body ── */}
      <div className={`flex flex-col flex-1 p-7 relative ${!t.photo ? "pt-9" : ""}`}>

        {/* Decorative oversized quote glyph — shown only on text-only cards */}
        {!t.photo && (
          <span
            aria-hidden
            className="font-heading absolute top-3 left-4 leading-none select-none pointer-events-none"
            style={{ fontSize: "5.5rem", color: "rgba(201,162,39,0.08)" }}
          >
            &ldquo;
          </span>
        )}

        {/* ── Star rating ── */}
        <div
          className="flex gap-0.5 mb-5 relative z-10"
          aria-label={`${t.rating} out of 5 stars`}
        >
          {Array.from({ length: t.rating }).map((_, s) => (
            <span key={s} className="text-gold text-sm leading-none" aria-hidden>
              ★
            </span>
          ))}
        </div>

        {/* ── Quote ── */}
        <blockquote className="font-heading text-[1.0rem] text-silver/55 font-light italic leading-[1.9] mb-7 flex-1 relative z-10">
          &ldquo;{t.quote}&rdquo;
        </blockquote>

        {/* ── Author row ── */}
        <div className="flex items-center gap-3 pt-5 border-t border-white/[0.07]">

          {/* Avatar — profile photo or gold monogram fallback */}
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-white/[0.12]">
            {t.avatar ? (
              <img
                src={t.avatar}
                alt={`${t.author} profile photo`}
                className="w-full h-full object-cover"
              />
            ) : (
              /* Monogram fallback */
              <div className="w-full h-full bg-gold/[0.14] flex items-center justify-center">
                <span className="text-gold text-xs font-body font-semibold">
                  {initial}
                </span>
              </div>
            )}
          </div>

          {/* Name + location */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-body font-semibold leading-snug truncate">
              {t.author}
            </p>
            <p className="text-silver/30 text-[11px] font-body tracking-[0.04em] mt-0.5">
              {t.location}
            </p>
          </div>

          {/* Optional vessel badge */}
          {t.boat && (
            <span className="text-gold/55 text-[9px] font-body tracking-[0.25em] uppercase shrink-0 transition-colors duration-300 group-hover:text-gold">
              {t.boat}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main section export
// ─────────────────────────────────────────────────────────────────────────────

export function TestimonialsSection() {
  /** Index of the currently "active" / snapped card. */
  const [active, setActive]   = useState(0);
  /**
   * When true the auto-advance timer is suspended.
   * Set on mouseEnter, cleared on mouseLeave.
   */
  const [paused, setPaused]   = useState(false);

  const count      = testimonials.length;
  const headingRef = useRef<HTMLDivElement>(null);
  const trackRef   = useRef<HTMLDivElement>(null);
  const isInView   = useInView(headingRef, { once: true, margin: "-60px" });

  /**
   * Scrolls the carousel track to a specific card index and
   * updates the active state so the indicator strip stays in sync.
   */
  const goTo = useCallback((idx: number) => {
    setActive(idx);
    if (!trackRef.current) return;
    const cards = Array.from(trackRef.current.children) as HTMLElement[];
    if (cards[idx]) {
      trackRef.current.scrollTo({
        left: cards[idx].offsetLeft,
        behavior: "smooth",
      });
    }
  }, []);

  /** Moves the carousel one step forward or backward, wrapping at ends. */
  const go = useCallback(
    (dir: 1 | -1) => goTo((active + dir + count) % count),
    [active, count, goTo],
  );

  /* Auto-advance timer — resets whenever active or paused changes. */
  useEffect(() => {
    if (!AUTO_ADVANCE_MS || paused) return;
    const timer = setTimeout(() => go(1), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [active, paused, go]);

  return (
    <section
      className="bg-midnight py-24 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >

      {/* ══ Section heading — edit CONTENT above ══ */}
      <div ref={headingRef} className="max-w-7xl mx-auto px-6 mb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: EASE }}
          className="text-center"
        >
          {/* Eyebrow with flanking gold hairlines */}
          <div className="flex items-center justify-center gap-5 mb-7">
            <div className="w-12 h-px bg-gold/50" />
            <p className="text-gold text-[10px] font-body tracking-[0.35em] uppercase">
              {CONTENT.eyebrow}
            </p>
            <div className="w-12 h-px bg-gold/50" />
          </div>

          {/* Main title */}
          <h2 className="font-heading text-4xl lg:text-5xl text-white font-light leading-tight">
            {CONTENT.title}
          </h2>

          {/* Optional subtitle — hidden when CONTENT.subtitle is "" */}
          {CONTENT.subtitle && (
            <p className="text-silver/35 font-body text-sm tracking-[0.06em] mt-4">
              {CONTENT.subtitle}
            </p>
          )}
        </motion.div>
      </div>

      {/* ══ Horizontal scroll track ══
          The track uses native CSS scroll-snap for smooth card snapping
          on both mouse-drag and the programmatic goTo() calls above.
          The WebKit scrollbar is hidden via an arbitrary Tailwind selector;
          Firefox and IE/Edge use the inline style props. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
        className="max-w-7xl mx-auto"
      >
        <div
          ref={trackRef}
          className="flex gap-5 overflow-x-auto px-6 pb-1 [&::-webkit-scrollbar]:hidden"
          style={{
            scrollSnapType: "x mandatory",
            /* Hide scrollbar in Firefox and legacy IE */
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          } as CSSProperties}
        >
          {testimonials.map((t, i) => (
            <TestimonialCard
              key={t.author}
              t={t}
              isActive={i === active}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </motion.div>

      {/* ══ Navigation bar ══ */}
      <div className="max-w-7xl mx-auto px-6 mt-9 flex items-center justify-between">

        {/* Position counter — "01 / 04" */}
        <p className="text-silver/25 text-[11px] font-body tracking-[0.18em] tabular-nums select-none">
          {String(active + 1).padStart(2, "0")}&nbsp;/&nbsp;{String(count).padStart(2, "0")}
        </p>

        <div className="flex items-center gap-6">
          {/* Dash indicator strip */}
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Testimonial indicators">
            {testimonials.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === active}
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => goTo(i)}
                className={`
                  h-px rounded-full transition-all duration-300
                  ${i === active
                    ? "w-8 bg-gold"
                    : "w-3.5 bg-white/15 hover:bg-white/35"}
                `}
              />
            ))}
          </div>

          {/* Prev / Next arrow buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => go(-1)}
              aria-label="Previous testimonial"
              className="w-9 h-9 border border-white/[0.1] flex items-center justify-center text-white/35 hover:border-gold/70 hover:text-gold transition-colors duration-200"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next testimonial"
              className="w-9 h-9 border border-white/[0.1] flex items-center justify-center text-white/35 hover:border-gold/70 hover:text-gold transition-colors duration-200"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

    </section>
  );
}
