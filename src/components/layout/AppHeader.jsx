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

        {/* Right side: User Identity & Actions */}
        {user && (
          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Identity Chip */}
            <div className="flex items-center">
              {isAdmin ? (
                <Link href="/admin"
                  className="flex items-center gap-2.5 rounded-full border border-brand-1/30 bg-brand-1/10 p-1 pr-4 hover:bg-brand-1/20 transition-all group"
                  title="Go to Admin Panel">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-1 text-[#f1b24a] shadow-sm group-hover:scale-105 transition-transform">
                    <Shield size={16} fill="currentColor" fillOpacity={0.2} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-brand-1/60 leading-none mb-0.5">Administrator</span>
                    <span className="text-[13px] font-bold text-brand-1 leading-none">
                      {user.displayName || user.username}
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-2.5 rounded-full border border-border bg-surface p-1 pr-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-brand-1 font-bold text-xs border border-border shadow-sm">
                    {(user.displayName || user.username)[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted leading-none mb-0.5">Operator</span>
                    <span className="text-[13px] font-bold text-stone-700 leading-none">
                      {user.displayName || user.username}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Subscription Days (Always visible) */}
            {daysRemaining !== null && (
              <div className={`hidden sm:flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold shadow-sm ${
                daysRemaining <= 5 ? "bg-red-50 border-red-200 text-red-700" :
                daysRemaining <= 15 ? "bg-amber-50 border-amber-200 text-amber-700" :
                "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}>
                <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                  daysRemaining <= 5 ? "bg-red-500" :
                  daysRemaining <= 15 ? "bg-amber-500" :
                  "bg-emerald-500"
                }`} />
                {daysRemaining === 0 ? "Expired" : `${daysRemaining} Days Left`}
              </div>
            )}

            {/* Logout */}
            <button onClick={signOut}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all hover:scale-105 shadow-sm"
              title="Logout">
              <LogOut size={18} />
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
