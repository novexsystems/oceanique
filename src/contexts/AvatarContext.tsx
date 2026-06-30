/**
 * ============================================================
 * OCEANIQUE — AvatarContext
 * ============================================================
 * Provides a single shared profile-picture state that is
 * visible across both the customer portal (/portal/*) and the
 * admin dashboard (/dashboard/*) without requiring a backend.
 *
 * HOW IT WORKS:
 *  1. AvatarProvider is mounted once at the root layout level
 *     via ClientProviders (src/components/common/ClientProviders.tsx).
 *  2. On mount, the provider hydrates avatarUrl from localStorage
 *     so the photo persists across page refreshes.
 *  3. setAvatarUrl() writes to both React state (instant re-render
 *     in all consumers) and localStorage (persistence).
 *  4. Passing null to setAvatarUrl() clears the stored photo and
 *     every consuming component falls back to its initials avatar.
 *
 * DIRECT CONSUMERS:
 *  - src/app/portal/profile/page.tsx       (upload + preview)
 *  - src/components/layout/PortalTopBar.tsx
 *  - src/components/layout/PortalSidebar.tsx
 *  - src/components/layout/DashboardTopBar.tsx
 *
 * PRODUCTION UPGRADE:
 *  Replace the localStorage calls in setAvatarUrl() with an upload
 *  to your storage provider (e.g. AWS S3, Cloudinary) and store
 *  only the returned public URL — not the full base64 string.
 * ============================================================
 */

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

/** localStorage key under which the avatar data URL is persisted. */
const STORAGE_KEY = "oceanique_avatar" as const;

/** Shape of the value provided by AvatarContext. */
type AvatarContextValue = {
  /**
   * The current profile picture as a base64 data URL,
   * or null if no photo has been set yet.
   */
  avatarUrl: string | null;

  /**
   * Updates the profile picture globally.
   * Pass a base64 data URL to set a photo; pass null to remove it.
   * Persists to localStorage so the value survives navigation and
   * page refreshes.
   */
  setAvatarUrl: (url: string | null) => void;
};

/** Context with a no-op default so consumers outside the provider don't crash. */
const AvatarContext = createContext<AvatarContextValue>({
  avatarUrl:    null,
  setAvatarUrl: () => {},
});

// ── Provider ──────────────────────────────────────────────────

/**
 * Mount once at the application root via ClientProviders.
 * Hydrates from localStorage on first render and keeps
 * React state in sync with localStorage on every update.
 */
export function AvatarProvider({ children }: { children: ReactNode }) {
  /** null until hydrated from localStorage in the useEffect below. */
  const [avatarUrl, setAvatarUrlState] = useState<string | null>(null);

  /**
   * Hydrate from localStorage once on mount.
   * try/catch: localStorage may be unavailable in restrictive
   * browser environments (e.g. Safari private browsing).
   */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setAvatarUrlState(stored);
    } catch {
      /* Unavailable — silently fall back to initials everywhere */
    }
  }, []);

  /**
   * Updates state and persists to localStorage in one call.
   * null = remove photo; string = new base64 data URL.
   */
  const setAvatarUrl = useCallback((url: string | null) => {
    setAvatarUrlState(url);
    try {
      if (url) {
        localStorage.setItem(STORAGE_KEY, url);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* Write failed — in-memory state is still updated */
    }
  }, []);

  return (
    <AvatarContext.Provider value={{ avatarUrl, setAvatarUrl }}>
      {children}
    </AvatarContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────

/**
 * Consume the shared avatar state anywhere in the app.
 *
 * @returns `{ avatarUrl, setAvatarUrl }`
 *
 * @example
 * const { avatarUrl, setAvatarUrl } = useAvatar();
 */
export function useAvatar(): AvatarContextValue {
  return useContext(AvatarContext);
}
