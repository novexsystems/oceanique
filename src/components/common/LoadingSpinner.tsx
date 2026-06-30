/**
 * ============================================================
 * OCEANIQUE — LoadingSpinner
 * ============================================================
 * A branded loading spinner using the Rich Gold color.
 * Used on dashboard pages and any async content areas.
 *
 * Props:
 *  - size   "sm" | "md" (default) | "lg"
 *  - label  Accessible screen-reader label (default: "Loading")
 *
 * Usage:
 *   <LoadingSpinner />
 *   <LoadingSpinner size="sm" label="Fetching boats..." />
 * ============================================================
 */

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeMap = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-[3px]",
};

export function LoadingSpinner({
  size = "md",
  label = "Loading",
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex items-center justify-center"
    >
      <div
        className={`
          ${sizeMap[size]}
          rounded-full
          border-gold/20
          border-t-gold
          animate-spin
        `}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
