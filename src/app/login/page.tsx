/**
 * ============================================================
 * OCEANIQUE — Login Page  (Route: /login)
 * ============================================================
 * Standalone authentication page. No Header or Footer.
 * Uses the mock auth from lib/auth.ts + useAuth hook.
 *
 * FLOW:
 *  1. User enters email + password
 *  2. useAuth().login() validates against site.config.ts > auth
 *  3. On success → redirects to site.config.ts > auth.dashboardRedirect
 *  4. On failure → shows inline error message
 *
 * CUSTOMIZE:
 * - To change demo credentials: edit site.config.ts > auth
 * - To replace mock auth with a real provider (Clerk, NextAuth,
 *   Supabase): update lib/auth.ts and the useAuth hook.
 * - To change the background image: replace /public/images/hero/login-bg.jpg
 * ============================================================
 *
 * TODO: Build out this page — see design spec.
 * Planned features:
 *  - Split-screen layout: left = brand image, right = form
 *  - Framer Motion form entrance animation
 *  - Show/hide password toggle
 *  - "Remember me" checkbox
 *  - Loading spinner on submit
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getSession } from "@/lib/auth";
import { siteConfig } from "@/config/site.config";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { LOGIN_FLAG_KEY } from "@/components/common/PageLoader";

export default function LoginPage() {
  const { login, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleNotice, setGoogleNotice] = useState(false);

  /* Redirect if already logged in — honour role */
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      const s = getSession();
      router.replace(
        s?.role === "customer"
          ? siteConfig.auth.portalRedirect
          : siteConfig.auth.dashboardRedirect
      );
    }
  }, [isLoading, isLoggedIn, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    const success = login(email, password);
    if (success) {
      const s = getSession();
      sessionStorage.setItem(LOGIN_FLAG_KEY, "1");
      router.push(
        s?.role === "customer"
          ? siteConfig.auth.portalRedirect
          : siteConfig.auth.dashboardRedirect
      );
    } else {
      setError("Invalid email or password. Please check your credentials.");
      setSubmitting(false);
    }
  }

  /* Show nothing while checking auth to avoid flash */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">

      {/* ══════════════════════════════════════
          LEFT — video background + brand overlay
          ══════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[58%] relative flex-col justify-between p-14 overflow-hidden">
        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/hero/HeroSection-video-desk.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay — heavier at bottom for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(170deg, rgba(6,10,20,0.45) 0%, rgba(6,10,20,0.35) 40%, rgba(6,10,20,0.75) 75%, rgba(6,10,20,0.92) 100%)",
          }}
        />

        {/* Top gold accent line */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(201,162,39,0.5) 50%, transparent 100%)",
          }}
        />

        {/* ── Logo ── */}
        <div className="relative z-10">
          <Link href="/" className="group inline-flex flex-col gap-0.5">
            <span className="font-heading text-white text-2xl tracking-[0.4em] uppercase group-hover:text-gold transition-colors duration-300 leading-none">
              {siteConfig.brand.logoText}
            </span>
            <span className="text-[9px] font-body tracking-[0.45em] uppercase text-white/35 leading-none pl-0.5">
              Charter Yachts
            </span>
          </Link>
        </div>

        {/* ── Quote block ── */}
        <motion.div
          className="relative z-10 max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0, 1] }}
        >
          <div className="w-12 h-px bg-gold mb-7" />
          <p className="font-heading text-[2rem] text-white font-light leading-[1.3] mb-5 tracking-wide">
            &ldquo;{siteConfig.brand.tagline}&rdquo;
          </p>
          <p className="text-white/35 text-sm font-body tracking-[0.1em]">
            {siteConfig.brand.name} &mdash; Est. {siteConfig.brand.foundedYear}
          </p>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════
          RIGHT — white form panel
          ══════════════════════════════════════ */}
      <div className="flex-1 bg-white flex items-center justify-center px-8 py-14 lg:py-0">
        <motion.div
          className="w-full max-w-[380px]"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0, 1] }}
        >
          {/* Mobile-only logo */}
          <div className="lg:hidden mb-10">
            <Link href="/" className="font-heading text-midnight text-2xl tracking-[0.4em] uppercase hover:text-gold transition-colors">
              {siteConfig.brand.logoText}
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-9">
            <p className="text-[11px] font-body text-gold tracking-[0.25em] uppercase mb-3">
              Member Access
            </p>
            <h1 className="font-heading text-3xl text-midnight font-light mb-3 leading-tight">
              Welcome back
            </h1>
            <div className="w-10 h-px bg-gold/60" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-stone-500 text-[11px] tracking-[0.18em] uppercase font-body mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={siteConfig.auth.demoEmail}
                className="w-full bg-white border border-stone-200 text-midnight placeholder:text-stone-300 font-body text-sm px-4 py-3.5 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-stone-500 text-[11px] tracking-[0.18em] uppercase font-body mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full bg-white border border-stone-200 text-midnight placeholder:text-stone-300 font-body text-sm px-4 py-3.5 pr-12 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-midnight transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs font-body flex items-center gap-1.5"
              >
                <span className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
                {error}
              </motion.p>
            )}

            {/* Submit — gold gradient + shimmer (matches hero CTA) */}
            <motion.div
              initial="rest"
              whileHover={!submitting ? "hover" : "rest"}
              whileTap={!submitting ? { scale: 0.98 } : {}}
              variants={{
                rest: { boxShadow: "0 0 0px rgba(201,162,39,0)" },
                hover: {
                  boxShadow: "0 8px 28px rgba(201,162,39,0.40), 0 2px 8px rgba(201,162,39,0.20)",
                  transition: { duration: 0.25, ease: "easeOut" },
                },
              }}
              className="relative overflow-hidden mt-2"
            >
              <button
                type="submit"
                disabled={submitting}
                className="relative w-full flex items-center justify-center gap-2 py-4 text-midnight text-xs font-body font-bold tracking-[0.25em] uppercase disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #D4B245 0%, #C9A227 50%, #A8851E 100%)",
                }}
              >
                {/* Shimmer */}
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                  variants={{
                    rest: { x: "-130%" },
                    hover: { x: "230%", transition: { duration: 0.55, ease: "easeInOut" } },
                  }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Signing in…
                    </>
                  ) : (
                    "Sign In"
                  )}
                </span>
              </button>
            </motion.div>
          </form>

          {/* ── Divider ── */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-stone-400 text-[10px] font-body tracking-[0.2em] uppercase">
              Or continue with
            </span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* ── Google Sign In ── */}
          <button
            type="button"
            onClick={() => {
              setGoogleNotice(true);
              setTimeout(() => setGoogleNotice(false), 3500);
            }}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-stone-200 text-stone-700 text-xs font-body font-medium tracking-[0.1em] hover:border-stone-300 hover:bg-stone-50 transition-colors duration-200 shadow-sm"
          >
            {/* Google 'G' logo */}
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          {/* Google demo notice */}
          {googleNotice && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 text-center text-[11px] font-body text-stone-400 tracking-wide"
            >
              Google Sign In is not available in demo mode.
            </motion.p>
          )}

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-stone-50 border border-stone-100 space-y-3">
            <p className="text-stone-400 text-[10px] font-body tracking-[0.15em] uppercase">
              Demo Credentials
            </p>
            <div className="flex gap-6">
              <div>
                <p className="text-stone-400 text-[9px] font-body uppercase tracking-widest mb-1">Admin</p>
                <p className="text-stone-600 text-xs font-mono leading-relaxed">{siteConfig.auth.demoEmail}</p>
                <p className="text-stone-600 text-xs font-mono">{siteConfig.auth.demoPassword}</p>
              </div>
              <div className="w-px bg-stone-200 flex-shrink-0" />
              <div>
                <p className="text-stone-400 text-[9px] font-body uppercase tracking-widest mb-1">Customer</p>
                <p className="text-stone-600 text-xs font-mono leading-relaxed">{siteConfig.auth.customerDemoEmail}</p>
                <p className="text-stone-600 text-xs font-mono">{siteConfig.auth.customerDemoPassword}</p>
              </div>
            </div>
          </div>

          {/* Back to website */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-stone-400 text-xs font-body hover:text-gold transition-colors tracking-wide"
            >
              ← Back to website
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
