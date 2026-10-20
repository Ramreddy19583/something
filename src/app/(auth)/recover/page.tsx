"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function RecoverPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setSubmitted(true);
      setMessage(data.message);
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
            Account Recovery
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Enter your account email to receive reset instructions
          </p>
        </div>

        <Card className="border-slate-200 shadow-md">
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="text-center py-4 space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">Request Processed</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
              <Link href="/login" className="inline-block pt-2">
                <Button variant="outline" size="sm">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="recover-email"
                label="Registered Email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2 font-medium"
                isLoading={loading}
              >
                Send Recovery Instructions
              </Button>
            </form>
          )}
        </Card>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
