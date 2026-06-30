/**
 * ============================================================
 * OCEANIQUE — THEME CONFIGURATION
 * ============================================================
 * Controls all visual design tokens: colors, typography, spacing,
 * and animation settings. These values are referenced in
 * globals.css (CSS variables) and throughout components.
 *
 * HOW TO CUSTOMIZE:
 *  1. Change the hex values under `colors` to your brand palette.
 *  2. Update `fonts.heading` / `fonts.body` to your preferred
 *     Google Fonts or local font names.
 *  3. After changing colors here, also update the corresponding
 *     CSS custom properties in `src/app/globals.css` to keep
 *     both sources in sync.
 * ============================================================
 */

export const themeConfig = {
  // ----------------------------------------------------------
  // BRAND COLOR PALETTE
  // Primary design colors for Oceanique.
  // All Tailwind utility classes use these via CSS variables.
  // e.g. `bg-midnight`, `text-gold`, `border-silver`
  // ----------------------------------------------------------
  colors: {
    /** Deep navy-black used for backgrounds and primary surfaces */
    midnightBlack: "#0A0F1A",

    /** Light neutral gray for secondary text and subtle borders */
    silverGray: "#E5E7EB",

    /** Pure white for text on dark backgrounds and card surfaces */
    pureWhite: "#FFFFFF",

    /** Signature gold used for accents, CTAs, and highlights */
    richGold: "#C9A227",

    // Derived / extended palette (do not change unless intentional)
    goldLight: "#D4B245", // Lighter tint of richGold for hover states
    goldDark: "#A8851E", // Darker shade of richGold for active states
    goldMuted: "rgba(201, 162, 39, 0.15)", // Gold with opacity for subtle highlights

    midnightLight: "#111827", // Slightly lighter than midnightBlack for card backgrounds
    midnightMid: "#0D1526", // Mid-tone for layered dark surfaces

    /** Semi-transparent dark overlay for hero/modal backgrounds */
    darkOverlay: "rgba(10, 15, 26, 0.80)",
    darkOverlayHeavy: "rgba(10, 15, 26, 0.95)",
  },

  // ----------------------------------------------------------
  // TYPOGRAPHY
  // Heading and body font families. These must match the font
  // names loaded in `src/app/layout.tsx` via next/font/google.
  // ----------------------------------------------------------
  fonts: {
    /** Serif font for headings — elegant, luxury feel */
    heading: "Cormorant Garamond",

    /** Sans-serif font for body text — clean and readable */
    body: "Montserrat",

    /** Monospace font for code snippets (rarely used) */
    mono: "Geist Mono",
  },

  // ----------------------------------------------------------
  // FONT SIZE SCALE (in rem)
  // Reference values used for consistent text sizing.
  // Tailwind's default scale is used; these are documentation only.
  // ----------------------------------------------------------
  fontSizes: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
    "6xl": "3.75rem", // 60px
    "7xl": "4.5rem", // 72px
    "8xl": "6rem", // 96px
    "9xl": "8rem", // 128px
  },

  // ----------------------------------------------------------
  // BORDER RADIUS
  // Controls the roundness of UI elements.
  // Lower values = sharper, more architectural luxury feel.
  // Higher values = softer, more approachable.
  // ----------------------------------------------------------
  borderRadius: {
    none: "0px",
    sm: "2px",
    md: "4px",
    lg: "8px",
    xl: "12px",
    full: "9999px",
  },

  // ----------------------------------------------------------
  // SPACING / LAYOUT
  // Standard spacing values used across sections and containers.
  // ----------------------------------------------------------
  spacing: {
    /** Maximum content width on large screens */
    maxWidth: "1280px",
    /** Standard horizontal padding for containers */
    containerPadding: "1.5rem",
    /** Vertical padding for page sections */
    sectionPaddingY: "6rem",
  },

  // ----------------------------------------------------------
  // ANIMATION / MOTION
  // Framer Motion settings used across animated components.
  // Reduce `duration` values for faster, snappier interactions.
  // ----------------------------------------------------------
  animation: {
    /** Default transition duration (seconds) */
    duration: {
      fast: 0.2,
      normal: 0.4,
      slow: 0.8,
    },
    /** Default easing curves */
    ease: {
      smooth: [0.25, 0.46, 0.45, 0.94] as number[],
      luxury: [0.16, 1, 0.3, 1] as number[],
      snap: [0.68, -0.55, 0.27, 1.55] as number[],
    },
    /** Stagger delay between animated list items (seconds) */
    stagger: 0.1,
  },

  // ----------------------------------------------------------
  // SHADOWS
  // Custom box-shadow values for depth and elegance.
  // ----------------------------------------------------------
  shadows: {
    gold: "0 4px 24px rgba(201, 162, 39, 0.25)",
    goldGlow: "0 0 40px rgba(201, 162, 39, 0.4)",
    dark: "0 8px 40px rgba(0, 0, 0, 0.4)",
    card: "0 2px 20px rgba(0, 0, 0, 0.15)",
  },
} as const;

/** Convenience type export */
export type ThemeConfig = typeof themeConfig;
