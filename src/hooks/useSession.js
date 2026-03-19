"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export function useSession({ redirectTo = "", redirectIfFound = false, requireRole = null } = {}) {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        setUser(json.data);
      } else if (res.status === 403) {
        // Force logout if forbidden (account deactivated)
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchSession();

    // Re-verify on focus (handles account deactivation in another tab)
    const onFocus = () => fetchSession();
    window.addEventListener("focus", onFocus);

    // Background poll every 10 minutes for long sessions (optimized for serverless)
    const interval = setInterval(fetchSession, 600000);

    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [fetchSession]);

  useEffect(() => {
    if (!isLoaded) return;

    // Redirect behavior
    if (!user && redirectTo && !redirectIfFound) {
      // Not logged in, but we require auth
      router.replace(redirectTo);
    } else if (user && redirectTo && redirectIfFound) {
      // Logged in, but we shouldn't be here (e.g. login page)
      // Check role to redirect to correct dashboard
      const dashboardRoute = user.role === "admin" ? "/admin" : "/";
      router.replace(redirectTo === "/" ? dashboardRoute : redirectTo);
    } else if (user && requireRole && user.role !== requireRole) {
      // User has the wrong role for this page
      const dashboardRoute = user.role === "admin" ? "/admin" : "/";
      router.replace(dashboardRoute);
    }
  }, [user, isLoaded, redirectTo, redirectIfFound, requireRole, router]);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  }, [router]);

  return {
    user,
    isLoaded,
    isSignedIn: !!user,
    signOut,
    refreshSession: fetchSession,
  };
}
