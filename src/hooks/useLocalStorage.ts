/**
 * ============================================================
 * OCEANIQUE — useLocalStorage HOOK
 * ============================================================
 * Generic hook for reading and writing values to localStorage
 * with React state synchronization.
 *
 * Usage:
 *   const [theme, setTheme] = useLocalStorage("theme", "dark");
 * ============================================================
 */

"use client";

import { useState, useEffect } from "react";

/**
 * Reads/writes a value from localStorage, kept in sync with
 * React state. Falls back to `initialValue` if not set.
 *
 * @param key - The localStorage key
 * @param initialValue - Default value when key is not found
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`useLocalStorage: failed to set "${key}"`, error);
    }
  };

  // Sync state if another tab updates the same key
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key]);

  return [storedValue, setValue];
}
