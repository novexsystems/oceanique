/**
 * ============================================================
 * OCEANIQUE — GoldDivider
 * ============================================================
 * A thin decorative horizontal rule in Rich Gold.
 * Used to separate content blocks with a luxury accent.
 *
 * Props:
 *  - width   Tailwind width class (default: "w-14")
 *  - align   "left" | "center" | "right" (default: "left")
 *  - className  Additional Tailwind classes
 *
 * Usage:
 *   <GoldDivider />
 *   <GoldDivider width="w-full" align="center" />
 * ============================================================
 */

interface GoldDividerProps {
  width?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export function GoldDivider({
  width = "w-14",
  align = "left",
  className = "",
}: GoldDividerProps) {
  const alignClass =
    align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : "";

  return (
    <div
      className={`h-px bg-gold ${width} ${alignClass} ${className}`}
      aria-hidden="true"
    />
  );
}
