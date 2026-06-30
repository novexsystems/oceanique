/**
 * ============================================================
 * OCEANIQUE — Dashboard Calendar Page  (Route: /dashboard/calendar)
 * ============================================================
 * Visual fleet availability calendar. Shows all bookings
 * colour-coded by vessel across a month/week/day view.
 *
 * DATA SOURCE:
 * - src/config/dashboard.config.ts (recentBookings → CalendarEvents)
 *
 * TODO: Integrate a full calendar library.
 * Recommended: @fullcalendar/react with @fullcalendar/daygrid
 * Install: npm install @fullcalendar/react @fullcalendar/daygrid
 * ============================================================
 */

import { AvailabilityCalendar } from "@/components/dashboard/AvailabilityCalendar";

export default function DashboardCalendarPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl text-foreground mb-1">Calendar</h1>
        <p className="text-muted-foreground text-sm font-body">
          Fleet availability and booking schedule at a glance.
        </p>
      </div>

      <AvailabilityCalendar />
    </div>
  );
}
