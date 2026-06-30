/**
 * ============================================================
 * OCEANIQUE — Support  (Route: /portal/support)
 * ============================================================
 * Customer support hub with:
 *  - Quick action tiles for the most common support tasks
 *  - Enhanced contact form with:
 *      · Topic (select) + optional booking reference
 *      · Priority level: Normal / Urgent / Emergency
 *      · Message textarea with live character count
 *      · Inline field validation before submission
 *      · Animated success state with reference number
 *  - Contact sidebar with:
 *      · Live availability indicator (based on business hours)
 *      · Typical response time chip
 *      · Email, Phone, WhatsApp contact links
 *  - FAQ accordion with live search filter and
 *    per-answer "Was this helpful?" feedback buttons
 *
 * DATA SOURCE : src/config/portal.config.ts (faq, bookings)
 *               src/config/site.config.ts   (contact)
 *
 * CUSTOMIZE:
 * - Add FAQ items in portalConfig.faq.
 * - Update contact details in siteConfig.contact.
 * - Replace setTimeout submission with a real API call.
 * ============================================================
 */

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Phone, MessageCircle, ChevronDown, Send, CheckCircle,
  AlertCircle, Zap, FileText, Anchor, Search, ThumbsUp, ThumbsDown,
  Clock, Wifi, WifiOff, ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { portalConfig } from "@/config/portal.config";

/** Shared cubic-bezier easing for all motion transitions. */
const EASE = [0.25, 0.1, 0, 1] as [number, number, number, number];

/** Maximum characters allowed in the message body. */
const MSG_MAX = 600;

/**
 * Priority levels for a support request.
 * Controls the badge colour shown on the form and in the success state.
 */
const PRIORITIES = [
  { value: "normal",    label: "Normal",    cls: "border-border text-muted-foreground"            },
  { value: "urgent",    label: "Urgent",    cls: "border-amber-500/40 text-amber-400"              },
  { value: "emergency", label: "Emergency", cls: "border-red-500/40   text-red-400"                },
] as const;
type Priority = (typeof PRIORITIES)[number]["value"];

/** Contact form field state. */
type ContactForm = {
  subject:    string;
  bookingRef: string;
  priority:   Priority;
  message:    string;
};

/** Inline validation errors keyed by field name. */
type FormErrors = Partial<Record<keyof ContactForm, string>>;

/**
 * Returns true if the current local time falls within the business
 * hours window (Mon–Sun 08:00–20:00). Used to show a live
 * "Online now" / "Available from…" status badge in the sidebar.
 */
function isBusinessHoursNow(): boolean {
  const h = new Date().getHours();
  return h >= 8 && h < 20;
}

/**
 * Validates all required contact form fields.
 * Returns an object of error strings; an empty object means valid.
 */
function validateForm(form: ContactForm): FormErrors {
  const errs: FormErrors = {};
  if (!form.subject)                       errs.subject = "Please select a topic.";
  if (form.message.trim().length < 20)     errs.message = "Please write at least 20 characters.";
  if (form.message.trim().length > MSG_MAX) errs.message = `Message must be under ${MSG_MAX} characters.`;
  return errs;
}

