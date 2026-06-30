/**
 * ============================================================
 * OCEANIQUE — My Profile  (Route: /portal/profile)
 * ============================================================
 * Displays and allows editing of the customer's profile data.
 *
 * Features:
 *  - Hero card: avatar, tier badge, 4 at-a-glance stat tiles
 *  - Loyalty tier progress: dot track + progress bar showing
 *    spend progress from current tier toward the next
 *  - Inline editable sections (Personal Info, Preferences,
 *    Emergency Contact) — each section independently toggles
 *    between read-only and edit mode; changes persist in local
 *    React state (wire up an API call to make them permanent)
 *  - Notification preferences with accessible toggle switches
 *  - "Saved" flash feedback after each successful save
 *
 * DATA SOURCE : src/config/portal.config.ts (customerProfile,
 *               loyaltyTiers)
 *
 * CUSTOMIZE:
 * - Update customerProfile in portal.config.ts for real data.
 * - loyaltyTiers drives the tier progress track automatically.
 * - Wire saveEdit() to a PATCH /api/profile endpoint to persist.
 * ============================================================
 */

"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  User, Phone, MapPin, Anchor, Utensils,
  ShieldAlert, Pencil, Crown, Star, Check,
  Bell, MessageSquare, Mail, X, Camera,
} from "lucide-react";
import { portalConfig } from "@/config/portal.config";
import { useAvatar } from "@/contexts/AvatarContext";

/** Shared cubic-bezier easing for all motion transitions. */
const EASE = [0.25, 0.1, 0, 1] as [number, number, number, number];

/**
 * Mutable copy of the customer profile kept in local state.
 * Mirrors portalConfig.customerProfile but is not readonly,
 * allowing inline edits to be applied without TypeScript errors.
 */
type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  membershipTier: string;
  memberSince: string;
  loyaltyPoints: number;
  totalCharters: number;
  totalNightsAtSea: number;
  totalSpent: number;
  preferredBoatType: string;
  dietaryPreferences: string;
  specialRequests: string;
  emergencyContact: { name: string; relation: string; phone: string };
};

/** Notification preferences — stored in local state only (no API). */
type Notifications = {
  bookingConfirm: boolean;
  charterReminder: boolean;
  specialOffers: boolean;
  smsAlerts: boolean;
};

// ── Sub-components ────────────────────────────────────────────

/**
 * Labelled read-only field.
 * Shows "—" when the value is an empty string.
 */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-body text-muted-foreground/50 tracking-[0.15em] uppercase mb-1">
        {label}
      </p>
      <p className="text-sm font-body text-foreground">{value || "—"}</p>
    </div>
  );
}

/**
 * Single-line editable input used inside a section that is in edit mode.
 * Calls `onChange` on every keystroke so the parent draft state stays in sync.
 */
function EditInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-[10px] font-body text-muted-foreground/50 tracking-[0.15em] uppercase mb-1">
        {label}
      </p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background border border-border text-sm font-body text-foreground px-3 py-2 focus:outline-none focus:border-gold/50 transition-colors"
      />
    </div>
  );
}

/**
 * Multi-line editable textarea — used for the "Special requests" field.
 */
function EditTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-[10px] font-body text-muted-foreground/50 tracking-[0.15em] uppercase mb-1">
        {label}
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full bg-background border border-border text-sm font-body text-foreground px-3 py-2 focus:outline-none focus:border-gold/50 transition-colors resize-none"
      />
    </div>
  );
}

/**
 * Accessible toggle switch.
 * Uses the `role="switch"` ARIA pattern.
 */
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
        checked ? "bg-gold" : "bg-muted/30 border border-border"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/**
 * Section card wrapper.
 * Renders a titled panel with an Edit / Save / Cancel control
 * in the header, driven by `isEditing`.
 *
 * @param sectionKey  - Unique key matching `editSection` state.
 * @param title       - Section heading text.
 * @param icon        - Lucide icon component shown next to the title.
 * @param isEditing   - Whether this section is currently in edit mode.
 * @param isSaved     - Whether the "Saved" flash is active for this section.
 * @param onEdit      - Called when the Edit button is clicked.
 * @param onSave      - Called when the Save button is clicked.
 * @param onCancel    - Called when the Cancel button is clicked.
 * @param delay       - Framer Motion entrance animation delay in seconds.
 * @param children    - Section body content.
 */
