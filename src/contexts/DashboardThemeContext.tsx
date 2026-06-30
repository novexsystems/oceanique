"use client";

import { createContext, useContext, useState, useEffect } from "react";

type DashboardTheme = "light" | "dark";

interface DashboardThemeCtx {
  theme: DashboardTheme;
  toggle: () => void;
}

const DashboardThemeContext = createContext<DashboardThemeCtx>({
  theme: "light",
  toggle: () => {},
});

const STORAGE_KEY = "oceanique_dash_theme";

export function DashboardThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<DashboardTheme>("light");

  /* Hydrate from localStorage on mount */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next: DashboardTheme = prev === "light" ? "dark" : "light";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  return (
    <DashboardThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </DashboardThemeContext.Provider>
  );
}

export function useDashboardTheme() {
  return useContext(DashboardThemeContext);
}
