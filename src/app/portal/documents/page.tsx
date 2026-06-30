/**
 * ============================================================
 * OCEANIQUE — Documents  (Route: /portal/documents)
 * ============================================================
 * Lists all customer documents: contracts, invoices, and forms.
 * Features:
 *  - Summary stats bar (total / per-type / pending count)
 *  - Type filter tabs + live search by document name or boat
 *  - Pending rows are highlighted with an amber left border
 *  - Contextual action buttons per document status:
 *      invoice + pending  → "Pay Now"
 *      form    + pending  → "Complete"
 *      all others         → "Download"
 *  - Document preview drawer (slide-in) with full metadata
 *  - Empty state when search/filter returns no results
 *
 * DATA SOURCE : src/config/portal.config.ts (documents array)
 *
 * CUSTOMIZE:
 * - Add/edit documents in portalConfig.documents.
 * - typeConfig drives all icons, colours, and labels per type.
 * - statusConfig drives all badge colours per status value.
 * ============================================================
 */

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, FileCheck, Receipt, Download, AlertCircle,
  Search, X, Eye, CreditCard, ClipboardList, SlidersHorizontal,
  Calendar, Ship, HardDrive, ChevronRight,
} from "lucide-react";
import { portalConfig } from "@/config/portal.config";
import type { PortalDocument } from "@/config/portal.config";

/** Cubic-bezier easing reused across all motion transitions. */
const EASE = [0.25, 0.1, 0, 1] as [number, number, number, number];

/** Document types used as filter values. "all" shows every document. */
type DocType    = "contract" | "invoice" | "form";
type FilterType = "all" | DocType;

/**
 * Per-type display configuration: icon component, label, and
 * Tailwind colour classes used for the type icon badge.
 */
