"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Search,
  ArrowRight,
  GraduationCap,
  Trophy,
  Award,
  BookOpen,
  Briefcase,
  HelpCircle,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/discover");
    }
  };

  const categories = [
    {
      title: "Internships & Fellowships",
      desc: "Verified student internships like Google Summer of Code, ISRO research internships, and tech fellowships.",
      icon: Briefcase,
      category: "INTERNSHIP",
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      title: "Scholarships & Grants",
      desc: "Merit and need-based financial aid, including Adobe Women in Tech and AWS AI & ML scholarships.",
      icon: Award,
      category: "SCHOLARSHIP",
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      title: "Hackathons & Challenges",
      desc: "National and global innovation contests such as Smart India Hackathon solving real public problems.",
      icon: Trophy,
      category: "HACKATHON",
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      title: "Doctoral & Academic Research",
      desc: "Government and institutional research fellowships like PMRF with comprehensive stipends.",
      icon: GraduationCap,
      category: "RESEARCH",
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      title: "Student Training & Ambassador",
      desc: "Campus leadership programs such as Microsoft Student Ambassadors and GitHub Campus Experts.",
      icon: BookOpen,
      category: "TRAINING",
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      title: "Apprenticeships & Placement",
      desc: "Official statutory training pathways including National Apprenticeship Training Scheme (NATS).",
      icon: FileCheck,
      category: "APPRENTICESHIP",
      color: "text-cyan-600 bg-cyan-50 border-cyan-200",
    },
  ];

  const faqs = [
    {
      q: "How does Opportunity AI verify listings?",
      a: "Every listing is cross-referenced with its authoritative source URL (e.g. university guidelines, government portals, or official program documentation). No listing is published solely because an AI hallucinated it.",
    },
    {
      q: "How does the AI match score work?",
      a: "We use a 3-stage hybrid approach: Stage 1 performs deterministic hard eligibility checks (education level, study year, location). Stage 2 computes transparent relevance scoring across skills and categories. Stage 3 provides explainable rationale based strictly on source evidence. The score indicates profile alignment, not guaranteed acceptance.",
    },
    {
      q: "Can I use Opportunity AI without giving sensitive personal data?",
      a: "Yes. We only ask for academic details (education level, branch, year) and skills necessary to compute eligibility. We do not sell data or share private applications with third parties.",
    },
    {
      q: "What countries are supported?",
      a: "Initially designed for college students in India, with architecture built to expand globally. Listings include both Indian government/institutional initiatives and global open-source programs.",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 border-b border-slate-200/60 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3.5 py-1 text-xs font-medium text-indigo-700 mb-6">
            <ShieldCheck className="h-4 w-4" />
            <span>Zero Fabricated Opportunities • 100% Authoritative Sources</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Discover Verified Opportunities That <span className="text-indigo-600">Actually Match</span> Your Profile.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Stop searching across fragmented portals. Access verified internships, scholarships, hackathons, and research fellowships with transparent, explainable AI eligibility checks.
          </p>

          {/* Quick Search Entry Point */}
          <form
            onSubmit={handleSearch}
            className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row gap-2.5 p-2 bg-white rounded-2xl border border-slate-300 shadow-md focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all"
          >
            <div className="relative flex-1 flex items-center pl-3">
              <Search className="h-5 w-5 text-slate-400 mr-2.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Try: 'Remote Python internship', 'Undergraduate scholarships', or 'GSoC'..."
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <Button type="submit" variant="primary" size="md" className="rounded-xl font-semibold">
              <span>Find Opportunities</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          {/* Primary CTA Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/discover">
              <Button variant="outline" size="sm" className="rounded-lg">
                <Compass className="h-4 w-4 mr-1.5" />
                Browse All Listings
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm" className="rounded-lg">
                Create Free Student Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* The Problem We Solve */}
      <section className="py-14 bg-white border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
              The Student Dilemma
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Why Traditional Opportunity Portals Fail Students
            </h3>
            <p className="mt-3 text-sm text-slate-600">
              Information is distributed across institutional websites, PDF notices, and social feeds with obscure eligibility conditions and expired deadlines.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-slate-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600 mb-4 font-bold">
                1
              </div>
              <h4 className="font-semibold text-slate-900 text-base">Unclear Eligibility Rules</h4>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Students spend hours preparing applications only to find out they did not meet a strict branch, graduation year, or location condition.
              </p>
            </Card>

            <Card className="border-slate-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 mb-4 font-bold">
                2
              </div>
              <h4 className="font-semibold text-slate-900 text-base">Missed Deadlines & Chaos</h4>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Important application windows close without notification, and tracking multiple applications across spreadsheets is tedious.
              </p>
            </Card>

            <Card className="border-slate-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 mb-4 font-bold">
                3
              </div>
              <h4 className="font-semibold text-slate-900 text-base">Hallucinated & Fake Listings</h4>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Generic AI tools generate fake internships or outdated links. Students need verified source URLs and honest uncertainty handling.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Category Overview */}
      <section className="py-14 bg-slate-50 border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
                Explore Categories
              </h2>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Opportunities for Every Stage of Study
              </h3>
            </div>
            <Link
              href="/discover"
              className="mt-3 sm:mt-0 text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View all categories</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.category}
                  href={`/discover?category=${cat.category}`}
                  className="group"
                >
                  <Card hover className="h-full flex flex-col justify-between">
                    <div>
                      <div className={`inline-flex p-2.5 rounded-lg border ${cat.color} mb-3.5`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h4 className="font-semibold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                        {cat.title}
                      </h4>
                      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-medium text-indigo-600">
                      <span>Explore listings</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works: Explainable 3-Stage Matching */}
      <section className="py-14 bg-white border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="info" className="mb-2">Explainable AI Architecture</Badge>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              How Opportunity AI Evaluates Your Fit
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              We never guess eligibility. Our pipeline executes 3 distinct stages to give you transparent, honest guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-6 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">Stage 1</span>
              <h4 className="mt-1 text-lg font-bold text-slate-900">Hard Eligibility Check</h4>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Deterministic rules check your education level, degree, graduation year, and citizenship restrictions against published requirements. If a mandatory criterion is missing from your profile, it is explicitly flagged as unknown.
              </p>
            </div>

            <div className="relative p-6 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">Stage 2</span>
              <h4 className="mt-1 text-lg font-bold text-slate-900">Transparent Scoring</h4>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                A calibrated score (0-100) measures alignment across skills overlap (35%), education relevance (25%), category interest (15%), career goals (10%), and location/remote preferences (10%).
              </p>
            </div>

            <div className="relative p-6 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">Stage 3</span>
              <h4 className="mt-1 text-lg font-bold text-slate-900">Source-Grounded AI Explanation</h4>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                The platform provides an explainable summary detailing requirements satisfied, missing skills, and recommended next steps, accompanied by direct quotes from authoritative source documents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-14 bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              Transparency & FAQ
            </h2>
            <h3 className="text-2xl font-bold text-slate-900">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="mt-2 text-xs text-slate-600 pl-6 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/signup">
              <Button size="lg" className="rounded-xl shadow-md">
                Get Started with Opportunity AI
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
