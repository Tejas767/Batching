"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/layout/PageShell";
import { useSession } from "@/hooks/useSession";

export default function RegisterPage() {
  const router = useRouter();
  const { isLoaded } = useSession({ redirectTo: "/", redirectIfFound: true });
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <PageShell>
      <div className="flex min-h-[80vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md rounded-3xl border border-border bg-white p-8 shadow-card"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-1">
            <span className="text-2xl font-bold text-white">SH</span>
          </div>
          
          <h1 className="text-center text-2xl font-semibold text-brand-1">Create Account</h1>
          <p className="mt-2 text-center text-sm text-muted">
            Join the concrete production platform.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tejas Aher"
            />
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full justify-center rounded-xl">
                Create Account
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-stone-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand-1 hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </PageShell>
  );
}
