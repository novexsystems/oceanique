"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";

export function DashboardThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useDashboardTheme();
  const prevTheme = useRef(theme);
  const isFirst = useRef(true);
  const [flashColor, setFlashColor] = useState<string | null>(null);

  useEffect(() => {
    /* Skip on initial mount — only animate on an actual toggle */
    if (isFirst.current) {
      isFirst.current = false;
      prevTheme.current = theme;
      return;
    }
    if (prevTheme.current !== theme) {
      /* Flash the incoming theme's base color so the switch feels instant
         at first, then the CSS transitions smoothly reveal the full change */
      setFlashColor(
        theme === "dark"
          ? "rgba(28, 33, 48, 0.55)"
          : "rgba(255, 255, 255, 0.55)"
      );
      prevTheme.current = theme;
      const t = setTimeout(() => setFlashColor(null), 600);
      return () => clearTimeout(t);
    }
  }, [theme]);

  return (
    <div
      className={`${theme === "dark" ? "dark" : ""} dash-transitions min-h-screen bg-background text-foreground`}
    >
      {children}

      {/* Full-screen flash overlay — fades out to reveal the new theme */}
      <AnimatePresence>
        {flashColor && (
          <motion.div
            key="theme-flash"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0, 1] }}
            className="fixed inset-0 pointer-events-none"
            style={{ backgroundColor: flashColor, zIndex: 9999 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
