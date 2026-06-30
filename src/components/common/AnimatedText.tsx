/**
 * ============================================================
 * OCEANIQUE — AnimatedText
 * ============================================================
 * Wraps text in a Framer Motion element that animates in when
 * the element enters the viewport. Supports three animation
 * styles suited to a luxury brand aesthetic.
 *
 * Props:
 *  - children   The text or JSX content to animate
 *  - animation  "fadeUp" (default) | "fadeIn" | "slideLeft"
 *  - delay      Animation delay in seconds (default: 0)
 *  - className  Additional Tailwind classes on the wrapper
 *  - as         HTML element to render ("div", "p", "h1" etc.)
 *
 * Usage:
 *   <AnimatedText animation="fadeUp" delay={0.2}>
 *     Where Luxury Meets the Horizon
 *   </AnimatedText>
 * ============================================================
 */

"use client";

import { motion, type Variants } from "framer-motion";
import { themeConfig } from "@/config/theme.config";

type AnimationType = "fadeUp" | "fadeIn" | "slideLeft";

interface AnimatedTextProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

/** Framer Motion variant definitions for each animation type */
const variants: Record<AnimationType, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
};

export function AnimatedText({
  children,
  animation = "fadeUp",
  delay = 0,
  className = "",
  as: Tag = "div",
}: AnimatedTextProps) {
  const MotionTag = motion[Tag as keyof typeof motion] as typeof motion.div;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants[animation]}
      transition={{
        duration: themeConfig.animation.duration.slow,
        ease: themeConfig.animation.ease.luxury as [number, number, number, number],
        delay,
      }}
    >
      {children}
    </MotionTag>
  );
}
