/**
 * ============================================================
 * OCEANIQUE — SectionHeading
 * ============================================================
 * Reusable heading block used at the top of every website
 * section. Renders an eyebrow label, a large serif title,
 * a thin gold divider, and an optional description paragraph.
 *
 * Props:
 *  - eyebrow     Small uppercase label above the title
 *  - title       Main section title (uses heading font)
 *  - description Optional paragraph below the divider
 *  - align       Text alignment: "center" (default) | "left"
 *  - light       If true, uses white text (for dark backgrounds)
 *
 * Usage:
 *   <SectionHeading
 *     eyebrow="Our Fleet"
 *     title="Vessels of Distinction"
 *     description="Each yacht is meticulously selected..."
 *   />
 * ============================================================
 */

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  light?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  light = false,
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div className={isCenter ? "text-center" : "text-left"}>
      {/* Eyebrow label */}
      <p
        className={`text-gold tracking-[0.4em] uppercase text-xs font-body font-medium mb-4 ${
          light ? "text-gold" : "text-gold"
        }`}
      >
        {eyebrow}
      </p>

      {/* Main title */}
      <h2
        className={`font-heading text-4xl md:text-5xl font-light leading-tight mb-6 ${
          light ? "text-white" : "text-midnight"
        }`}
      >
        {title}
      </h2>

      {/* Gold divider */}
      <div
        className={`h-px w-14 bg-gold mb-6 ${isCenter ? "mx-auto" : "ml-0"}`}
      />

      {/* Optional description */}
      {description && (
        <p
          className={`font-body text-base leading-relaxed max-w-2xl ${
            isCenter ? "mx-auto" : ""
          } ${light ? "text-silver/70" : "text-silver-dark"}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
