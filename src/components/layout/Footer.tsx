import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, CheckCircle2, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 text-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-bold text-slate-900 text-base">Opportunity AI</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              A centralised, verified student opportunity discovery and career guidance platform. Grounded in authoritative source evidence without fabricated listings.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-200">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>100% Authoritative Source Verification</span>
            </div>
          </div>

          {/* Opportunity Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/discover?category=INTERNSHIP" className="hover:text-indigo-600">
                  Internships & Fellowships
                </Link>
              </li>
              <li>
                <Link href="/discover?category=SCHOLARSHIP" className="hover:text-indigo-600">
                  Scholarships & Grants
                </Link>
              </li>
              <li>
                <Link href="/discover?category=HACKATHON" className="hover:text-indigo-600">
                  Hackathons & Challenges
                </Link>
              </li>
              <li>
                <Link href="/discover?category=RESEARCH" className="hover:text-indigo-600">
                  Doctoral & Academic Research
                </Link>
              </li>
              <li>
                <Link href="/discover?category=TRAINING" className="hover:text-indigo-600">
                  Student Ambassador & Training
                </Link>
              </li>
            </ul>
          </div>

          {/* Student Tools */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Student Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/discover" className="hover:text-indigo-600">
                  Explore Verified Listings
                </Link>
              </li>
              <li>
                <Link href="/tracker" className="hover:text-indigo-600">
                  Application Tracker
                </Link>
              </li>
              <li>
                <Link href="/skills" className="hover:text-indigo-600">
                  Skill Gap & Free Resources
                </Link>
              </li>
              <li>
                <Link href="/ai-assistant" className="hover:text-indigo-600">
                  Source-Grounded AI Advisor
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-indigo-600">
                  Data Privacy & Profile Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Verification Policy */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Trust & Security
            </h4>
            <div className="space-y-2 text-xs text-slate-500">
              <p className="flex items-start gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>Zero fabricated opportunities or false statistics.</span>
              </p>
              <p className="flex items-start gap-1.5">
                <Lock className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>Private application notes & secure data controls.</span>
              </p>
              <p className="flex items-start gap-1.5">
                <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>WCAG 2.2 AA accessible semantic interface.</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Opportunity AI. Initial target: India. Built with Next.js & PostgreSQL.</p>
          <div className="flex gap-4">
            <span>Server-side Data Isolation</span>
            <span>•</span>
            <span>GDPR/DPDP Data Export Available</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
