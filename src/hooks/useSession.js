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
  }, [fetchSession]);

  useEffect(() => {
    if (!isLoaded) return;

    // Redirect behavior
    if (!user && redirectTo && !redirectIfFound) {
      // Not logged in, but we require auth
      router.push(redirectTo);
    } else if (user && redirectTo && redirectIfFound) {
      // Logged in, but we shouldn't be here (e.g. login page)
      router.push(redirectTo);
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