function Section({
  title,
  icon: Icon,
  isEditing,
  isSaved,
  onEdit,
  onSave,
  onCancel,
  delay,
  children,
}: {
  title: string;
  icon: React.ElementType;
  isEditing: boolean;
  isSaved: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: EASE }}
      className={`bg-sidebar border rounded-sm transition-colors ${
        isEditing ? "border-gold/30" : "border-sidebar-border"
      }`}
    >
      {/* Section header: title + edit controls */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-gold" aria-hidden />
          <h2 className="font-heading text-sm text-foreground tracking-wide">{title}</h2>
        </div>

        {isEditing ? (
          /* Edit mode: Save + Cancel buttons */
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="flex items-center gap-1 text-[11px] font-body text-muted-foreground/50 hover:text-foreground transition-colors tracking-[0.1em] uppercase"
            >
              <X size={11} /> Cancel
            </button>
            <button
              onClick={onSave}
              className="flex items-center gap-1.5 text-[11px] font-body bg-gold text-midnight px-3 py-1.5 hover:bg-gold/90 transition-colors tracking-[0.1em] uppercase font-semibold"
            >
              <Check size={11} /> Save
            </button>
          </div>
        ) : (
          /* Read mode: Edit button + optional "Saved" flash */
          <div className="flex items-center gap-3">
            {isSaved && (
              <span className="flex items-center gap-1 text-[11px] font-body text-emerald-400 tracking-[0.1em] uppercase">
                <Check size={11} /> Saved
              </span>
            )}
            <button
              aria-label={`Edit ${title}`}
              onClick={onEdit}
              className="flex items-center gap-1.5 text-[11px] font-body text-muted-foreground/50 hover:text-gold transition-colors tracking-[0.1em] uppercase"
            >
              <Pencil size={11} /> Edit
            </button>
          </div>
        )}
      </div>

      <div className="px-6 py-5">{children}</div>
    </motion.div>
  );
}

// ── Page component ────────────────────────────────────────────

