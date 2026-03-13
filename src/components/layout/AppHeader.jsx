/**
 * AppHeader.jsx — Layout component.
 *
 * CDD Layer 2: Top application header with brand identity.
 * Shows logged-in user info, subscription warning, and logout button.
 */
"use client";

import { motion } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { LogOut, AlertTriangle, Shield } from "lucide-react";
import Link from "next/link";

export function AppHeader() {
  const { user, signOut } = useSession();

  const daysRemaining = user?.daysRemaining ?? null;
  const showWarning   = daysRemaining !== null && daysRemaining <= 7;
  const isAdmin       = user?.role === "admin";

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col gap-2 md:gap-4"
    >
      {/* Top row: Brand + user info */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        {/* Brand */}
        <div>
          <p className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] md:tracking-[0.4em] text-muted">
            Concrete Batching System
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-brand-1 md:text-4xl">
            Production Console
          </h1>
          <p className="mt-1 text-xs text-stone-500 md:text-sm md:max-w-xl hidden sm:block">
            Entry, mix design, and autographic report with live batch generation.
          </p>
        </div>

        {/* Right side: user chip + logout */}
        {user && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* Admin panel link */}
            {isAdmin && (
              <Link href="/admin"
                className="flex items-center gap-1.5 rounded-full border border-brand-1/30 bg-brand-1/10 px-3 py-1.5 text-xs font-semibold text-brand-1 hover:bg-brand-1/20 transition-colors">
                <Shield size={11} /> Admin
              </Link>
            )}
            {/* Username */}
            <div className="rounded-full border border-border bg-surface px-3 py-1.5">
              <span className="text-xs font-semibold text-brand-1">
                {user.displayName || user.username}
              </span>
            </div>
            {/* Logout */}
            <button onClick={signOut}
              className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors">
              <LogOut size={11} /> Logout
            </button>
          </div>
        )}
      </div>

      {/* Subscription warning banner */}
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium border ${
            daysRemaining === 0
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
        >
          <AlertTriangle size={15} className="shrink-0" />
          {daysRemaining === 0
            ? "⛔ Your subscription has expired. Contact your admin to renew access."
            : `⚠️ Your account will expire in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}. Contact your admin to renew.`
          }
        </motion.div>
      )}
    </motion.header>
  );
}
