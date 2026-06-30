/**
 * ============================================================
 * OCEANIQUE — BoatFormModal (Dashboard)
 * ============================================================
 * Modal dialog for adding a new vessel to the fleet or editing
 * an existing one from the admin Fleet page.
 *
 * Features:
 *  - Vessel type selector (Motor Yacht, Sailing Yacht, etc.)
 *  - Status selector (Available / Booked / Maintenance)
 *  - Specs: name, length, guest capacity, build year
 *  - Pricing: per-day (required); per-half and per-hour are
 *    auto-calculated (55% / 14% of per-day) if left blank
 *  - Photo upload with live preview (stored as data URL in
 *    component state; wire to a real CDN in production)
 *
 * Props:
 *  - open      Whether the modal is visible
 *  - initial   Existing Boat to edit, or null/undefined for new
 *  - onSave    Called with the completed Boat record
 *  - onClose   Called when the modal should close
 *
 * DATA SOURCE:
 * - Boat type definitions → src/types/boat.ts
 * - On save: bubbles up to the Fleet page state and persists
 *   status overrides to FLEET_STATUS_KEY in localStorage.
 *
 * CUSTOMIZE:
 * - Add vessel types: extend the BOAT_TYPES array.
 * - Change pricing auto-calc ratios: update buildBoat().
 * - Persist image to CDN: replace the data-URL preview logic
 *   in the upload handler with a real upload API call.
 * ============================================================
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, ImageIcon } from "lucide-react";
import Image from "next/image";
import type { Boat, BoatType, BoatStatus } from "@/types/boat";

const BOAT_TYPES: BoatType[] = [
  "Motor Yacht",
  "Sailing Yacht",
  "Super Yacht",
  "Catamaran",
  "Speedboat",
  "Classic Yacht",
  "Gulet",
];

const STATUSES: { value: BoatStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "booked", label: "Booked" },
  { value: "maintenance", label: "Maintenance" },
];

interface FormData {
  name: string;
  type: BoatType;
  length: string;
  guests: string;
  year: string;
  pricePerHour: string;
  pricePerHalf: string;
  pricePerDay: string;
  status: BoatStatus;
  imagePreview: string;
}

function buildBoat(form: FormData, existing?: Boat): Boat {
  const id = existing?.id ?? `boat-${Date.now()}`;
  const day  = parseFloat(form.pricePerDay)  || 0;
  const half = parseFloat(form.pricePerHalf) || Math.round(day * 0.55);
  const hour = parseFloat(form.pricePerHour) || Math.round(day * 0.14);
  return {
    id,
    name: form.name,
    type: form.type,
    manufacturer: existing?.manufacturer ?? "",
    model: existing?.model ?? "",
    year: parseInt(form.year) || new Date().getFullYear(),
    length: form.length ? `${form.length} ft` : existing?.length ?? "",
    beam: existing?.beam ?? "",
    capacity: {
      guests: parseInt(form.guests) || 0,
      overnight: existing?.capacity.overnight ?? 0,
      crew: existing?.capacity.crew ?? 0,
    },
    pricing: {
      perHour: hour,
      perHalf: half,
      perDay: day,
      currency: existing?.pricing.currency ?? "USD",
      depositPercent: existing?.pricing.depositPercent ?? 30,
    },
    status: form.status,
    featured: existing?.featured ?? false,
    images: {
      primary: form.imagePreview || existing?.images.primary || "",
      gallery: existing?.images.gallery ?? [],
    },
    description: existing?.description ?? "",
    shortDescription: `${form.length ? form.length + " ft" : ""} · ${form.guests} guests · ${form.year}`.trim(),
    features: existing?.features ?? [],
    specifications: existing?.specifications ?? {
      engines: "",
      maxSpeed: "",
      cruisingSpeed: "",
      fuelCapacity: "",
      waterCapacity: "",
      homePort: "",
    },
  };
}

export interface BoatFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (boat: Boat) => void;
  boat?: Boat;
}

export function BoatFormModal({ isOpen, onClose, onSave, boat }: BoatFormModalProps) {
  const isEdit = !!boat;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    name: "",
    type: "Motor Yacht",
    length: "",
    guests: "",
    year: new Date().getFullYear().toString(),
    pricePerHour: "",
    pricePerHalf: "",
    pricePerDay: "",
    status: "available",
    imagePreview: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  /* Populate form when editing */
  useEffect(() => {
    if (boat) {
      setForm({
        name: boat.name,
        type: boat.type,
        length: boat.length.replace(/\s*ft\s*/i, ""),
        guests: String(boat.capacity.guests),
        year: String(boat.year),
        pricePerHour: String(boat.pricing.perHour),
        pricePerHalf: String(boat.pricing.perHalf),
        pricePerDay: String(boat.pricing.perDay),
        status: boat.status,
        imagePreview: boat.images.primary,
      });
    } else {
      setForm({
        name: "",
        type: "Motor Yacht",
        length: "",
        guests: "",
        year: new Date().getFullYear().toString(),
        pricePerHour: "",
        pricePerHalf: "",
        pricePerDay: "",
        status: "available",
        imagePreview: "",
      });
    }
    setErrors({});
  }, [boat, isOpen]);

  /* Close on Escape */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const set = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
  }, []);

  function handleImageFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    set("imagePreview", url);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.guests || isNaN(+form.guests)) errs.guests = "Required";
    if (!form.year || isNaN(+form.year)) errs.year = "Required";
    if (!form.pricePerDay || isNaN(+form.pricePerDay)) errs.pricePerDay = "Required";
    if (form.pricePerHour && isNaN(+form.pricePerHour)) errs.pricePerHour = "Must be a number";
    if (form.pricePerHalf && isNaN(+form.pricePerHalf)) errs.pricePerHalf = "Must be a number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave(buildBoat(form, boat));
    onClose();
  }

  const inputCls =
    "w-full bg-background border border-border text-foreground text-xs font-body px-3 py-2.5 placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/60 transition-colors";
  const labelCls = "block text-muted-foreground text-[10px] font-body tracking-[0.15em] uppercase mb-1.5";
  const errorCls = "text-red-400 text-[10px] font-body mt-1";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-2xl bg-card border border-border rounded-sm shadow-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <div>
                  <p className="text-gold text-[10px] font-body tracking-[0.25em] uppercase mb-0.5">
                    {isEdit ? "Edit Vessel" : "New Vessel"}
                  </p>
                  <h2 className="font-heading text-xl text-foreground">
                    {isEdit ? boat.name : "Add to Fleet"}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* ── Image upload ── */}
                <div>
                  <label className={labelCls}>Vessel Image</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="relative w-full aspect-[16/7] border border-dashed border-border hover:border-gold/50 transition-colors cursor-pointer overflow-hidden bg-muted/30 flex flex-col items-center justify-center gap-2"
                  >
                    {form.imagePreview ? (
                      <Image
                        src={form.imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized={form.imagePreview.startsWith("blob:")}
                      />
                    ) : (
                      <>
                        <ImageIcon size={28} className="text-muted-foreground/40" />
                        <p className="text-muted-foreground/50 text-xs font-body">
                          Click or drag to upload an image
                        </p>
                      </>
                    )}
                    {form.imagePreview && (
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                        <Upload size={20} className="text-white" />
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageFile(file);
                    }}
                  />
                </div>

                {/* ── Name + Type ── */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Vessel Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="e.g. Azure Horizon"
                      className={inputCls}
                    />
                    {errors.name && <p className={errorCls}>{errors.name}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Vessel Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => set("type", e.target.value as BoatType)}
                      className={inputCls}
                    >
                      {BOAT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ── Specs ── */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Length (ft)</label>
                    <input
                      type="number"
                      value={form.length}
                      onChange={(e) => set("length", e.target.value)}
                      placeholder="e.g. 85"
                      min={0}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Max Guests</label>
                    <input
                      type="number"
                      value={form.guests}
                      onChange={(e) => set("guests", e.target.value)}
                      placeholder="e.g. 12"
                      min={1}
                      className={inputCls}
                    />
                    {errors.guests && <p className={errorCls}>{errors.guests}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Year Built</label>
                    <input
                      type="number"
                      value={form.year}
                      onChange={(e) => set("year", e.target.value)}
                      placeholder="e.g. 2022"
                      min={1900}
                      max={new Date().getFullYear() + 2}
                      className={inputCls}
                    />
                    {errors.year && <p className={errorCls}>{errors.year}</p>}
                  </div>
                </div>

                {/* ── Pricing ── */}
                <div>
                  <p className={labelCls}>Pricing (USD)</p>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { key: "pricePerHour" as const, label: "Per Hour",     hint: "e.g. 1200" },
                      { key: "pricePerHalf" as const, label: "Half-Day",     hint: "e.g. 4800" },
                      { key: "pricePerDay"  as const, label: "Full Day ✱",   hint: "e.g. 8500" },
                    ] as const).map(({ key, label, hint }) => (
                      <div key={key}>
                        <label className={labelCls}>{label}</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-body">$</span>
                          <input type="number" value={form[key]}
                            onChange={(e) => set(key, e.target.value)}
                            placeholder={hint} min={0}
                            className={`${inputCls} pl-6`}
                          />
                        </div>
                        {errors[key] && <p className={errorCls}>{errors[key]}</p>}
                      </div>
                    ))}
                  </div>
                  <p className="text-muted-foreground/40 text-[10px] font-body mt-1.5">
                    ✱ Required. Hour & half-day auto-estimated from full day if left blank.
                  </p>
                </div>

                {/* ── Status ── */}
                <div>
                  <label className={labelCls}>Status</label>
                  <select value={form.status}
                    onChange={(e) => set("status", e.target.value as BoatStatus)}
                    className={inputCls}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-border">
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground text-xs font-body tracking-[0.15em] uppercase px-5 py-2.5 border border-border hover:border-border/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="relative overflow-hidden bg-gold text-midnight text-xs font-body font-semibold tracking-[0.2em] uppercase px-6 py-2.5 hover:bg-gold-light transition-colors"
                >
                  {isEdit ? "Save Changes" : "Add Vessel"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
