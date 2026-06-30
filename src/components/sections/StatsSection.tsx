/**
 * ============================================================
 * OCEANIQUE — StatsSection
 * ============================================================
 * A horizontal strip of animated KPI numbers (e.g. years in
 * business, fleet size, satisfied clients). Appears between
 * the hero and the fleet section on the homepage.
 *
 * Counts up from 0 to target value when the section scrolls
 * into view, using Framer Motion's useInView + useMotionValue.
 *
 * DATA SOURCES:
 * - Stat values / labels → `stats` array defined below
 * - Founded year         → src/config/site.config.ts (brand.foundedYear)
 *
 * CUSTOMIZE:
 * - To change the stats: edit the `stats` array below.
 * - To change the background: update the section className.
 * ============================================================
 */

"use client";

import { useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { siteConfig } from "@/config/site.config";

/**
 * Edit this array to change which stats are displayed.
 * `value` is the final number, `suffix` is appended after it.
 */
const stats = [
  {
    value: new Date().getFullYear() - siteConfig.brand.foundedYear,
    suffix: "+",
    label: "Years of Excellence",
  },
  {
    value: 4,
    suffix: "",
    label: "Luxury Vessels",
  },
  {
    value: 248,
    suffix: "+",
    label: "Satisfied Clients",
  },
  {
    value: 98,
    suffix: "%",
    label: "5-Star Reviews",
  },
];

/** Individual animated counter */
function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!isInView) return;
    const ctrl = animate(motionVal, target, { duration: 1.8, ease: "easeOut" });
    return ctrl.stop;
  }, [isInView, motionVal, target]);

  return (
    <span ref={ref} className="inline-flex items-baseline gap-0">
      <motion.span className="font-heading text-5xl md:text-6xl text-gold font-light tabular-nums">
        {rounded}
      </motion.span>
      <span className="font-heading text-3xl text-gold/70 font-light">{suffix}</span>
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="bg-midnight py-16 px-6 border-y border-white/5">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`
              text-center py-6 px-4
              ${i < stats.length - 1 ? "border-r border-white/5" : ""}
            `}
          >
            <CountUp target={stat.value} suffix={stat.suffix} />
            <div className="w-8 h-px bg-gold/30 mx-auto my-4" />
            <p className="text-silver/50 text-[11px] tracking-[0.25em] uppercase font-body">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
