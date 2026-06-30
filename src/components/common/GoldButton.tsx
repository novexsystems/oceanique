/**
 * ============================================================
 * OCEANIQUE — GoldButton
 * ============================================================
 * The primary branded button component. Comes in two variants:
 *  - "solid"   Gold background, dark text (primary CTA)
 *  - "outline" Transparent with gold border and text (secondary)
 *
 * Can render as a <button> element or a Next.js <Link>.
 * Animated with Framer Motion on hover/tap.
 *
 * Props:
 *  - variant   "solid" (default) | "outline"
 *  - href      If provided, renders as a Next.js Link
 *  - children  Button label text
 *  - className Additional Tailwind classes
 *  - ...rest   Any other <button> / <a> HTML attributes
 *
 * Usage:
 *   <GoldButton href="/contact">Book Now</GoldButton>
 *   <GoldButton variant="outline" onClick={handleClick}>Learn More</GoldButton>
 * ============================================================
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface GoldButtonProps {
  variant?: "solid" | "outline";
  href?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  ariaLabel?: string;
}

export function GoldButton({
  variant = "solid",
  href,
  children,
  className = "",
  onClick,
  type = "button",
  disabled = false,
  ariaLabel,
}: GoldButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center
    px-8 py-3.5
    text-xs font-body font-semibold tracking-[0.2em] uppercase
    transition-colors duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variant === "solid"
      ? "bg-gold text-midnight hover:bg-gold-light"
      : "border border-gold text-gold hover:bg-gold hover:text-midnight"
    }
    ${className}
  `;

  const motionProps = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.15 },
  };

  if (href) {
    return (
      <motion.div {...motionProps} className="inline-block">
        <Link href={href} className={baseClasses} aria-label={ariaLabel}>
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      {...motionProps}
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={baseClasses}
    >
      {children}
    </motion.button>
  );
}
