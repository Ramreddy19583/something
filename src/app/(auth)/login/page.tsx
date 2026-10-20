"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Lock, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed. Please check your credentials.");
      } else {
        if (!data.user?.profile?.onboardingCompleted && data.user?.role !== "ADMIN") {
          router.push("/onboarding");
        } else if (data.user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch {
      setError("Network or server connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sign in to Opportunity AI
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Access your personalized student discovery feed and application tracker
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
              id="login-email"
              label="Email Address"
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <Link
                  href="/recover"
                  className="text-xs text-indigo-600 hover:text-indigo-700"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none transition-colors"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2 font-medium"
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Login Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-xs">
            <p className="font-semibold text-slate-700 mb-2">Demo Accounts:</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill("student@opportunity.ai", "Student@123456")}
                className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-[11px] text-slate-600 text-left"
              >
                🎓 <span className="font-medium">Student:</span> Aarav
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("admin@opportunity.ai", "Admin@123456")}
                className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-[11px] text-slate-600 text-left"
              >
                🛡️ <span className="font-medium">Admin:</span> Portal
              </button>
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-700">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
