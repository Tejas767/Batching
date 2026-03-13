"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Plus, ToggleLeft, ToggleRight, RefreshCw,
  KeyRound, Trash2, CalendarDays, Shield, LogOut, ChevronDown, AlertCircle, Eye, EyeOff
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSession } from "@/hooks/useSession";

// ── Subscription preset options ───────────────────────────────
const PRESETS = [
  { label: "1 Month",  days: 30  },
  { label: "3 Months", days: 90  },
  { label: "6 Months", days: 180 },
  { label: "1 Year",   days: 365 },
];

// ── Helpers ───────────────────────────────────────────────────
function daysColor(days) {
  if (days === null)  return "text-brand-1 bg-brand-1/10";
  if (days <= 5)      return "text-red-600 bg-red-50";
  if (days <= 15)     return "text-amber-600 bg-amber-50";
  return "text-emerald-700 bg-emerald-50";
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Modal: Create User ────────────────────────────────────────
function CreateUserModal({ onClose, onCreated }) {
  const [form, setForm]     = useState({ username: "", password: "", displayName: "", subscriptionDays: 30, notes: "" });
  const [custom, setCustom] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");
      onCreated(data.data);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <motion.div initial={{ opacity:0,scale:0.95 }} animate={{ opacity:1,scale:1 }} exit={{ opacity:0,scale:0.95 }}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card-lg">
        <h2 className="text-xl font-semibold text-brand-1 mb-6 flex items-center gap-2"><Plus size={18}/> Create Operator</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <Field label="Username" required>
            <input required value={form.username} onChange={e=>set("username",e.target.value)}
              placeholder="e.g. john_operator" className={inputCls} />
          </Field>
          {/* Display Name */}
          <Field label="Display Name">
            <input value={form.displayName} onChange={e=>set("displayName",e.target.value)}
              placeholder="e.g. John Doe" className={inputCls} />
          </Field>
          {/* Password */}
          <Field label="Password" required>
            <div className="relative">
              <input 
                required 
                type={showPassword ? "text" : "password"} 
                value={form.password} 
                onChange={e=>set("password",e.target.value)}
                placeholder="Min. 6 characters" 
                className={`${inputCls} pr-12`} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-brand-1 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>
          {/* Subscription */}
          <Field label="Subscription Period">
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESETS.map(p=>(
                <button type="button" key={p.days}
                  onClick={()=>{ set("subscriptionDays",p.days); setCustom(false); }}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    form.subscriptionDays===p.days && !custom
                      ? "border-brand-1 bg-brand-1 text-white"
                      : "border-border text-stone-600 hover:border-brand-1"}`}>
                  {p.label}
                </button>
              ))}
              <button type="button" onClick={()=>setCustom(true)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  custom ? "border-brand-1 bg-brand-1 text-white" : "border-border text-stone-600 hover:border-brand-1"}`}>
                Custom
              </button>
            </div>
            {custom && (
              <input type="number" min="1" value={form.subscriptionDays}
                onChange={e=>set("subscriptionDays",Number(e.target.value))}
                placeholder="Enter days" className={inputCls} />
            )}
            <p className="text-xs text-muted mt-1">Account expires in <strong>{form.subscriptionDays} days</strong></p>
          </Field>
          {/* Notes */}
          <Field label="Notes (optional)">
            <input value={form.notes} onChange={e=>set("notes",e.target.value)}
              placeholder="Any notes about this user" className={inputCls} />
          </Field>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 border border-red-100"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-stone-600 hover:bg-surface transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 rounded-xl bg-brand-1 py-3 text-sm font-semibold text-white hover:bg-brand-1/90 disabled:opacity-60 transition-colors">
              {loading ? "Creating…" : "Create User"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Modal: Manage Subscription ───────────────────────────────
function RenewModal({ user, onClose, onRenewed }) {
  const [days, setDays]       = useState(30);
  const [mode, setMode]       = useState("add"); // "add" or "set"
  const [custom, setCustom]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleRenew = async () => {
    setError(""); setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onRenewed(data.data);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <motion.div initial={{ opacity:0,scale:0.95 }} animate={{ opacity:1,scale:1 }} exit={{ opacity:0,scale:0.95 }}
        className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-card-lg">
        <h2 className="text-xl font-semibold text-brand-1 mb-1 flex items-center gap-2"><CalendarDays size={18}/> Manage Subscription</h2>
        <p className="text-sm text-muted mb-6">User: <strong>{user.username}</strong></p>

        {/* Mode Toggle */}
        <div className="flex p-1 bg-surface rounded-xl mb-6 border border-border">
          <button onClick={() => setMode("add")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${mode === "add" ? "bg-white text-brand-1 shadow-sm border border-border" : "text-muted hover:text-brand-1"}`}>
            Add Days
          </button>
          <button onClick={() => setMode("set")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${mode === "set" ? "bg-white text-brand-1 shadow-sm border border-border" : "text-muted hover:text-brand-1"}`}>
            Set Total Days
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {PRESETS.map(p=>(
            <button key={p.days} type="button"
              onClick={()=>{ setDays(p.days); setCustom(false); }}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                days===p.days && !custom
                  ? "border-brand-1 bg-brand-1 text-white"
                  : "border-border text-stone-600 hover:border-brand-1"}`}>
              {p.label}
            </button>
          ))}
          <button type="button" onClick={()=>setCustom(true)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              custom ? "border-brand-1 bg-brand-1 text-white" : "border-border text-stone-600 hover:border-brand-1"}`}>
            Custom
          </button>
        </div>
        {custom && (
          <input type="number" min="0" value={days} onChange={e=>setDays(Number(e.target.value))}
            placeholder="Enter days" className={`${inputCls} mb-3`} />
        )}
        
        <p className="text-xs text-muted mb-6">
          {mode === "add" 
            ? `Extending existing subscription by adding `
            : `Overriding total remaining time to `}
          <strong>{days} days</strong>.
        </p>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2 mb-3">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-stone-600 hover:bg-surface transition-colors">
            Cancel
          </button>
          <button onClick={handleRenew} disabled={loading}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-60 transition-colors ${mode === "add" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-brand-1 hover:bg-brand-1/90"}`}>
            {loading ? "Updating…" : mode === "add" ? `Add ${days} Days` : `Set to ${days} Days`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Modal: Reset Password ─────────────────────────────────────
function ResetPasswordModal({ user, onClose }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState("");

  const handleReset = async () => {
    if (!password || password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSuccess(true);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <motion.div initial={{ opacity:0,scale:0.95 }} animate={{ opacity:1,scale:1 }} exit={{ opacity:0,scale:0.95 }}
        className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-card-lg">
        <h2 className="text-xl font-semibold text-brand-1 mb-1 flex items-center gap-2"><KeyRound size={18}/> Reset Password</h2>
        <p className="text-sm text-muted mb-6">User: <strong>{user.username}</strong></p>
        {success ? (
          <div className="text-center py-4">
            <p className="text-emerald-600 font-semibold text-lg mb-2">✅ Password Reset!</p>
            <p className="text-sm text-muted mb-4">The user can now log in with the new password.</p>
            <button onClick={onClose} className="rounded-xl bg-brand-1 px-6 py-2.5 text-sm font-semibold text-white">Done</button>
          </div>
        ) : (
          <>
            <div className="relative mb-3">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e=>setPassword(e.target.value)}
                placeholder="Min. 6 characters" 
                className={`${inputCls} pr-12`} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-brand-1 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 border border-red-100 mb-4"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}
            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-stone-600 hover:bg-surface transition-colors">
                Cancel
              </button>
              <button onClick={handleReset} disabled={loading}
                className="flex-1 rounded-xl bg-brand-1 py-3 text-sm font-semibold text-white hover:bg-brand-1/90 disabled:opacity-60 transition-colors">
                {loading ? "Saving…" : "Reset"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────
const inputCls = "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:border-brand-1 focus:outline-none focus:ring-2 focus:ring-brand-1/20 transition-colors";

function Field({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────
export default function AdminPage() {
  const { user, isLoaded, isSignedIn } = useSession({ redirectTo: "/login" });
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [renewUser, setRenewUser]   = useState(null);
  const [resetUser, setResetUser]   = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const loadUsers = useCallback(async () => {
    // Only load if initialized and admin
    if (!isSignedIn || user?.role !== "admin") return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, user]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // Toggle active/inactive
  const handleToggle = async (user) => {
    setTogglingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: data.data.isActive } : u));
      }
    } finally {
      setTogglingId(null);
    }
  };

  // Delete user execution
  const executeDelete = async () => {
    if (!deleteUser) return;
    await fetch(`/api/admin/users/${deleteUser.id}`, { method: "DELETE" });
    setUsers(prev => prev.filter(u => u.id !== deleteUser.id));
    setDeleteUser(null);
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFCF7]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-1 border-t-transparent" />
      </div>
    );
  }

  if (!isSignedIn || user?.role !== "admin") {
    return null; // Redirect handled by useSession
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  // Stats
  const activeCount  = users.filter(u => u.isActive).length;
  const expiringSoon = users.filter(u => u.daysRemaining !== null && u.daysRemaining <= 7 && u.daysRemaining > 0).length;
  const expired      = users.filter(u => u.daysRemaining !== null && u.daysRemaining === 0).length;

  return (
    <main className="min-h-screen bg-[#FDFCF7]">
      {/* Header */}
      <header className="border-b border-border bg-white px-4 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-1">
            <Shield size={18} className="text-[#f1b24a]" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">Admin Panel</p>
            <h1 className="text-lg font-semibold text-brand-1 leading-tight">User Management</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">

          <button onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors">
            <LogOut size={13} /> Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 md:px-10 py-8 space-y-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Operators", value: users.length,   color: "text-brand-1",    bg: "bg-brand-1/10" },
            { label: "Active Accounts", value: activeCount,    color: "text-emerald-700", bg: "bg-emerald-50" },
            { label: "Expiring Soon",   value: expiringSoon,   color: "text-amber-600",   bg: "bg-amber-50" },
            { label: "Expired",         value: expired,        color: "text-red-600",     bg: "bg-red-50" },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border border-border ${s.bg} p-5`}>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* User List Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-1">Operators</h2>
          <div className="flex gap-2">
            <button onClick={loadUsers}
              className="flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-stone-600 hover:border-brand-1 transition-colors">
              <RefreshCw size={13} /> Refresh
            </button>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 rounded-full bg-brand-1 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-1/90 transition-colors">
              <Plus size={13} /> New User
            </button>
          </div>
        </div>

        {/* User Cards / Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-1 border-t-transparent" />
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-12 text-center text-muted">
            No operators yet. Click <strong>New User</strong> to create one.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-border bg-white">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="bg-brand-1 text-white text-left">
                    {["User","Status","Subscription","Expires","Actions"].map((h,i)=>(
                      <th key={h} className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-widest ${i===0?"rounded-tl-xl":""} ${i===4?"rounded-tr-xl text-center":""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <motion.tr key={user.id}
                      initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} transition={{ delay: idx*0.03 }}
                      className={idx % 2 === 0 ? "bg-white" : "bg-surface"}>
                      <td className="border-b border-border px-5 py-3.5">
                        <p className="font-semibold text-brand-1">{user.username}</p>
                        <p className="text-xs text-muted">{user.displayName || "—"}</p>
                      </td>
                      <td className="border-b border-border px-5 py-3.5">
                        <button onClick={() => handleToggle(user)} disabled={togglingId === user.id}
                          className="flex items-center gap-1.5 transition-opacity disabled:opacity-50">
                          {user.isActive
                            ? <ToggleRight size={26} className="text-emerald-500" />
                            : <ToggleLeft size={26} className="text-stone-300" />}
                          <span className={`text-xs font-semibold ${user.isActive ? "text-emerald-600" : "text-stone-400"}`}>
                            {user.isActive ? "Active" : "Disabled"}
                          </span>
                        </button>
                      </td>
                      <td className="border-b border-border px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${daysColor(user.daysRemaining)}`}>
                          {user.daysRemaining === null ? "No expiry" : user.daysRemaining === 0 ? "Expired" : `${user.daysRemaining} days left`}
                        </span>
                      </td>
                      <td className="border-b border-border px-5 py-3.5 text-xs text-muted">
                        {formatDate(user.expiresAt)}
                      </td>
                      <td className="border-b border-border px-5 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <ActionBtn onClick={() => setRenewUser(user)} color="emerald" icon={<CalendarDays size={12}/>} label="Renew" />
                          <ActionBtn onClick={() => setResetUser(user)} color="amber" icon={<KeyRound size={12}/>} label="Reset PW" />
                          <ActionBtn onClick={() => setDeleteUser(user)} color="red" icon={<Trash2 size={12}/>} label="Delete" />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden flex flex-col gap-3">
              {users.map((user, idx) => (
                <motion.div key={user.id}
                  initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} transition={{ delay: idx*0.03 }}
                  className="rounded-2xl border border-border bg-white p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-brand-1">{user.username}</p>
                      <p className="text-xs text-muted">{user.displayName || "—"}</p>
                    </div>
                    <button onClick={() => handleToggle(user)} disabled={togglingId === user.id}
                      className="flex items-center gap-1 disabled:opacity-50">
                      {user.isActive ? <ToggleRight size={28} className="text-emerald-500"/> : <ToggleLeft size={28} className="text-stone-300"/>}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${daysColor(user.daysRemaining)}`}>
                      {user.daysRemaining === null ? "No expiry" : user.daysRemaining === 0 ? "Expired" : `${user.daysRemaining} days left`}
                    </span>
                    <span className="text-xs text-muted">Expires: {formatDate(user.expiresAt)}</span>
                  </div>
                  <div className="flex gap-2 pt-1 border-t border-border">
                    <ActionBtn onClick={() => setRenewUser(user)} color="emerald" icon={<CalendarDays size={12}/>} label="Renew" full />
                    <ActionBtn onClick={() => setResetUser(user)} color="amber" icon={<KeyRound size={12}/>} label="Reset PW" full />
                    <ActionBtn onClick={() => setDeleteUser(user)} color="red" icon={<Trash2 size={12}/>} label="Delete" full />
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence mode="wait">
        {showCreate && (
          <CreateUserModal
            key="create-modal"
            onClose={() => setShowCreate(false)}
            onCreated={(u) => { setUsers(prev => [u,...prev]); setShowCreate(false); loadUsers(); }}
          />
        )}
        {renewUser && (
          <RenewModal
            key="renew-modal"
            user={renewUser}
            onClose={() => setRenewUser(null)}
            onRenewed={() => { setRenewUser(null); loadUsers(); }}
          />
        )}
        {resetUser && (
          <ResetPasswordModal
            key="reset-modal"
            user={resetUser}
            onClose={() => setResetUser(null)}
          />
        )}

        {deleteUser && (
          <ConfirmDialog
            key="delete-modal"
            open={!!deleteUser}
            onClose={() => setDeleteUser(null)}
            onConfirm={executeDelete}
            title="Delete Operator?"
            message={`Are you sure you want to delete "${deleteUser?.username}"? This will PERMANENTLY erase all their batch records and history. This action cannot be undone.`}
            confirmText="Delete User & History"
            variant="danger"
          />
        )}
      </AnimatePresence>
    </main>
  );
}

// Small action button
function ActionBtn({ onClick, color, icon, label, full }) {
  const colors = {
    emerald: "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
    amber:   "border-amber-200 text-amber-700 hover:bg-amber-50",
    red:     "border-red-200 text-red-600 hover:bg-red-50",
  };
  return (
    <button onClick={onClick}
      className={`flex items-center justify-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${colors[color]} ${full ? "flex-1" : ""}`}>
      {icon}{label}
    </button>
  );
}
