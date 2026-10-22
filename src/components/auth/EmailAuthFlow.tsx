"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, KeyRound, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface EmailAuthFlowProps {
  callbackUrl?: string;
  onSuccess?: () => void;
  isModal?: boolean;
}

export function EmailAuthFlow({
  callbackUrl = "/dashboard",
  onSuccess,
  isModal = false,
}: EmailAuthFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugCode, setDebugCode] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send verification code.");
      } else {
        setStep("OTP");
        setInfoMessage(data.message || `Verification code sent to ${email}`);
        if (data.debugCode) {
          setDebugCode(data.debugCode);
        }
      }
    } catch {
      setError("Network or server connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid verification code.");
      } else {
        if (onSuccess) {
          onSuccess();
        }

        // Determine destination
        if (data.isNewUser || (!data.user?.profile?.onboardingCompleted && data.user?.role !== "ADMIN")) {
          router.push("/onboarding");
        } else if (data.user?.role === "ADMIN") {
          router.push("/admin");
        } else if (callbackUrl && callbackUrl !== "/login" && callbackUrl !== "/signup") {
          router.push(callbackUrl);
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch {
      setError("Network error while verifying code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to resend code.");
      } else {
        setInfoMessage(`New verification code sent to ${email}`);
        if (data.debugCode) {
          setDebugCode(data.debugCode);
        }
      }
    } catch {
      setError("Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200 animate-in fade-in-50">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {infoMessage && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-indigo-50 text-indigo-700 text-xs border border-indigo-200 animate-in fade-in-50">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-600" />
          <span>{infoMessage}</span>
        </div>
      )}

      {debugCode && (
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <span>Dev Quick Code: <strong className="font-mono tracking-wider text-sm">{debugCode}</strong></span>
          <button
            type="button"
            onClick={() => setOtp(debugCode)}
            className="text-[11px] underline font-semibold text-amber-800 hover:text-amber-950"
          >
            Auto-fill
          </button>
        </div>
      )}

      {step === "EMAIL" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <Input
            id="auth-email-input"
            label="Email or Gmail Address"
            type="email"
            placeholder="student@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full gap-2 justify-center font-semibold text-sm h-11"
            isLoading={loading}
          >
            <span>Continue with Email</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="text-[11px] text-center text-slate-500">
            We will email you a secure 6-digit One-Time Passcode (OTP). No passwords to create or remember.
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="auth-otp-input" className="block text-sm font-medium text-slate-700">
                6-Digit Verification Code
              </label>
              <button
                type="button"
                onClick={() => {
                  setStep("EMAIL");
                  setError("");
                  setInfoMessage("");
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="h-3 w-3" />
                Change email
              </button>
            </div>

            <input
              id="auth-otp-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              required
              autoFocus
              className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold rounded-xl border border-slate-300 py-3 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <p className="text-[11px] text-slate-500">
              Code valid for 10 minutes. Sent to <span className="font-medium text-slate-700">{email}</span>.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full gap-2 justify-center font-semibold text-sm h-11"
            isLoading={loading}
            disabled={otp.length !== 6}
          >
            <KeyRound className="h-4 w-4" />
            <span>Verify & Sign In</span>
          </Button>

          <div className="flex items-center justify-center pt-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-xs text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1 font-medium"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              <span>Didn&apos;t receive code? Send again</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
