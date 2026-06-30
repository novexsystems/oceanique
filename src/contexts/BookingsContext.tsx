"use client";

/**
 * ============================================================
 * OCEANIQUE — BookingsContext
 * ============================================================
 * Single source of truth for the bookings list across all
 * dashboard pages. Mounted once in the dashboard layout so
 * every page (Bookings, Calendar, Overview) shares the same
 * state — changes are instant, no navigation required.
 *
 * Persistence: reads from and writes to localStorage so
 * data survives page refresh.  Cross-tab sync via the
 * native `storage` event.
 * ============================================================
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { dashboardConfig } from "@/config/dashboard.config";
import type { Booking } from "@/types/booking";

export const BOOKINGS_STORAGE_KEY = "oceanique_bookings_v2";

interface BookingsContextValue {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
}

const BookingsContext = createContext<BookingsContextValue | null>(null);

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (typeof window === "undefined") return dashboardConfig.recentBookings;
    try {
      const saved = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved) as Booking[];
    } catch {}
    return dashboardConfig.recentBookings;
  });

  const isFirstRender = useRef(true);

  /* Persist on every change, skip the very first render */
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    try {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    } catch {}
  }, [bookings]);

  /* Sync when another tab writes to the same key */
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === BOOKINGS_STORAGE_KEY && e.newValue) {
        try { setBookings(JSON.parse(e.newValue) as Booking[]); } catch {}
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return (
    <BookingsContext.Provider value={{ bookings, setBookings }}>
      {children}
    </BookingsContext.Provider>
  );
}

/** Use anywhere inside the dashboard layout */
export function useBookings(): BookingsContextValue {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error("useBookings must be used within <BookingsProvider>");
  return ctx;
}
