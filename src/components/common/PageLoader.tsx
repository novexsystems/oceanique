"use client";

import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { siteConfig } from "@/config/site.config";

interface PageLoaderProps {
  /** Label shown below the brand name — e.g. "Admin Dashboard" or "Guest Portal" */
  label?: string;
}

/**
 * Full-screen branded loader shown once when a user lands on
 * the dashboard or portal after signing in.
 *
 * Uses useAnimation + async IIFE so React 18 Strict Mode's effect
 * cleanup cannot cancel the dismiss sequence (fire-and-forget async
 * is not affected by useEffect cleanup).
 *
 * Sequence:
 *  0 – 800 ms   : logo + rule + label fade in
 *  300 – 1500 ms: gold progress bar fills
 *  1600 ms      : curtain rises (y: "-100%")  [700 ms]
 *  2300 ms      : element removed from DOM
 */
export const LOGIN_FLAG_KEY = "oceanique_just_logged_in";

export function PageLoader({ label }: PageLoaderProps) {
  const [show, setShow] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    const flag = sessionStorage.getItem(LOGIN_FLAG_KEY);
    if (!flag) return;
    sessionStorage.removeItem(LOGIN_FLAG_KEY);
    setShow(true);

    /* Fire-and-forget async sequence — not cancelled by Strict Mode cleanup */
    (async () => {
      await new Promise<void>((r) => setTimeout(r, 1600));
      await controls.start({
        y: "-100%",
        transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
      });
      setShow(false);
    })();
  }, [controls]);

  if (!show) return null;

  return (
    <motion.div
      animate={controls}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(150deg, #0A0F1A 0%, #0D1526 60%, #0A0F1A 100%)",
      }}
    >
      {/* Top gold accent */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(201,162,39,0.7) 50%, transparent 100%)",
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 55%, rgba(201,162,39,0.06) 0%, transparent 70%)",
        }}
      />

      {/* ── Centre brand mark ── */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2, ease: [0.25, 0.1, 0, 1] }}
          className="flex flex-col items-center gap-1"
        >
          <span className="font-heading text-white text-4xl tracking-[0.45em] uppercase leading-none">
            {siteConfig.brand.logoText}
          </span>
          <span className="text-[9px] font-body tracking-[0.55em] uppercase text-white/25 leading-none pl-1">
            Charter Yachts
          </span>
        </motion.div>

        {/* Gold rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.55, ease: [0.25, 0.1, 0, 1] }}
          className="w-12 h-px origin-left"
          style={{ background: "linear-gradient(90deg, #C9A227, #D4B245, #C9A227)" }}
        />

        {/* Destination label */}
        {label && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-[10px] font-body tracking-[0.35em] uppercase text-white/30"
          >
            {label}
          </motion.p>
        )}
      </div>

      {/* ── Bottom progress bar ── */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-white/5">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.1, 0, 1] }}
          className="h-full origin-left"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #C9A227 40%, #D4B245 60%, transparent 100%)",
          }}
        />
      </div>
    </motion.div>
  );
}
