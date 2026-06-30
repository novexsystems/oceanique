"use client";

/**
 * ============================================================
 * OCEANIQUE — CustomerFormModal
 * ============================================================
 * Modal form for adding a new customer or editing an existing
 * one. Supports validation and auto-generates a customer ID.
 * ============================================================
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Customer } from "@/types/customer";

interface CustomerFormModalProps {
  open:               boolean;
  initial?:           Customer | null;
  nextCustomerNumber: number;
  onSave:             (customer: Customer) => void;
  onClose:            () => void;
}

const EMPTY: Omit<Customer, "id"> = {
  firstName: "", lastName: "", email: "", phone: "",
  country: "", city: "", address: "",
  totalBookings: 0, totalSpent: 0,
  preferredBoat: undefined,
  vip: false,
  joinedDate: new Date().toISOString().slice(0, 10),
  lastBooking: undefined,
  notes: "",
};

function genId() {
  return "cust-" + Math.random().toString(36).slice(2, 7).toUpperCase();
}

const FIELD = "w-full bg-background border border-border px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-gold transition-colors";
const LABEL = "block text-[10px] font-body tracking-[0.15em] uppercase text-muted-foreground mb-1";

export function CustomerFormModal({ open, initial, nextCustomerNumber, onSave, onClose }: CustomerFormModalProps) {
  const isEdit = !!initial;

  const [form, setForm] = useState<Omit<Customer, "id">>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : { ...EMPTY, joinedDate: new Date().toISOString().slice(0, 10) });
      setErrors({});
    }
  }, [open, initial]);

  function set(field: keyof typeof form, value: string | boolean | number) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => { const n = { ...e }; delete n[field as string]; return n; });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim())  e.lastName  = "Required";
    if (!form.email.trim())     e.email     = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.country.trim())   e.country   = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSave({
      id: initial?.id ?? genId(),
      customerNumber: initial?.customerNumber ?? nextCustomerNumber,
      ...form,
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="cform-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            key="cform-modal"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-lg bg-card border border-border shadow-2xl pointer-events-auto max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
                <div>
                  <p className="text-gold text-[10px] font-body tracking-[0.2em] uppercase mb-0.5">
                    {isEdit ? "Edit" : "New"}
                  </p>
                  <h2 className="font-heading text-lg text-foreground">
                    {isEdit ? `${initial!.firstName} ${initial!.lastName}` : "Add Client"}
                  </h2>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable form body */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

                {/* Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>First Name *</label>
                    <input className={FIELD} value={form.firstName} onChange={e => set("firstName", e.target.value)} placeholder="Alexandre" />
                    {errors.firstName && <p className="text-red-400 text-[11px] mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className={LABEL}>Last Name *</label>
                    <input className={FIELD} value={form.lastName} onChange={e => set("lastName", e.target.value)} placeholder="Dupont" />
                    {errors.lastName && <p className="text-red-400 text-[11px] mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <label className={LABEL}>Email *</label>
                  <input className={FIELD} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="a.dupont@example.com" />
                  {errors.email && <p className="text-red-400 text-[11px] mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className={LABEL}>Phone</label>
                  <input className={FIELD} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+33 6 12 34 56 78" />
                </div>

                {/* Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Country *</label>
                    <input className={FIELD} value={form.country} onChange={e => set("country", e.target.value)} placeholder="France" />
                    {errors.country && <p className="text-red-400 text-[11px] mt-1">{errors.country}</p>}
                  </div>
                  <div>
                    <label className={LABEL}>City</label>
                    <input className={FIELD} value={form.city ?? ""} onChange={e => set("city", e.target.value)} placeholder="Paris" />
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Address</label>
                  <input className={FIELD} value={form.address ?? ""} onChange={e => set("address", e.target.value)} placeholder="14 Rue de la Paix, 75002 Paris" />
                </div>

                {/* Membership */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Joined Date</label>
                    <input className={FIELD} type="date" value={form.joinedDate} onChange={e => set("joinedDate", e.target.value)} />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <div
                        onClick={() => set("vip", !form.vip)}
                        className={`w-9 h-5 rounded-full transition-colors relative ${form.vip ? "bg-gold" : "bg-border"}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.vip ? "left-4" : "left-0.5"}`} />
                      </div>
                      <span className={`text-sm font-body ${form.vip ? "text-gold" : "text-muted-foreground"}`}>VIP Member</span>
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className={LABEL}>Internal Notes</label>
                  <textarea
                    className={`${FIELD} resize-none`}
                    rows={3}
                    value={form.notes ?? ""}
                    onChange={e => set("notes", e.target.value)}
                    placeholder="Preferences, special requests…"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border flex gap-3 flex-shrink-0">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-gold text-midnight text-xs font-body font-semibold tracking-[0.15em] uppercase py-2.5 hover:bg-gold-light transition-colors"
                >
                  {isEdit ? "Save Changes" : "Add Client"}
                </button>
                <button
                  onClick={onClose}
                  className="px-5 text-xs font-body text-muted-foreground border border-border hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
