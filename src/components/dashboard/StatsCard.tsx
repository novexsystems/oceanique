/**
 * ============================================================
 * OCEANIQUE — StatsCard (Dashboard)
 * ============================================================
 * A KPI metric card displayed in the dashboard overview grid.
 * Shows a label, value, optional change indicator (up/down),
 * and an icon.
 *
 * Props:
 *  - label      Metric name (e.g. "Total Revenue")
 *  - value      Display value (e.g. "$284,500" or "78%")
 *  - change     Optional change % string (e.g. "+12%")
 *  - trend      "up" | "down" | "neutral" — colors the change
 *  - icon       Lucide icon name string (rendered when built out)
 *  - description Optional tooltip/sub-label text
 *
 * Usage:
 *   <StatsCard label="Active Bookings" value="12" change="+5" trend="up" icon="BookOpen" />
 * ============================================================
 *
 * TODO: Build out this component — see design spec.
 * Planned features:
 *  - Framer Motion count-up animation on mount
 *  - Dynamic Lucide icon
 *  - Sparkline mini-chart (optional)
 */

interface StatsCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: string;
  description?: string;
}

export function StatsCard({
  label,
  value,
  change,
  trend = "neutral",
  description,
}: StatsCardProps) {
  const trendColor =
    trend === "up"
      ? "text-emerald-400"
      : trend === "down"
        ? "text-red-400"
        : "text-silver-dark";

  return (
    <div className="bg-card border border-border rounded-sm p-6">
      {/* Label */}
      <p className="text-muted-foreground text-xs tracking-[0.15em] uppercase font-body mb-4">
        {label}
      </p>

      {/* Value */}
      <p className="font-heading text-3xl text-foreground font-light mb-2">
        {value}
      </p>

      {/* Change indicator */}
      {change && (
        <p className={`text-xs font-body font-medium ${trendColor}`}>
          {change}{" "}
          <span className="text-muted-foreground font-normal">vs last month</span>
        </p>
      )}

      {/* Description */}
      {description && (
        <p className="text-muted-foreground text-xs font-body mt-2">
          {description}
        </p>
      )}
    </div>
  );
}
