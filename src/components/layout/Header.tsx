/**
 * ============================================================
 * OCEANIQUE — Header (Public Website)
 * ============================================================
 * The top navigation bar shown on all public website pages.
 * Transparent over the hero, transitions to solid on scroll.
 * Collapses to a hamburger menu on mobile.
 *
 * DATA SOURCES:
 * - Brand name / logo  → src/config/site.config.ts (brand)
 * - Nav links          → src/config/navigation.config.ts (website.main)
 * - CTA button         → src/config/site.config.ts (cta.primary)
 *
 * CUSTOMIZE:
 * - To change nav links: edit navigation.config.ts > website.main
 * - To change the CTA:  edit site.config.ts > cta.primary
 * - To use a logo image: set brand.logoImage in site.config.ts and
 *   swap the text below for an <Image> element.
 *
 * BOOKING MODAL:
 * - Both the desktop and mobile "Book Your Charter" CTAs call
 *   useWebsiteBooking().open() rather than navigating, so the
 *   4-step charter booking modal is launched in place.
 * - The mobile drawer is closed before the modal opens.
 * ============================================================
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn } from "lucide-react";
import { navigationConfig } from "@/config/navigation.config";
import { siteConfig } from "@/config/site.config";
import { useWebsiteBooking } from "@/contexts/WebsiteBookingContext";

export function Header() {
  const pathname = usePathname();
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  /** Opens the 4-step booking modal. Also available in the mobile drawer. */
  const { open: openBookingModal } = useWebsiteBooking();

  /* Detect scroll to switch header from transparent → solid */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinks = navigationConfig.website.main;

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-50 h-20
          transition-all duration-700
          ${scrolled
            ? "bg-[rgba(6,10,20,0.94)] backdrop-blur-2xl"
            : "bg-gradient-to-b from-[rgba(6,10,20,0.55)] to-transparent"
          }
        `}
      >
        {/* ── Decorative top accent line (scrolled only) ── */}
        <motion.div
          animate={{ opacity: scrolled ? 1 : 0, scaleX: scrolled ? 1 : 0.4 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-x-0 top-0 h-px origin-center"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(201,162,39,0.6) 35%, rgba(212,178,69,0.9) 50%, rgba(201,162,39,0.6) 65%, transparent 100%)",
          }}
        />

        {/* ── Decorative bottom line (scrolled only) ── */}
        <motion.div
          animate={{ opacity: scrolled ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-x-0 bottom-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(201,162,39,0.18) 30%, rgba(201,162,39,0.3) 50%, rgba(201,162,39,0.18) 70%, transparent 100%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto h-full flex items-center px-6 lg:px-10">

          {/* ── Logo ── */}
          <Link href="/" className="group flex flex-col gap-0.5 w-fit flex-shrink-0">
            <span className="font-heading text-white text-xl md:text-2xl tracking-[0.38em] uppercase group-hover:text-gold transition-colors duration-400 leading-none">
              {siteConfig.brand.logoText}
            </span>
            <span className="text-[8px] font-body tracking-[0.45em] uppercase text-white/30 group-hover:text-gold/50 transition-colors duration-400 leading-none pl-0.5">
              Charter Yachts
            </span>
          </Link>

          {/* ── Desktop nav — absolutely centred in the header ── */}
          <nav className="hidden md:flex items-center gap-9 absolute left-1/2 -translate-x-1/2" aria-label="Main navigation">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group/nav relative text-[11px] font-body font-medium tracking-[0.28em] uppercase
                    transition-colors duration-300 py-2
                    ${isActive ? "text-gold" : "text-white/65 hover:text-white"}
                  `}
                >
                  {item.label}
                  {/* Gold dot indicator */}
                  <span
                    className={`
                      absolute -bottom-0.5 left-1/2 -translate-x-1/2
                      w-1 h-1 rounded-full bg-gold
                      transition-all duration-300
                      ${isActive
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-0 group-hover/nav:opacity-60 group-hover/nav:scale-100"
                      }
                    `}
                  />
                  {/* Sliding underline for active */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Desktop right actions ── */}
          <div className="hidden md:flex items-center gap-6 ml-auto flex-shrink-0">

            {/* Sign In — minimal text link */}
            <Link
              href={siteConfig.auth.loginRedirect}
              aria-label="Sign in to your account"
              className="group flex items-center gap-2 text-[11px] font-body tracking-[0.25em] uppercase text-white/50 hover:text-white/90 transition-colors duration-300"
            >
              <LogIn size={12} className="text-gold/60 group-hover:text-gold transition-colors duration-300" aria-hidden />
              Sign In
            </Link>

            {/* Thin vertical rule */}
            <span className="w-px h-4 bg-white/15" aria-hidden />

            {/* CTA — matches HeroSection primary: gold gradient + shimmer + glow lift */}
            <motion.div
              initial="rest"
              whileHover="hover"
              whileTap={{ scale: 0.97 }}
              variants={{
                rest: { y: 0, boxShadow: "0 0 0px rgba(201,162,39,0)" },
                hover: {
                  y: -2,
                  boxShadow: "0 8px 28px rgba(201,162,39,0.50), 0 3px 10px rgba(201,162,39,0.30)",
                  transition: { duration: 0.25, ease: "easeOut" },
                },
              }}
              className="relative overflow-hidden"
            >
              {/*
               * <button> instead of <Link> — clicking opens the booking modal
               * rather than navigating. All visual styles are identical.
               */}
              <button
                onClick={() => openBookingModal()}
                aria-label={siteConfig.cta.primary.ariaLabel}
                className="relative flex items-center px-7 py-2.5 text-midnight text-[11px] font-body font-bold tracking-[0.25em] uppercase overflow-hidden"
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
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="md:hidden ml-auto flex flex-col gap-1.5 p-2 group"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 45, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={22} className="text-white group-hover:text-gold transition-colors" />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -45, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={22} className="text-white group-hover:text-gold transition-colors" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </header>

      {/* ── Mobile full-screen menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.45, ease: [0.25, 0, 0, 1] }}
            className="fixed inset-0 z-50 flex flex-col md:hidden"
            style={{
              background:
                "linear-gradient(150deg, #0A0F1A 0%, #06080F 60%, #0D1120 100%)",
            }}
          >
            {/* Radial gold glow — top-left */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 70% 50% at 10% 20%, rgba(201,162,39,0.07) 0%, transparent 70%)",
              }}
            />

            {/* Top accent line */}
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(201,162,39,0.6) 50%, transparent 100%)",
              }}
            />

            {/* ── Top bar: logo + close ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="relative z-10 h-20 flex items-center justify-between px-8 border-b border-white/6 flex-shrink-0"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-heading text-white text-lg tracking-[0.38em] uppercase leading-none">
                  {siteConfig.brand.logoText}
                </span>
                <span className="text-[8px] font-body tracking-[0.4em] uppercase text-white/25 leading-none pl-0.5">
                  Charter Yachts
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-gold transition-colors duration-200 border border-white/8 hover:border-gold/40"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </motion.div>

            {/* ── Nav links — vertically centred ── */}
            <nav
              className="relative z-10 flex-1 flex flex-col justify-center px-10 gap-0"
              aria-label="Mobile navigation"
            >
              {navLinks.map((item, i) => {
                const isActive = pathname === item.href;
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.2 + i * 0.08,
                      duration: 0.5,
                      ease: [0.25, 0.1, 0, 1],
                    }}
                  >
                    <Link
                      href={item.href}
                      className={`
                        group flex items-center gap-4 py-5
                        border-b border-white/5 last:border-0
                        transition-colors duration-300
                        ${isActive ? "text-gold" : "text-white/50 hover:text-white"}
                      `}
                    >
                      {/* Animated left bar */}
                      <motion.span
                        className="h-px bg-gold flex-shrink-0"
                        initial={{ width: isActive ? 24 : 0 }}
                        animate={{ width: isActive ? 24 : 0 }}
                        whileHover={{ width: 16 }}
                        aria-hidden
                      />
                      <span className="font-heading text-3xl font-light tracking-[0.25em] uppercase leading-none">
                        {item.label}
                      </span>
                      {/* Index number */}
                      <span className="ml-auto text-[10px] font-body text-white/15 tracking-widest">
                        0{i + 1}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* ── Bottom CTAs ── */}
            <motion.div
              className="relative z-10 px-10 pb-12 flex flex-col gap-3 flex-shrink-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2 + navLinks.length * 0.08 + 0.1,
                duration: 0.5,
                ease: [0.25, 0.1, 0, 1],
              }}
            >
              {/* Gold rule */}
              <div
                className="h-px mb-2"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(201,162,39,0.3) 0%, transparent 100%)",
                }}
              />

              {/* Sign In */}
              <Link
                href={siteConfig.auth.loginRedirect}
                className="flex items-center justify-center gap-2 w-full py-4 border border-white/10 text-white/50 text-[11px] font-body tracking-[0.28em] uppercase hover:border-gold/40 hover:text-white transition-colors duration-300"
              >
                <LogIn size={13} className="text-gold/50" aria-hidden />
                Sign In to Your Account
              </Link>

              {/* Book CTA — gold gradient + shimmer; closes drawer then opens modal */}
              <motion.div
                initial="rest"
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
                variants={{
                  rest: { boxShadow: "0 0 0px rgba(201,162,39,0)" },
                  hover: {
                    boxShadow: "0 8px 32px rgba(201,162,39,0.40), 0 2px 8px rgba(201,162,39,0.25)",
                    transition: { duration: 0.25, ease: "easeOut" },
                  },
                }}
                className="relative overflow-hidden"
              >
                {/*
                 * Closes the mobile drawer first so it doesn't overlap the modal,
                 * then opens the booking modal on the next tick.
                 */}
                <button
                  onClick={() => { setMobileOpen(false); openBookingModal(); }}
                  aria-label={siteConfig.cta.primary.ariaLabel}
                  className="relative flex items-center justify-center w-full py-4 text-midnight text-[11px] font-body font-bold tracking-[0.28em] uppercase overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, #D4B245 0%, #C9A227 50%, #A8851E 100%)",
                  }}
                >
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
