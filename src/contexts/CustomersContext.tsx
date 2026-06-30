"use client";

/**
 * ============================================================
 * OCEANIQUE — CustomersContext
 * ============================================================
 * Single source of truth for the customer list across all
 * dashboard pages. Persists to localStorage.
 *
 * Key feature: addOrUpdateFromBooking() — when a new booking
 * is created with customer contact info, this automatically
 * creates a new customer record or enriches an existing one.
 * ============================================================
 */

import {
  createContext, useContext, useState, useEffect, useRef, useCallback,
  type ReactNode,
} from "react";
import { dashboardConfig } from "@/config/dashboard.config";
import type { Customer } from "@/types/customer";
import type { Booking } from "@/types/booking";

export const CUSTOMERS_STORAGE_KEY = "oceanique_customers_v2";

/** Returns the next sequential customer number based on the current list */
function getNextNumber(customers: Customer[]): number {
  return customers.reduce((max, c) => Math.max(max, c.customerNumber ?? 0), 0) + 1;
}

export interface BookingCustomerInfo {
  email?:   string;
  phone?:   string;
  country?: string;
  city?:    string;
}

interface CustomersContextValue {
  customers:              Customer[];
  setCustomers:           React.Dispatch<React.SetStateAction<Customer[]>>;
  addOrUpdateFromBooking: (name: string, info: BookingCustomerInfo) => void;
  /** Creates minimal customer records for any booking whose customer name
   *  is not yet present in the list. Safe to call repeatedly — idempotent. */
  syncFromBookings:       (bookings: Booking[]) => void;
}

const CustomersContext = createContext<CustomersContextValue | null>(null);

export function CustomersProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    if (typeof window === "undefined") return dashboardConfig.customers as Customer[];
    try {
      const saved = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved) as Customer[];
    } catch {}
    return dashboardConfig.customers as Customer[];
  });

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    try { localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers)); } catch {}
  }, [customers]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === CUSTOMERS_STORAGE_KEY && e.newValue) {
        try { setCustomers(JSON.parse(e.newValue) as Customer[]); } catch {}
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  /**
   * Called when a booking is saved. Checks if a customer with this
   * name already exists — if so, enriches any missing fields.
   * If not, creates a new customer record from the booking info.
   */
  const addOrUpdateFromBooking = useCallback((name: string, info: BookingCustomerInfo) => {
    setCustomers(prev => {
      const existing = prev.find(
        c => `${c.firstName} ${c.lastName}`.toLowerCase() === name.toLowerCase()
      );

      if (existing) {
        /* Patch only fields that are currently empty */
        const patch: Partial<Customer> = {};
        if (!existing.email   && info.email)   patch.email   = info.email;
        if (!existing.phone   && info.phone)   patch.phone   = info.phone;
        if (!existing.country && info.country) patch.country = info.country;
        if (!existing.city    && info.city)    patch.city    = info.city;
        if (Object.keys(patch).length === 0) return prev;
        return prev.map(c => c.id === existing.id ? { ...c, ...patch } : c);
      }

      /* Create a new customer record */
      const parts     = name.trim().split(" ");
      const firstName = parts[0] ?? name;
      const lastName  = parts.slice(1).join(" ");
      const now       = new Date().toISOString().slice(0, 10);
      const newId     = `cust-${Date.now().toString().slice(-8)}`;

      const newCustomer: Customer = {
        id:             newId,
        customerNumber: getNextNumber(prev),
        firstName,
        lastName,
        email:         info.email   ?? "",
        phone:         info.phone   ?? "",
        country:       info.country ?? "",
        city:          info.city,
        totalBookings: 1,
        totalSpent:    0,
        vip:           false,
        joinedDate:    now,
      };
      return [...prev, newCustomer];
    });
  }, []);

  /**
   * Batch-create customer records for booking customers not yet in the list.
   * Uses a single setCustomers call to avoid chained re-renders.
   */
  const syncFromBookings = useCallback((bookings: Booking[]) => {
    setCustomers(prev => {
      const known = new Set(
        prev.map(c => `${c.firstName} ${c.lastName}`.toLowerCase())
      );
      const toAdd: Customer[] = [];
      let nextNum = getNextNumber(prev);
      for (const b of bookings) {
        const key = b.customerName.trim().toLowerCase();
        if (!key || known.has(key)) continue;
        known.add(key); /* prevent duplicates within the same batch */
        const parts     = b.customerName.trim().split(" ");
        const firstName = parts[0] ?? b.customerName;
        const lastName  = parts.slice(1).join(" ");
        toAdd.push({
          id:             `cust-bk-${b.id}`,
          customerNumber: nextNum++,
          firstName,
          lastName,
          email:         "",
          phone:         "",
          country:       "",
          totalBookings: 0,
          totalSpent:    0,
          vip:           false,
          joinedDate:    b.startDate,
        });
      }
      return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
    });
  }, []);

  return (
    <CustomersContext.Provider value={{ customers, setCustomers, addOrUpdateFromBooking, syncFromBookings }}>
      {children}
    </CustomersContext.Provider>
  );
}

export function useCustomers(): CustomersContextValue {
  const ctx = useContext(CustomersContext);
  if (!ctx) throw new Error("useCustomers must be used within <CustomersProvider>");
  return ctx;
}
