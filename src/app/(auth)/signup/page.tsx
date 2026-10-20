"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed.");
      } else {
        router.push("/onboarding");
        router.refresh();
      }
    } catch {
      setError("Network or server connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create your Student Account
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Discover verified scholarships, internships, and research grants
          </p>
        </div>

        <Card className="border-slate-200 shadow-md">
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="signup-name"
              label="Full Name"
              type="text"
              placeholder="Aarav Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />

            <Input
              id="signup-email"
              label="Email Address"
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              id="signup-password"
              label="Password (min 8 characters, 1 letter & 1 number)"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            <div className="flex items-start gap-2 text-xs text-slate-500 pt-1">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                We never ask for unnecessary personal data. Designed with privacy safeguards for students.
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2 font-medium"
              isLoading={loading}
            >
              Create Account & Continue
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
