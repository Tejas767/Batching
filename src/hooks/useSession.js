"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export function useSession({ redirectTo = "", redirectIfFound = false } = {}) {
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

    // Background poll every 3 minutes for long sessions
    const interval = setInterval(fetchSession, 180000);

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
      router.replace(redirectTo);
    }
  }, [user, isLoaded, redirectTo, redirectIfFound, router]);

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
