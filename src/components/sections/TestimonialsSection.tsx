/**
 * ============================================================
 * OCEANIQUE — TestimonialsSection
 * ============================================================
 * Client testimonials carousel/grid on the homepage.
 * Displays quotes, client names, locations, and star ratings.
 *
 * DATA SOURCES:
 * - Testimonial content → defined locally in `testimonials` array below
 *
 * CUSTOMIZE:
 * - To add/edit testimonials: update the `testimonials` array below.
 *   Each entry has: quote, author, location, rating (1–5), boat (optional).
 * - To change the section background: update className on <section>.
 * ============================================================
 *
 * TODO: Build out this component — see design spec.
 * Planned features:
 *  - Framer Motion horizontal carousel with drag-to-scroll
 *  - Star rating display (gold filled stars)
 *  - Auto-advancing slide with manual prev/next arrows
 *  - Author avatar placeholder
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";

/**
 * Edit this array to change the displayed testimonials.
 * Each entry: quote, author, location, rating (1-5), boat (optional).
 */
const testimonials = [
  {
    quote:
      "An utterly flawless experience from start to finish. The crew anticipated our every need, the vessel was immaculate, and the sunset over Monaco was simply breathtaking.",
    author: "Alexandre Dupont",
    location: "Paris, France",
    rating: 5,
    boat: "Azure Horizon",
  },
  {
    quote:
      "We brought our executive team aboard Obsidian for a strategy retreat and it was transformative. Oceanique delivered perfection — professionalism at every turn.",
    author: "Isabella Romano",
    location: "Milan, Italy",
    rating: 5,
    boat: "Obsidian",
  },
  {
    quote:
      "Our anniversary charter on Celeste was the most romantic evening of our lives. The crew prepared a private dinner on deck as the stars came out. Truly magical.",
    author: "Margot Lefèvre",
    location: "Brussels, Belgium",
    rating: 5,
    boat: "Celeste",
  },
  {
    quote:
      "From the first enquiry to the final farewell, every interaction with Oceanique was exceptional. I cannot recommend them highly enough.",
    author: "James Whitfield",
    location: "London, United Kingdom",
    rating: 5,
    boat: "Azure Horizon",
  },
];

const AUTO_ADVANCE_MS = 6000;

export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const count = testimonials.length;

  const go = useCallback(
    (dir: 1 | -1) => {
      setDirection(dir);
      setActive((prev) => (prev + dir + count) % count);
    },
    [count]
  );

  /* Auto-advance */
  useEffect(() => {
    const timer = setTimeout(() => go(1), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [active, go]);

  const t = testimonials[active];

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -60 : 60 }),
  };

  return (
    <section className="bg-white py-24 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <SectionHeading
          eyebrow="Client Stories"
          title="Words from Our Guests"
          description="The measure of our success is the joy of those we serve."
        />

        {/* Carousel */}
        <div className="mt-16 relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={active}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.25, 0.1, 0, 1] }}
              className="border border-silver/40 p-10 relative"
            >
              {/* Decorative quote mark */}
              <span className="font-heading text-9xl text-gold/10 absolute top-2 left-6 leading-none select-none pointer-events-none">
                &ldquo;
              </span>

              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <span key={s} className="text-gold text-base leading-none">★</span>
                ))}
              </div>

              <blockquote className="font-heading text-2xl text-midnight font-light leading-snug mb-8 italic">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body font-semibold text-midnight text-sm">
                    {t.author}
                  </p>
                  <p className="text-silver-dark text-xs font-body mt-0.5">
                    {t.location}
                  </p>
                </div>
                {t.boat && (
                  <span className="text-gold text-[11px] font-body tracking-[0.2em] uppercase">
                    {t.boat}
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Prev / Next */}
          <div className="flex items-center justify-between mt-6">
            {/* Dot indicators */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > active ? 1 : -1); setActive(i); }}
                  className={`w-6 h-px transition-colors duration-200 ${i === active ? "bg-gold" : "bg-silver/40 hover:bg-silver"}`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            {/* Arrow buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => go(-1)}
                aria-label="Previous testimonial"
                className="w-9 h-9 border border-silver/40 flex items-center justify-center text-midnight/50 hover:border-gold hover:text-gold transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Next testimonial"
                className="w-9 h-9 border border-silver/40 flex items-center justify-center text-midnight/50 hover:border-gold hover:text-gold transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