export default function PortalProfilePage() {
  const src = portalConfig.customerProfile;

  /* ── Avatar ── */

  /** Shared profile picture — also visible in PortalTopBar, PortalSidebar,
   *  and DashboardTopBar via AvatarContext / localStorage. */
  const { avatarUrl, setAvatarUrl } = useAvatar();

  /** Ref to the hidden <input type="file"> so the visible button can trigger it. */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles avatar file selection.
   * Reads the chosen image as a base64 data URL via FileReader and
   * stores it through AvatarContext (persisted to localStorage).
   *
   * Enforces a 3 MB limit to keep localStorage usage within the
   * typical 5–10 MB browser quota.
   * In production: upload to a storage service instead and store
   * only the returned public URL.
   */
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    /* Guard: reject oversized files before reading into memory */
    const MAX_BYTES = 3 * 1024 * 1024; // 3 MB
    if (file.size > MAX_BYTES) {
      alert("Please choose an image under 3 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result;
      if (typeof url === "string") setAvatarUrl(url);
    };
    reader.readAsDataURL(file);

    /* Reset so the same file can be re-selected after removal */
    e.target.value = "";
  }

  /**
   * Local editable copy of the customer profile.
   * Initialised from portalConfig on first render.
   * Updated only when the customer saves a section.
   */
  const [profile, setProfile] = useState<Profile>({
    firstName:          src.firstName,
    lastName:           src.lastName,
    email:              src.email,
    phone:              src.phone,
    city:               src.city,
    country:            src.country,
    membershipTier:     src.membershipTier,
    memberSince:        src.memberSince,
    loyaltyPoints:      src.loyaltyPoints,
    totalCharters:      src.totalCharters,
    totalNightsAtSea:   src.totalNightsAtSea,
    totalSpent:         src.totalSpent,
    preferredBoatType:  src.preferredBoatType,
    dietaryPreferences: src.dietaryPreferences,
    specialRequests:    src.specialRequests,
    emergencyContact:   { ...src.emergencyContact },
  });

  /**
   * Working copy of the profile modified while a section is in edit mode.
   * Committed to `profile` on save; discarded on cancel.
   */
  const [draft, setDraft] = useState<Profile>(profile);

  /**
   * Key of the section currently in edit mode.
   * null means all sections are read-only.
   */
  const [editSection, setEditSection] = useState<string | null>(null);

  /**
   * Key of the last-saved section — drives the "Saved" flash.
   * Cleared after 2.5 seconds.
   */
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  /**
   * Notification preferences — local state only.
   * Wire these to an API to persist across sessions.
   */
  const [notifications, setNotifications] = useState<Notifications>({
    bookingConfirm:  true,
    charterReminder: true,
    specialOffers:   false,
    smsAlerts:       false,
  });

  /* ── Edit section handlers ── */

  /**
   * Enters edit mode for `key`, creating a fresh draft from the
   * current committed profile so any prior unsaved changes are dropped.
   */
  const startEdit = useCallback((key: string) => {
    setDraft({ ...profile, emergencyContact: { ...profile.emergencyContact } });
    setEditSection(key);
  }, [profile]);

  /** Discards the draft and exits edit mode without saving. */
  const cancelEdit = useCallback(() => setEditSection(null), []);

  /**
   * Commits the draft to `profile`, exits edit mode, and shows a
   * 2.5-second "Saved" flash on the section header.
   */
  const saveEdit = useCallback((key: string) => {
    setProfile({ ...draft, emergencyContact: { ...draft.emergencyContact } });
    setEditSection(null);
    setSavedFlash(key);
    setTimeout(() => setSavedFlash(null), 2500);
  }, [draft]);

  /* ── Loyalty tier progress ── */

  const tiers = portalConfig.loyaltyTiers;

  /** Index of the highest tier whose minSpend the customer has reached. */
  let tierIdx = 0;
  for (let i = 0; i < tiers.length; i++) {
    if (profile.totalSpent >= tiers[i].minSpend) tierIdx = i;
  }
  const currentTier = tiers[tierIdx];
  /** Next tier, or null if the customer is already at the top. */
  const nextTier = tiers[tierIdx + 1] ?? null;

  /**
   * Percentage progress from the current tier's minSpend to the
   * next tier's minSpend. 100 if already at the highest tier.
   */
  const progressPct = nextTier
    ? Math.min(100, Math.round(
        ((profile.totalSpent - currentTier.minSpend) /
         (nextTier.minSpend - currentTier.minSpend)) * 100,
      ))
    : 100;

  return (
    <div className="space-y-6 max-w-3xl">

      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <p className="text-gold text-[10px] font-body tracking-[0.25em] uppercase mb-2">Account</p>
        <h1 className="font-heading text-3xl text-foreground mb-1">My Profile</h1>
        <p className="text-muted-foreground text-sm font-body">
          Your personal details, charter preferences, and membership.
        </p>
      </motion.div>

      {/* ── Hero profile card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.06, ease: EASE }}
        className="bg-sidebar border border-sidebar-border rounded-sm overflow-hidden"
      >
        {/* Avatar row */}
        <div className="flex items-center gap-5 p-6 border-b border-sidebar-border">

          {/* ── Avatar upload zone ── */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            {/*
             * Outer wrapper is a group so the hover overlay can use
             * group-hover:opacity-100. Clicking anywhere on it opens
             * the hidden file input.
             */}
            <div className="relative w-16 h-16 rounded-sm overflow-hidden group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              title="Change profile photo"
              role="button"
              aria-label="Change profile photo"
            >
              {/* Photo or initials fallback */}
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile photo"
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <span className="font-heading text-2xl text-gold">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </span>
                </div>
              )}

              {/* Hover overlay — camera icon + dimmed background */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera size={18} className="text-white" aria-hidden />
              </div>
            </div>

            {/* Hidden file input — triggered by the avatar click above */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              aria-label="Upload profile photo"
            />

            {/* Remove photo — only shown once a photo is set */}
            {avatarUrl && (
              <button
                onClick={() => setAvatarUrl(null)}
                className="text-[9px] font-body text-muted-foreground/40 hover:text-red-400 transition-colors tracking-[0.05em] leading-none"
              >
                Remove
              </button>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-heading text-xl text-foreground">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-muted-foreground text-sm font-body truncate">{profile.email}</p>
            <p className="text-muted-foreground/50 text-[11px] font-body mt-0.5">
              Member since {new Date(profile.memberSince).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
            </p>
          </div>
          {/* Tier badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gold/10 border border-gold/20 rounded-sm">
            <Crown size={13} className="text-gold" />
            <span className="text-gold text-xs font-body tracking-[0.2em] uppercase font-semibold">
              {profile.membershipTier}
            </span>
          </div>
        </div>

        {/* At-a-glance stats: 4 tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-sidebar-border">
          {[
            { label: "Charters",     value: String(profile.totalCharters)        },
            { label: "Nights at Sea", value: String(profile.totalNightsAtSea)    },
            { label: "Total Spent",   value: `$${(profile.totalSpent / 1000).toFixed(1)}K` },
            { label: "Loyalty Pts",   value: profile.loyaltyPoints.toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label} className="px-5 py-4 text-center">
              <p className="font-heading text-xl text-foreground">{value}</p>
              <p className="text-[10px] font-body text-muted-foreground/50 tracking-[0.1em] uppercase mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Loyalty tier progress card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
        className="bg-sidebar border border-sidebar-border rounded-sm p-6"
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Star size={14} className="text-gold" aria-hidden />
            <h2 className="font-heading text-sm text-foreground tracking-wide">Membership Tier</h2>
          </div>
          <span className="text-[10px] font-body text-muted-foreground/50 tracking-[0.1em] uppercase">
            {profile.loyaltyPoints.toLocaleString()} pts available
          </span>
        </div>

        {/* Tier dot track */}
        <div className="flex items-center mb-4">
          {tiers.map((tier, i) => (
            <div key={tier.name} className="flex items-center flex-1 last:flex-none">
              {/* Dot + label */}
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full border-2 transition-colors ${
                  i <= tierIdx
                    ? "bg-gold border-gold"
                    : "bg-transparent border-border/40"
                }`} />
                <p className={`text-[9px] font-body mt-1.5 tracking-[0.08em] uppercase transition-colors ${
                  i === tierIdx ? "text-gold font-semibold" : "text-muted-foreground/40"
                }`}>
                  {tier.name}
                </p>
              </div>
              {/* Connector line between dots */}
              {i < tiers.length - 1 && (
                <div className="flex-1 h-px mx-1 mb-4 relative overflow-hidden bg-border/20">
                  <div
                    className="absolute inset-y-0 left-0 bg-gold transition-all duration-700"
                    style={{ width: i < tierIdx ? "100%" : i === tierIdx ? `${progressPct}%` : "0%" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress message */}
        {nextTier ? (
          <div className="flex items-center justify-between text-[11px] font-body text-muted-foreground/60">
            <span>
              <span className="text-foreground font-medium">
                ${(nextTier.minSpend - profile.totalSpent).toLocaleString()}
              </span>{" "}
              more to reach {nextTier.name}
            </span>
            <span className="text-gold">{progressPct}%</span>
          </div>
        ) : (
          <p className="text-[11px] font-body text-gold">
            You&rsquo;ve reached the highest tier — enjoy double points on every charter.
          </p>
        )}
      </motion.div>

      {/* ── Personal Information (inline editable) ── */}
      <Section
        title="Personal Information"
        icon={User}
        isEditing={editSection === "personal"}
        isSaved={savedFlash === "personal"}
        onEdit={() => startEdit("personal")}
        onSave={() => saveEdit("personal")}
        onCancel={cancelEdit}
        delay={0.14}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {editSection === "personal" ? (
            /* Edit mode: text inputs bound to the draft */
            <>
              <EditInput label="First name"     value={draft.firstName} onChange={(v) => setDraft((d) => ({ ...d, firstName: v }))} />
              <EditInput label="Last name"      value={draft.lastName}  onChange={(v) => setDraft((d) => ({ ...d, lastName:  v }))} />
              <EditInput label="Email address"  value={draft.email}     onChange={(v) => setDraft((d) => ({ ...d, email:     v }))} />
              <EditInput label="Phone"          value={draft.phone}     onChange={(v) => setDraft((d) => ({ ...d, phone:     v }))} />
              <EditInput label="City"           value={draft.city}      onChange={(v) => setDraft((d) => ({ ...d, city:      v }))} />
              <EditInput label="Country"        value={draft.country}   onChange={(v) => setDraft((d) => ({ ...d, country:   v }))} />
            </>
          ) : (
            /* Read mode: plain Field display */
            <>
              <Field label="First name"    value={profile.firstName} />
              <Field label="Last name"     value={profile.lastName}  />
              <Field label="Email address" value={profile.email}     />
              <Field label="Phone"         value={profile.phone}     />
              <Field label="City"          value={profile.city}      />
              <Field label="Country"       value={profile.country}   />
            </>
          )}
        </div>
      </Section>

      {/* ── Charter Preferences (inline editable) ── */}
      <Section
        title="Charter Preferences"
        icon={Anchor}
        isEditing={editSection === "preferences"}
        isSaved={savedFlash === "preferences"}
        onEdit={() => startEdit("preferences")}
        onSave={() => saveEdit("preferences")}
        onCancel={cancelEdit}
        delay={0.2}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {editSection === "preferences" ? (
            <>
              <EditInput
                label="Preferred boat type"
                value={draft.preferredBoatType}
                onChange={(v) => setDraft((d) => ({ ...d, preferredBoatType: v }))}
              />
              <EditInput
                label="Dietary preferences"
                value={draft.dietaryPreferences}
                onChange={(v) => setDraft((d) => ({ ...d, dietaryPreferences: v }))}
              />
              <div className="sm:col-span-2">
                <EditTextarea
                  label="Special requests"
                  value={draft.specialRequests}
                  onChange={(v) => setDraft((d) => ({ ...d, specialRequests: v }))}
                />
              </div>
            </>
          ) : (
            <>
              <Field label="Preferred boat type"  value={profile.preferredBoatType}  />
              <Field label="Dietary preferences"  value={profile.dietaryPreferences} />
              <div className="sm:col-span-2">
                <Field label="Special requests" value={profile.specialRequests} />
              </div>
            </>
          )}
        </div>
      </Section>

      {/* ── Emergency Contact (inline editable) ── */}
      <Section
        title="Emergency Contact"
        icon={ShieldAlert}
        isEditing={editSection === "emergency"}
        isSaved={savedFlash === "emergency"}
        onEdit={() => startEdit("emergency")}
        onSave={() => saveEdit("emergency")}
        onCancel={cancelEdit}
        delay={0.26}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {editSection === "emergency" ? (
            <>
              <EditInput
                label="Name"
                value={draft.emergencyContact.name}
                onChange={(v) => setDraft((d) => ({ ...d, emergencyContact: { ...d.emergencyContact, name: v } }))}
              />
              <EditInput
                label="Relation"
                value={draft.emergencyContact.relation}
                onChange={(v) => setDraft((d) => ({ ...d, emergencyContact: { ...d.emergencyContact, relation: v } }))}
              />
              <EditInput
                label="Phone"
                value={draft.emergencyContact.phone}
                onChange={(v) => setDraft((d) => ({ ...d, emergencyContact: { ...d.emergencyContact, phone: v } }))}
              />
            </>
          ) : (
            <>
              <Field label="Name"     value={profile.emergencyContact.name}     />
              <Field label="Relation" value={profile.emergencyContact.relation} />
              <Field label="Phone"    value={profile.emergencyContact.phone}    />
            </>
          )}
        </div>
      </Section>

      {/* ── Notification Preferences (toggle switches) ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.32, ease: EASE }}
        className="bg-sidebar border border-sidebar-border rounded-sm"
      >
        {/* Section header */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-sidebar-border">
          <Bell size={14} className="text-gold" aria-hidden />
          <h2 className="font-heading text-sm text-foreground tracking-wide">Notification Preferences</h2>
        </div>

        {/* Toggle rows */}
        <div className="divide-y divide-sidebar-border">
          {([
            {
              key:     "bookingConfirm"  as const,
              Icon:    Mail,
              label:   "Booking confirmations",
              desc:    "Receive an email when a booking is confirmed or updated.",
            },
            {
              key:     "charterReminder" as const,
              Icon:    Anchor,
              label:   "Charter reminders",
              desc:    "Get a reminder 48 hours before your departure.",
            },
            {
              key:     "specialOffers"   as const,
              Icon:    Star,
              label:   "Special offers & promotions",
              desc:    "Be the first to hear about exclusive fleet offers.",
            },
            {
              key:     "smsAlerts"       as const,
              Icon:    MessageSquare,
              label:   "SMS alerts",
              desc:    "Receive important updates via text message.",
            },
          ] as const).map(({ key, Icon, label, desc }) => (
            <div key={key} className="flex items-center gap-4 px-6 py-4">
              {/* Notification type icon */}
              <Icon size={15} className="text-muted-foreground/40 shrink-0" aria-hidden />
              {/* Label + description */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body text-foreground">{label}</p>
                <p className="text-[11px] font-body text-muted-foreground/50 mt-0.5">{desc}</p>
              </div>
              {/* Toggle switch */}
              <Toggle
                checked={notifications[key]}
                onChange={(v) => setNotifications((n) => ({ ...n, [key]: v }))}
                label={`Toggle ${label}`}
              />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
