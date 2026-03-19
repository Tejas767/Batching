/**
 * AppHeader.jsx — Layout component.
 *
 * CDD Layer 2: Top application header with brand identity.
 * Shows logged-in user info, subscription warning, and logout button.
 */
"use client";

import { motion } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { LogOut, AlertTriangle } from "lucide-react";

export function AppHeader() {
  const { user, signOut } = useSession();

  const daysRemaining = user?.daysRemaining ?? null;
  const showWarning = daysRemaining !== null && daysRemaining <= 7;

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Right side: User Identity & Actions */}
      {user && (
        <div className="flex items-center gap-3">
          {/* Identity Chip */}
          <div className="flex items-center">
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
          </div>

          {/* Subscription Days (Always visible) */}
          {daysRemaining !== null && (
            <div className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold shadow-sm ${daysRemaining <= 5 ? "bg-red-50 border-red-200 text-red-700" :
                daysRemaining <= 15 ? "bg-amber-50 border-amber-200 text-amber-700" :
                  "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}>
              <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${daysRemaining <= 5 ? "bg-red-500" :
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

      {/* Subscription warning banner */}
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium border ${daysRemaining === 0
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
        >
          <AlertTriangle size={14} className="shrink-0" />
          {daysRemaining === 0
            ? "Your subscription has expired."
            : `Expiring in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}.`
          }
        </motion.div>
      )}
    </div>
  );
}