const typeConfig: Record<DocType, {
  label: string;
  Icon:  React.ElementType;
  color: string;
  bg:    string;
}> = {
  contract: { label: "Contract", Icon: FileCheck,    color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20"    },
  invoice:  { label: "Invoice",  Icon: Receipt,       color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  form:     { label: "Form",     Icon: FileText,       color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20"   },
};

/**
 * Per-status badge colours.
 * Keys must match the `status` values in portalConfig.documents.
 */
const statusConfig: Record<string, { label: string; cls: string }> = {
  signed:  { label: "Signed",  cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  paid:    { label: "Paid",    cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  pending: { label: "Pending", cls: "text-amber-400   bg-amber-500/10   border-amber-500/20"   },
};

/** Formats an ISO date string as "20 Jul 2026". */
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

/**
 * Formats a file size in kilobytes to a human-readable string.
 * Values ≥ 1 024 KB are shown in MB with one decimal place.
 */
function fmtSize(kb: number) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

export default function PortalDocumentsPage() {
  const { documents } = portalConfig;

  /** Currently active type filter. "all" shows every document. */
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");

  /** Live search string — matched against document name and boat name. */
  const [search, setSearch] = useState("");

  /**
   * The document whose detail drawer is currently open.
   * null  → drawer closed.
   * PortalDocument → drawer slides in from the right.
   */
  const [previewDoc, setPreviewDoc] = useState<PortalDocument | null>(null);

  /* ── Derived counts for the stats bar and filter pills ── */

  /** Total document count per type, used in filter pill labels. */
  const counts: Record<FilterType, number> = useMemo(() => ({
    all:      documents.length,
    contract: documents.filter((d) => d.type === "contract").length,
    invoice:  documents.filter((d) => d.type === "invoice").length,
    form:     documents.filter((d) => d.type === "form").length,
  }), [documents]);

  /** Number of documents with status "pending" — drives the alert banner. */
  const pendingCount = useMemo(
    () => documents.filter((d) => d.status === "pending").length,
    [documents],
  );

  /**
   * Filtered document list: applies the active type filter first,
   * then narrows further by the search string (case-insensitive
   * match against name or boat name).
   */
  const filtered = useMemo(() => {
    let result = typeFilter === "all"
      ? [...documents]
      : documents.filter((d) => d.type === typeFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.boatName.toLowerCase().includes(q),
      );
    }
    return result;
  }, [documents, typeFilter, search]);

  /** Filter tab definitions — "All" first, then each specific type. */
  const filterTabs: { key: FilterType; label: string }[] = [
    { key: "all",      label: "All"       },
    { key: "contract", label: "Contracts" },
    { key: "invoice",  label: "Invoices"  },
    { key: "form",     label: "Forms"     },
  ];

  return (
    <div className="space-y-6 max-w-4xl">

      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <p className="text-gold text-[10px] font-body tracking-[0.25em] uppercase mb-2">My Documents</p>
        <h1 className="font-heading text-3xl text-foreground mb-1">Documents</h1>
        <p className="text-muted-foreground text-sm font-body">
          Charter contracts, invoices, and pre-departure forms.
        </p>
      </motion.div>

      {/* ── Summary stats bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.06, ease: EASE }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {/* Total documents */}
        <div className="bg-sidebar border border-sidebar-border p-4 rounded-sm">
          <p className="text-[10px] font-body text-muted-foreground tracking-[0.15em] uppercase mb-1">Total</p>
          <p className="font-heading text-2xl text-foreground">{documents.length}</p>
          <p className="text-[10px] font-body text-muted-foreground/50 mt-0.5">documents</p>
        </div>
        {/* Per-type counts */}
        {(["contract", "invoice", "form"] as DocType[]).map((t) => {
          const cfg = typeConfig[t];
          return (
            <div key={t} className="bg-sidebar border border-sidebar-border p-4 rounded-sm">
              <p className="text-[10px] font-body text-muted-foreground tracking-[0.15em] uppercase mb-1">{cfg.label}s</p>
              <p className={`font-heading text-2xl ${cfg.color}`}>{counts[t]}</p>
              <p className="text-[10px] font-body text-muted-foreground/50 mt-0.5">files</p>
            </div>
          );
        })}
      </motion.div>

      {/* ── Pending action banner ── */}
      {pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
          className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-sm"
        >
          <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-body text-amber-300 font-medium">Action required</p>
            <p className="text-xs font-body text-muted-foreground mt-0.5">
              {pendingCount} document{pendingCount > 1 ? "s" : ""} require your attention —
              review and complete them below.
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Filter tabs + search bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12, ease: EASE }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
      >
        {/* Type filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={13} className="text-muted-foreground/50 shrink-0" aria-hidden />
          {filterTabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={`px-4 py-1.5 text-xs font-body tracking-[0.15em] uppercase border transition-colors ${
                typeFilter === key
                  ? "bg-gold text-midnight border-gold font-semibold"
                  : "border-sidebar-border text-muted-foreground hover:border-gold/30 hover:text-foreground"
              }`}
            >
              {label}
              <span className={`ml-1.5 ${typeFilter === key ? "opacity-70" : "opacity-40"}`}>
                ({counts[key]})
              </span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative ml-auto w-full sm:w-56">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
          <input
            type="text"
            placeholder="Search documents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-sidebar border border-sidebar-border text-sm font-body text-foreground placeholder:text-muted-foreground/40 pl-8 pr-8 py-1.5 focus:outline-none focus:border-gold/40 transition-colors"
          />
          {/* Clear button — only visible when search is non-empty */}
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Document list ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18, ease: EASE }}
      >
        {filtered.length === 0 ? (
          /* Empty state — shown when search/filter has no matches */
          <div className="bg-sidebar border border-sidebar-border rounded-sm px-6 py-16 text-center">
            <FileText size={28} className="text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm font-body text-muted-foreground">No documents match your search.</p>
            <button
              onClick={() => { setSearch(""); setTypeFilter("all"); }}
              className="mt-3 text-xs font-body text-gold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="bg-sidebar border border-sidebar-border rounded-sm overflow-hidden">
            {filtered.map((doc, i) => {
              const cfg       = typeConfig[doc.type];
              const status    = statusConfig[doc.status];
              const isPending = doc.status === "pending";

              return (
                <div
                  key={doc.id}
                  className={`relative flex items-center gap-4 px-5 py-4 transition-colors
                    ${i > 0 ? "border-t border-sidebar-border" : ""}
                    hover:bg-sidebar-accent/40`}
                >
                  {/* Left accent bar — only visible for pending documents */}
                  {isPending && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-amber-500/60" />
                  )}

                  {/* Document type icon badge */}
                  <div className={`w-9 h-9 rounded-sm flex items-center justify-center shrink-0 border ${cfg.bg}`}>
                    <cfg.Icon size={15} className={cfg.color} aria-hidden />
                  </div>

                  {/* Document name + metadata */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body text-foreground truncate leading-snug">{doc.name}</p>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-1">
                      {/* Boat name */}
                      <span className="flex items-center gap-1 text-[11px] font-body text-muted-foreground/60">
                        <Ship size={10} className="text-muted-foreground/40" />
                        {doc.boatName}
                      </span>
                      {/* Issued date */}
                      <span className="flex items-center gap-1 text-[11px] font-body text-muted-foreground/60">
                        <Calendar size={10} className="text-muted-foreground/40" />
                        {fmtDate(doc.date)}
                      </span>
                      {/* File size */}
                      <span className="flex items-center gap-1 text-[11px] font-body text-muted-foreground/40">
                        <HardDrive size={10} className="text-muted-foreground/30" />
                        {fmtSize(doc.sizeKb)}
                      </span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={`hidden sm:inline-flex text-[10px] font-body tracking-[0.12em] uppercase px-2 py-0.5 border rounded-sm shrink-0 ${status.cls}`}>
                    {status.label}
                  </span>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Preview / detail button — always visible */}
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      aria-label={`Preview ${doc.name}`}
                      className="p-1.5 text-muted-foreground/50 hover:text-gold transition-colors"
                    >
                      <Eye size={14} />
                    </button>

                    {/* Contextual primary action */}
                    {isPending && doc.type === "invoice" ? (
                      /* Pending invoice → Pay Now */
                      <button
                        aria-label="Pay invoice"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-body tracking-[0.1em] uppercase bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-colors"
                      >
                        <CreditCard size={11} /> Pay Now
                      </button>
                    ) : isPending && doc.type === "form" ? (
                      /* Pending form → Complete */
                      <button
                        aria-label="Complete form"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-body tracking-[0.1em] uppercase bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-colors"
                      >
                        <ClipboardList size={11} /> Complete
                      </button>
                    ) : (
                      /* All others → Download */
                      <button
                        aria-label={`Download ${doc.name}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-body tracking-[0.1em] uppercase border border-sidebar-border text-muted-foreground hover:text-gold hover:border-gold/30 transition-colors"
                      >
                        <Download size={11} /> Download
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ── Document preview drawer ── */}
      <AnimatePresence>
        {previewDoc && (() => {
          const cfg    = typeConfig[previewDoc.type];
          const status = statusConfig[previewDoc.status];
          const isPending = previewDoc.status === "pending";
          return (
            <>
              {/* Backdrop */}
              <motion.div
                key="doc-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setPreviewDoc(null)}
              />

              {/* Drawer panel */}
              <motion.div
                key="doc-drawer"
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ duration: 0.3, ease: EASE }}
                className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col shadow-2xl"
              >
                {/* Drawer header */}
                <div className="flex items-start justify-between p-6 border-b border-border">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-sm flex items-center justify-center shrink-0 border ${cfg.bg}`}>
                      <cfg.Icon size={17} className={cfg.color} aria-hidden />
                    </div>
                    <div>
                      <p className={`text-[10px] font-body tracking-[0.2em] uppercase mb-0.5 ${cfg.color}`}>
                        {cfg.label}
                      </p>
                      <h2 className="font-heading text-base text-foreground leading-snug pr-4">
                        {previewDoc.name}
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreviewDoc(null)}
                    className="text-muted-foreground/50 hover:text-foreground transition-colors shrink-0 mt-1"
                    aria-label="Close preview"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Drawer body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-body tracking-[0.15em] uppercase px-2.5 py-1 border ${status.cls}`}>
                      {status.label}
                    </span>
                    {isPending && (
                      <span className="text-[10px] font-body text-amber-400 flex items-center gap-1">
                        <AlertCircle size={11} /> Action required
                      </span>
                    )}
                  </div>

                  {/* Metadata rows */}
                  <div>
                    <p className="text-[10px] text-muted-foreground font-body tracking-[0.15em] uppercase mb-3">Details</p>
                    <div className="space-y-0">
                      {[
                        { label: "Document Type", val: cfg.label },
                        { label: "Vessel",        val: previewDoc.boatName },
                        { label: "Booking Ref",   val: previewDoc.bookingId },
                        { label: "Issued",        val: fmtDate(previewDoc.date) },
                        { label: "File Size",     val: fmtSize(previewDoc.sizeKb) },
                        { label: "Format",        val: "PDF" },
                      ].map(({ label, val }) => (
                        <div key={label} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                          <p className="text-xs font-body text-muted-foreground">{label}</p>
                          <p className="text-xs font-body text-foreground font-medium">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Document preview placeholder */}
                  <div>
                    <p className="text-[10px] text-muted-foreground font-body tracking-[0.15em] uppercase mb-3">Preview</p>
                    <div className="aspect-[3/4] bg-muted/10 border border-border/40 rounded-sm flex flex-col items-center justify-center gap-3">
                      <cfg.Icon size={36} className={`${cfg.color} opacity-20`} />
                      <p className="text-xs font-body text-muted-foreground/40 text-center px-4">
                        Document preview not available in demo mode.
                        <br />Use the button below to download the full file.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sticky footer actions */}
                <div className="shrink-0 border-t border-border p-5 flex items-center gap-3">
                  {isPending && previewDoc.type === "invoice" && (
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-body font-semibold tracking-[0.15em] uppercase bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 transition-colors">
                      <CreditCard size={13} /> Pay Invoice
                    </button>
                  )}
                  {isPending && previewDoc.type === "form" && (
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-body font-semibold tracking-[0.15em] uppercase bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 transition-colors">
                      <ClipboardList size={13} /> Complete Form
                    </button>
                  )}
                  <button className={`flex items-center justify-center gap-2 py-3 text-xs font-body font-semibold tracking-[0.15em] uppercase border border-sidebar-border text-muted-foreground hover:text-gold hover:border-gold/30 transition-colors ${isPending ? "px-4" : "flex-1"}`}>
                    <Download size={13} /> Download PDF
                  </button>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
