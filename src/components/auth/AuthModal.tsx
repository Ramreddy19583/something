"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { X, Sparkles, LogIn, UserPlus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  callbackUrl?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  title = "Sign In to Access Student Tools",
  description = "Opportunity AI lets you browse and search all verified opportunities freely. Sign in or create a free student account to save listings, track applications, and unlock personalized AI match scores.",
  callbackUrl = "/discover",
}: AuthModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-50 duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>100% Free for Students</span>
          </div>
        </div>

        <h3 id="auth-modal-title" className="text-lg font-bold text-slate-900">
          {title}
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {description}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="flex-1"
          >
            <Button
              variant="primary"
              size="md"
              className="w-full gap-2 justify-center font-medium"
            >
              <LogIn className="h-4 w-4" />
              <span>Log In</span>
            </Button>
          </Link>
          <Link
            href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="flex-1"
          >
            <Button
              variant="outline"
              size="md"
              className="w-full gap-2 justify-center font-medium"
            >
              <UserPlus className="h-4 w-4" />
              <span>Sign Up Free</span>
            </Button>
          </Link>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
          >
            Continue browsing as guest
          </button>
        </div>
      </div>
    </div>
  );
}
