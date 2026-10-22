"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmailAuthFlow } from "@/components/auth/EmailAuthFlow";

function SignUpContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/onboarding";

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Get Started with Opportunity AI
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Enter your email to receive a secure 6-digit One-Time Passcode (OTP)
          </p>
        </div>

        <Card className="border-slate-200 shadow-md p-6">
          <EmailAuthFlow callbackUrl={callbackUrl} />
        </Card>

        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>100% Free for Students. No credit card or password required.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading sign in...</div>}>
      <SignUpContent />
    </Suspense>
  );
}
