/**
 * ============================================================
 * OCEANIQUE — MOCK AUTHENTICATION UTILITY
 * ============================================================
 * Client-side mock authentication for template/demo purposes.
 * No backend is involved — credentials and session are stored
 * in localStorage using the keys defined in site.config.ts.
 *
 * ⚠️  IMPORTANT FOR PRODUCTION USE:
 *  This is NOT secure and should NOT be used in production.
 *  Replace this module with a real authentication provider
 *  (e.g. NextAuth.js, Clerk, Auth0, Supabase Auth) before
 *  deploying to a live environment with real user data.
 *
 * HOW IT WORKS (DEMO):
 *  - Login checks email + password against site.config values.
 *  - On success, writes a session object to localStorage.
 *  - isAuthenticated() reads that session on each page load.
 *  - Logout clears the session from localStorage.
 * ============================================================
 */

import { siteConfig } from "@/config/site.config";

/** Shape of the session object stored in localStorage */
export interface Session {
  email: string;
  name: string;
  /** admin / manager / viewer = internal team; customer = charter client */
  role: "admin" | "manager" | "viewer" | "customer";
  loggedInAt: string; // ISO date string
}

/**
 * Checks whether a user session exists in localStorage.
 * Safe to call during SSR (returns false server-side).
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const session = localStorage.getItem(siteConfig.auth.sessionKey);
  return session !== null;
}

/**
 * Returns the current session object, or null if not logged in.
 * Safe to call during SSR (returns null server-side).
 */
export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(siteConfig.auth.sessionKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

/**
 * Attempts to log in with the provided email and password.
 * Returns `true` on success, `false` on invalid credentials.
 *
 * Replace this function body with a real API call when
 * integrating a backend authentication system.
 */
export function login(email: string, password: string): boolean {
  // Check admin credentials first
  if (
    email === siteConfig.auth.demoEmail &&
    password === siteConfig.auth.demoPassword
  ) {
    const session: Session = {
      email,
      name: "Admin",
      role: "admin",
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(siteConfig.auth.sessionKey, JSON.stringify(session));
    return true;
  }

  // Check customer credentials
  if (
    email === siteConfig.auth.customerDemoEmail &&
    password === siteConfig.auth.customerDemoPassword
  ) {
    const session: Session = {
      email,
      name: "Sophie Laurent",
      role: "customer",
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(siteConfig.auth.sessionKey, JSON.stringify(session));
    return true;
  }

  return false;
}

/**
 * Clears the session from localStorage, effectively logging out.
 */
export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(siteConfig.auth.sessionKey);
}