export default function PortalSupportPage() {
  /* ── Form state ── */

  /** Controlled form fields. */
  const [form, setForm] = useState<ContactForm>({
    subject:    "",
    bookingRef: "",
    priority:   "normal",
    message:    "",
  });

  /** Inline validation errors — populated on submit attempt. */
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Whether the form is in the "submitted" success state.
   * Resets when the customer clicks "Send another message".
   */
  const [submitted, setSubmitted] = useState(false);

  /** Mock ticket reference number shown in the success state. */
  const [ticketRef, setTicketRef] = useState("");

  /* ── FAQ state ── */

  /** Index of the currently open FAQ item (null = all closed). */
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  /** Live search string for filtering FAQ items. */
  const [faqSearch, setFaqSearch] = useState("");

  /**
   * Per-FAQ helpful feedback: maps FAQ index to "up" | "down" | null.
   * Stored in local state — wire to an API to persist.
   */
  const [faqFeedback, setFaqFeedback] = useState<Record<number, "up" | "down" | null>>({});

  /* ── Derived values ── */

  /** Whether the support team is currently online based on business hours. */
  const online = isBusinessHoursNow();

  /**
   * FAQ items filtered by the live search string.
   * Matches against both the question and the answer text,
   * case-insensitively.
   */
  const filteredFaq = useMemo(() => {
    if (!faqSearch.trim()) return portalConfig.faq;
    const q = faqSearch.toLowerCase();
    return portalConfig.faq.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q),
    );
  }, [faqSearch]);

  /* ── Handlers ── */

  /** Validates then submits the form. Generates a mock ticket reference. */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    /* Generate a mock ticket ID: TKT-XXXXXX */
    setTicketRef(`TKT-${Math.floor(100000 + Math.random() * 900000)}`);
    setSubmitted(true);
  }

  /** Resets form and submission state for a new message. */
  function resetForm() {
    setForm({ subject: "", bookingRef: "", priority: "normal", message: "" });
    setErrors({});
    setSubmitted(false);
    setTicketRef("");
  }

  return (
    <div className="space-y-8 max-w-4xl">

      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <p className="text-gold text-[10px] font-body tracking-[0.25em] uppercase mb-2">Help Centre</p>
        <h1 className="font-heading text-3xl text-foreground mb-1">Support</h1>
        <p className="text-muted-foreground text-sm font-body">
          Our charter team is here to help — 7 days a week.
        </p>
      </motion.div>

      {/* ── Quick action tiles ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.06, ease: EASE }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {/* Modify booking → /portal/bookings */}
        <Link href="/portal/bookings"
          className="bg-sidebar border border-sidebar-border hover:border-gold/30 rounded-sm p-4 flex flex-col gap-2 transition-colors group">
          <Anchor size={16} className="text-gold/60 group-hover:text-gold transition-colors" />
          <p className="text-xs font-body text-foreground font-medium leading-snug">Modify Booking</p>
          <p className="text-[10px] font-body text-muted-foreground/50">Change dates or vessel</p>
        </Link>

        {/* Invoice / documents → /portal/documents */}
        <Link href="/portal/documents"
          className="bg-sidebar border border-sidebar-border hover:border-gold/30 rounded-sm p-4 flex flex-col gap-2 transition-colors group">
          <FileText size={16} className="text-gold/60 group-hover:text-gold transition-colors" />
          <p className="text-xs font-body text-foreground font-medium leading-snug">Documents</p>
          <p className="text-[10px] font-body text-muted-foreground/50">Contracts & invoices</p>
        </Link>

        {/* WhatsApp chat */}
        <a href={`https://wa.me/${siteConfig.contact.whatsapp}`} target="_blank" rel="noopener noreferrer"
          className="bg-sidebar border border-sidebar-border hover:border-emerald-500/30 rounded-sm p-4 flex flex-col gap-2 transition-colors group">
          <MessageCircle size={16} className="text-emerald-500/60 group-hover:text-emerald-400 transition-colors" />
          <p className="text-xs font-body text-foreground font-medium leading-snug">WhatsApp</p>
          <p className="text-[10px] font-body text-muted-foreground/50">Instant messaging</p>
        </a>

        {/* Direct phone call */}
        <a href={`tel:${siteConfig.contact.phone}`}
          className="bg-sidebar border border-sidebar-border hover:border-gold/30 rounded-sm p-4 flex flex-col gap-2 transition-colors group">
          <Phone size={16} className="text-gold/60 group-hover:text-gold transition-colors" />
          <p className="text-xs font-body text-foreground font-medium leading-snug">Call Us</p>
          <p className="text-[10px] font-body text-muted-foreground/50">{siteConfig.contact.phone}</p>
        </a>
      </motion.div>

      {/* ── Contact form + sidebar grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Contact form (2/3 width on large screens) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
          className="lg:col-span-2 bg-sidebar border border-sidebar-border rounded-sm p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Send size={14} className="text-gold" aria-hidden />
            <h2 className="font-heading text-base text-foreground">Send a Message</h2>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              /* ── Success state ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="flex flex-col items-center justify-center py-10 text-center gap-4"
              >
                <div className="w-14 h-14 rounded-sm bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle size={26} className="text-emerald-400" />
                </div>
                <div>
                  <p className="font-heading text-lg text-foreground">Message Sent</p>
                  <p className="text-muted-foreground text-sm font-body mt-1">
                    Your request has been logged. Our team will respond within{" "}
                    {form.priority === "emergency" ? "2 hours" : form.priority === "urgent" ? "4 hours" : "24 hours"}.
                  </p>
                </div>
                {/* Ticket reference number */}
                <div className="px-4 py-2 bg-sidebar border border-sidebar-border rounded-sm">
                  <p className="text-[10px] font-body text-muted-foreground/50 tracking-[0.15em] uppercase mb-0.5">Reference</p>
                  <p className="font-heading text-sm text-gold">{ticketRef}</p>
                </div>
                <button
                  onClick={resetForm}
                  className="text-xs font-body text-gold/70 hover:text-gold tracking-[0.15em] uppercase transition-colors mt-1"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              /* ── Contact form ── */
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                noValidate
                className="space-y-5"
              >
                {/* Topic select */}
                <div>
                  <label htmlFor="subject" className="block text-[10px] font-body text-muted-foreground/60 tracking-[0.2em] uppercase mb-2">
                    Topic <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="subject"
                    value={form.subject}
                    onChange={(e) => { setForm((f) => ({ ...f, subject: e.target.value })); setErrors((er) => ({ ...er, subject: undefined })); }}
                    className={`w-full bg-background border text-foreground text-sm font-body px-3 py-2.5 focus:outline-none focus:border-gold/50 transition-colors ${errors.subject ? "border-red-500/50" : "border-sidebar-border"}`}
                  >
                    <option value="">Select a topic…</option>
                    {["Booking enquiry", "Modify a booking", "Cancel a booking", "Invoice question", "Onboard request", "Pre-departure question", "Other"].map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  {errors.subject && (
                    <p className="text-[11px] font-body text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle size={10} />{errors.subject}
                    </p>
                  )}
                </div>

                {/* Optional booking reference */}
                <div>
                  <label htmlFor="bookingRef" className="block text-[10px] font-body text-muted-foreground/60 tracking-[0.2em] uppercase mb-2">
                    Booking Reference <span className="text-muted-foreground/30">(optional)</span>
                  </label>
                  <select
                    id="bookingRef"
                    value={form.bookingRef}
                    onChange={(e) => setForm((f) => ({ ...f, bookingRef: e.target.value }))}
                    className="w-full bg-background border border-sidebar-border text-foreground text-sm font-body px-3 py-2.5 focus:outline-none focus:border-gold/50 transition-colors"
                  >
                    <option value="">None — general enquiry</option>
                    {portalConfig.bookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.id} — {b.boatName} ({b.startDate})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority selector */}
                <div>
                  <p className="text-[10px] font-body text-muted-foreground/60 tracking-[0.2em] uppercase mb-2">Priority</p>
                  <div className="flex items-center gap-2">
                    {PRIORITIES.map(({ value, label, cls }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, priority: value }))}
                        className={`px-4 py-1.5 text-[11px] font-body tracking-[0.12em] uppercase border transition-colors ${
                          form.priority === value
                            ? cls + " bg-opacity-10"
                            : "border-sidebar-border text-muted-foreground/40 hover:border-sidebar-border/70"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {/* Priority explanation */}
                  <p className="text-[10px] font-body text-muted-foreground/40 mt-1.5">
                    {form.priority === "emergency"
                      ? "Emergency: response within 2 hours — for safety or same-day issues only."
                      : form.priority === "urgent"
                      ? "Urgent: response within 4 hours — for time-sensitive matters."
                      : "Normal: response within 24 hours — for general enquiries."}
                  </p>
                </div>

                {/* Message textarea with character count */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="message" className="text-[10px] font-body text-muted-foreground/60 tracking-[0.2em] uppercase">
                      Message <span className="text-red-400">*</span>
                    </label>
                    {/* Live character counter — turns amber near limit */}
                    <span className={`text-[10px] font-body transition-colors ${
                      form.message.length > MSG_MAX * 0.9
                        ? "text-amber-400"
                        : "text-muted-foreground/30"
                    }`}>
                      {form.message.length} / {MSG_MAX}
                    </span>
                  </div>
                  <textarea
                    id="message"
                    rows={5}
                    value={form.message}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, message: e.target.value }));
                      setErrors((er) => ({ ...er, message: undefined }));
                    }}
                    placeholder="How can we help you today?"
                    maxLength={MSG_MAX}
                    className={`w-full bg-background border text-foreground text-sm font-body px-3 py-2.5 resize-none focus:outline-none focus:border-gold/50 transition-colors placeholder:text-muted-foreground/30 ${errors.message ? "border-red-500/50" : "border-sidebar-border"}`}
                  />
                  {errors.message && (
                    <p className="text-[11px] font-body text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle size={10} />{errors.message}
                    </p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-midnight text-xs font-body font-semibold tracking-[0.25em] uppercase hover:bg-gold/90 transition-colors"
                >
                  <Send size={13} />
                  Send Message
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Contact sidebar ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16, ease: EASE }}
          className="space-y-4"
        >
          <div className="bg-sidebar border border-sidebar-border rounded-sm p-6 space-y-5">
            {/* Header + availability badge */}
            <div className="flex items-start justify-between">
              <h2 className="font-heading text-base text-foreground">Contact Directly</h2>
              {/* Live availability indicator based on business hours */}
              <div className={`flex items-center gap-1.5 px-2 py-1 border rounded-sm text-[10px] font-body tracking-[0.1em] uppercase ${
                online
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-muted/10 border-border text-muted-foreground/50"
              }`}>
                {online ? <Wifi size={9} /> : <WifiOff size={9} />}
                {online ? "Online" : "Offline"}
              </div>
            </div>

            {/* Typical response time chip */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gold/5 border border-gold/15 rounded-sm">
              <Clock size={11} className="text-gold/60" />
              <p className="text-[11px] font-body text-muted-foreground/70">
                Typical reply: <span className="text-foreground">under 2 hours</span>
              </p>
            </div>

            {/* Email */}
            <a href={`mailto:${siteConfig.contact.email}`} className="flex items-start gap-3 group">
              <div className="w-8 h-8 rounded-sm bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                <Mail size={13} className="text-gold" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-body text-muted-foreground/50 tracking-[0.15em] uppercase mb-0.5">Email</p>
                <p className="text-sm font-body text-foreground group-hover:text-gold transition-colors truncate">
                  {siteConfig.contact.email}
                </p>
              </div>
            </a>

            {/* Phone */}
            <a href={`tel:${siteConfig.contact.phone}`} className="flex items-start gap-3 group">
              <div className="w-8 h-8 rounded-sm bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                <Phone size={13} className="text-gold" />
              </div>
              <div>
                <p className="text-[10px] font-body text-muted-foreground/50 tracking-[0.15em] uppercase mb-0.5">Phone</p>
                <p className="text-sm font-body text-foreground group-hover:text-gold transition-colors">
                  {siteConfig.contact.phone}
                </p>
              </div>
            </a>

            {/* WhatsApp */}
            <a href={`https://wa.me/${siteConfig.contact.whatsapp}`} target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-3 group">
              <div className="w-8 h-8 rounded-sm bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <MessageCircle size={13} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] font-body text-muted-foreground/50 tracking-[0.15em] uppercase mb-0.5">WhatsApp</p>
                <p className="text-sm font-body text-foreground group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                  Open chat <ExternalLink size={10} className="opacity-50" />
                </p>
              </div>
            </a>

            {/* Business hours */}
            <div className="pt-3 border-t border-sidebar-border">
              <p className="text-[10px] font-body text-muted-foreground/50 tracking-[0.15em] uppercase mb-1">Hours</p>
              <p className="text-sm font-body text-foreground">{siteConfig.contact.businessHours}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── FAQ section ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.22, ease: EASE }}
      >
        {/* FAQ header + search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-gold" aria-hidden />
            <h2 className="font-heading text-base text-foreground">Frequently Asked Questions</h2>
          </div>
          {/* Live search input */}
          <div className="relative sm:ml-auto w-full sm:w-52">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search FAQs…"
              value={faqSearch}
              onChange={(e) => { setFaqSearch(e.target.value); setOpenFaq(null); }}
              className="w-full bg-sidebar border border-sidebar-border text-sm font-body text-foreground placeholder:text-muted-foreground/30 pl-8 pr-3 py-1.5 focus:outline-none focus:border-gold/40 transition-colors"
            />
          </div>
        </div>

        {filteredFaq.length === 0 ? (
          /* Empty state when search has no matches */
          <div className="bg-sidebar border border-sidebar-border rounded-sm px-6 py-10 text-center">
            <p className="text-sm font-body text-muted-foreground">No FAQs match your search.</p>
            <button onClick={() => setFaqSearch("")} className="mt-2 text-xs font-body text-gold hover:underline">
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFaq.map((item, i) => {
              /** Original index in the full FAQ list — used for openFaq and faqFeedback keying. */
              const origIdx = portalConfig.faq.indexOf(item);
              const isOpen  = openFaq === origIdx;
              const feedback = faqFeedback[origIdx] ?? null;

              return (
                <div key={origIdx} className="bg-sidebar border border-sidebar-border rounded-sm overflow-hidden">
                  {/* Accordion trigger */}
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : origIdx)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-body text-foreground pr-4">{item.question}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0"
                    >
                      <ChevronDown size={15} className="text-muted-foreground/50" />
                    </motion.div>
                  </button>

                  {/* Expandable answer */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 border-t border-sidebar-border pt-4">
                          <p className="text-sm font-body text-muted-foreground leading-relaxed mb-4">
                            {item.answer}
                          </p>

                          {/* "Was this helpful?" feedback row */}
                          <div className="flex items-center gap-3">
                            <p className="text-[10px] font-body text-muted-foreground/40 tracking-[0.1em] uppercase">
                              Was this helpful?
                            </p>
                            {/* Thumbs up */}
                            <button
                              onClick={() => setFaqFeedback((prev) => ({ ...prev, [origIdx]: "up" }))}
                              aria-label="Yes, this was helpful"
                              className={`p-1 rounded transition-colors ${feedback === "up" ? "text-emerald-400" : "text-muted-foreground/30 hover:text-emerald-400"}`}
                            >
                              <ThumbsUp size={13} />
                            </button>
                            {/* Thumbs down */}
                            <button
                              onClick={() => setFaqFeedback((prev) => ({ ...prev, [origIdx]: "down" }))}
                              aria-label="No, this was not helpful"
                              className={`p-1 rounded transition-colors ${feedback === "down" ? "text-red-400" : "text-muted-foreground/30 hover:text-red-400"}`}
                            >
                              <ThumbsDown size={13} />
                            </button>
                            {/* Post-feedback message */}
                            {feedback && (
                              <p className="text-[10px] font-body text-muted-foreground/50 ml-1">
                                {feedback === "up" ? "Thanks for your feedback!" : "We'll work on improving this answer."}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
