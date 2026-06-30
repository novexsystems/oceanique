/**
 * ============================================================
 * OCEANIQUE — useAuth HOOK
 * ============================================================
 * React hook that wraps the mock auth utility from lib/auth.ts
 * and provides reactive authentication state to components.
 *
 * Usage:
 *   const { session, isLoggedIn, login, logout } = useAuth();
 *
 * ⚠️  Replace the underlying auth.ts functions with real
 *     authentication provider calls when going to production.
 * ============================================================
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSession,
  isAuthenticated,
  login as authLogin,
  logout as authLogout,
  type Session,
} from "@/lib/auth";
import { siteConfig } from "@/config/site.config";
import { useRouter } from "next/navigation";

interface UseAuthReturn {
  /** The current session object, or null if not authenticated */
  session: Session | null;
  /** True if the user is currently logged in */
  isLoggedIn: boolean;
  /** True while the initial auth check is running */
  isLoading: boolean;
  /**
   * Attempts to log in with email and password.
   * Returns true on success, false on invalid credentials.
   */
  login: (email: string, password: string) => boolean;
  /** Logs the user out and redirects to the login page */
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Read session from localStorage on mount (client-side only)
  useEffect(() => {
    setSession(getSession());
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    const success = authLogin(email, password);
    if (success) {
      setSession(getSession());
    }
    return success;
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setSession(null);
    router.push(siteConfig.auth.loginRedirect);
  }, [router]);

  return {
    session,
    isLoggedIn: isAuthenticated(),
    isLoading,
    login,
    logout,
  };
}
