/**
 * ============================================================
 * OCEANIQUE — WebsiteBookingContext
 * ============================================================
 * Global open/close state for the website charter booking modal.
 * Mounted at the app root via ClientProviders so any component
 * on the public website (hero section, fleet cards, navigation)
 * can trigger the booking flow with a single hook call.
 *
 * The <WebsiteBookingModal> is rendered directly inside this
 * provider so AnimatePresence works at the highest possible
 * z-level without prop-drilling.
 *
 * USAGE:
 *   const { open } = useWebsiteBooking();
 *   <button onClick={() => open()}>Book Your Charter</button>  // generic
 *   <button onClick={() => open(boat.id)}>Book Azure Horizon</button>  // pre-selected
 *
 * HOW IT FITS:
 * - ClientProviders (app root) → WebsiteBookingProvider
 * - Any website component      → useWebsiteBooking().open()
 * - Admin writes                → BOOKINGS_STORAGE_KEY (localStorage)
 * ============================================================
 */

"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { WebsiteBookingModal } from "@/components/website/WebsiteBookingModal";
import type { CharterType } from "@/types/booking";

// ── Context shape ──────────────────────────────────────────────

interface WebsiteBookingContextValue {
  /** True while the booking modal is visible. */
  isOpen: boolean;
  /**
   * Opens the booking modal and resets the form to step 1.
   * - vesselId      pre-selects a specific vessel in step 2.
   * - charterType   pre-sets the charter type (e.g. "hourly" when the
   *                 user clicked "Book" while viewing the per-hour rate).
   * Both are optional; the user can change either selection in the modal.
   */
  open: (vesselId?: string, charterType?: CharterType) => void;
  /** Closes the booking modal. */
  close: () => void;
}

const WebsiteBookingContext = createContext<WebsiteBookingContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────

/**
 * Mounts the booking modal in the tree and provides open/close
 * controls to all descendant components.
 *
 * Place this as high as possible in the component tree (currently
 * inside ClientProviders) so it is available on every page.
 */
export function WebsiteBookingProvider({ children }: { children: ReactNode }) {
  const [isOpen,             setIsOpen]             = useState(false);
  /** Vessel ID to pre-select when the modal opens; undefined = no pre-selection. */
  const [initialVesselId,   setInitialVesselId]   = useState<string | undefined>();
  /** Charter type to pre-set when the modal opens; undefined = use form default. */
  const [initialCharterType, setInitialCharterType] = useState<CharterType | undefined>();

  const open = (vesselId?: string, charterType?: CharterType) => {
    setInitialVesselId(vesselId);
    setInitialCharterType(charterType);
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  return (
    <WebsiteBookingContext.Provider value={{ isOpen, open, close }}>
      {children}
      {/*
       * The modal is rendered here (sibling to page content) so it
       * always sits above everything at z-[60], even dashboard panels.
       */}
      <WebsiteBookingModal
        isOpen={isOpen}
        onClose={close}
        initialVesselId={initialVesselId}
        initialCharterType={initialCharterType}
      />
    </WebsiteBookingContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────

/**
 * Returns the booking modal controls for the current context.
 * Throws if called outside <WebsiteBookingProvider>.
 */
export function useWebsiteBooking(): WebsiteBookingContextValue {
  const ctx = useContext(WebsiteBookingContext);
  if (!ctx) throw new Error("useWebsiteBooking must be used within <WebsiteBookingProvider>");
  return ctx;
}
