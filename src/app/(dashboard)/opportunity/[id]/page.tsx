"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Calendar,
  MapPin,
  Clock,
  Bookmark,
  ExternalLink,
  Kanban,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Award,
  ArrowLeft,
  BookOpen,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trackingStatus, setTrackingStatus] = useState<string>("INTERESTED");
  const [trackingNotes, setTrackingNotes] = useState<string>("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [resolvedParams.id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/opportunities/${resolvedParams.id}`);
      if (!res.ok) {
        setError("Opportunity listing not found.");
      } else {
        const json = await res.json();
        setData(json);
        if (json.application) {
          setTrackingStatus(json.application.status);
          setTrackingNotes(json.application.notes || "");
        }
      }
    } catch {
      setError("Failed to load opportunity details.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!data?.opportunity) return;
    setSaveLoading(true);
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: data.opportunity.id }),
      });
      if (res.ok) {
        const resData = await res.json();
        setData((prev: any) => ({ ...prev, isSaved: resData.isSaved }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUpdateTracker = async () => {
    if (!data?.opportunity) return;
    setSavingStatus(true);
    try {
      const res = await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: data.opportunity.id,
          status: trackingStatus,
          notes: trackingNotes,
          deadline: data.opportunity.applicationDeadline,
        }),
      });
      if (res.ok) {
        const resData = await res.json();
        setData((prev: any) => ({ ...prev, application: resData.application }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Loading verified opportunity listing and computing match analysis...
      </div>
    );
  }

  if (error || !data?.opportunity) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-base font-bold text-slate-800">Opportunity Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <Link href="/discover" className="inline-block mt-4">
          <Button variant="outline" size="sm">Back to Discover</Button>
        </Link>
      </div>
    );
  }

  const { opportunity, isSaved, application, matchExplanation } = data;
  const { eligibility, breakdown, reasons, skillMatches, missingSkills } = matchExplanation;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Opportunities</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 pb-6 border-b border-slate-200">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="info">{opportunity.category}</Badge>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Verified Primary Source</span>
            </div>
            {opportunity.isRemote && (
              <Badge variant="outline">Remote Eligible</Badge>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {opportunity.title}
          </h1>

          <p className="text-sm font-semibold text-indigo-700">{opportunity.provider}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{opportunity.location || "Online"}</span>
            </span>
            {opportunity.applicationDeadline && (
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <span>Deadline: {new Date(opportunity.applicationDeadline).toLocaleDateString()}</span>
              </span>
            )}
            {opportunity.compensationDetails && (
              <span className="flex items-center gap-1 font-medium text-emerald-700">
                <Award className="h-3.5 w-3.5" />
                <span>{opportunity.compensationDetails}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
          <a
            href={opportunity.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button variant="primary" size="md" className="w-full gap-2 font-medium">
              <span>Apply on Official Portal</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>

          <Button
            variant="outline"
            size="md"
            onClick={handleToggleSave}
            isLoading={saveLoading}
            className="w-full gap-2 text-xs"
          >
            <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
            <span>{isSaved ? "Saved in Profile" : "Save Opportunity"}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Verified Source Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Overview & Description */}
          <Card>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              Program Overview
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {opportunity.description}
            </p>
          </Card>

          {/* Section: Published Eligibility Criteria */}
          <Card>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              Official Eligibility Requirements
            </h2>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {opportunity.eligibilityRequirements}
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="text-slate-500 font-medium">Target Academic Levels:</span>
              {opportunity.educationRequirements.map((lvl: string) => (
                <Badge key={lvl} variant="default">{lvl}</Badge>
              ))}
            </div>
          </Card>

          {/* Section: Required Skills */}
          {opportunity.skills && opportunity.skills.length > 0 && (
            <Card>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Relevant & Requested Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {opportunity.skills.map((s: any) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50/60 border border-indigo-200 text-indigo-800 text-xs font-medium"
                  >
                    <span>{s.skill.name}</span>
                    {s.isMandatory && (
                      <span className="text-[10px] bg-indigo-200 text-indigo-900 px-1 rounded font-bold">
                        Mandatory
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Application Tracker Panel */}
          <Card className="border-indigo-100 bg-indigo-50/20">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Kanban className="h-4 w-4 text-indigo-600" />
              <span>Track Your Application</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Keep personal notes and track submission milestones. Notes remain strictly private to your account.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Status
                </label>
                <select
                  value={trackingStatus}
                  onChange={(e) => setTrackingStatus(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-indigo-600 focus:outline-none"
                >
                  <option value="INTERESTED">Interested (Researching)</option>
                  <option value="PREPARING">Preparing (Drafting materials)</option>
                  <option value="APPLIED">Applied (Submitted on official portal)</option>
                  <option value="ASSESSMENT">Assessment / Coding Test</option>
                  <option value="INTERVIEW">Interview Scheduled</option>
                  <option value="ACCEPTED">Accepted / Selected</option>
                  <option value="REJECTED">Not Selected</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Private Application Notes
                </label>
                <textarea
                  rows={3}
                  value={trackingNotes}
                  onChange={(e) => setTrackingNotes(e.target.value)}
                  placeholder="e.g. Mentor contact: Dr. Rao. Submitted proposal draft v1. Deadline for recommendation letters is April 10."
                  className="w-full text-xs rounded-lg border border-slate-300 bg-white p-2.5 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleUpdateTracker}
                  isLoading={savingStatus}
                >
                  Save Tracker Status
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: AI Explainable Fit & Source Provenance */}
        <div className="space-y-6">
          {/* AI Match Breakdown Card */}
          <Card className="border-indigo-200 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>AI Profile Fit Analysis</span>
              </span>
              <span className="text-base font-extrabold text-indigo-700">
                {breakdown.totalScore}%
              </span>
            </div>

            {/* Stage 1: Hard Eligibility Verdict */}
            <div className="mt-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Stage 1: Hard Eligibility Check
              </span>
              <div
                className={`mt-1.5 p-2.5 rounded-lg text-xs border ${
                  eligibility.status === "LIKELY_ELIGIBLE"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : eligibility.status === "LIKELY_INELIGIBLE"
                    ? "bg-rose-50 border-rose-200 text-rose-800"
                    : "bg-amber-50 border-amber-200 text-amber-800"
                }`}
              >
                <p className="font-semibold">{eligibility.status.replace(/_/g, " ")}</p>
                <p className="mt-0.5 text-[11px]">{eligibility.overallVerdict}</p>
              </div>

              {eligibility.requirementsNotSatisfied.length > 0 && (
                <div className="mt-2 text-[11px] text-rose-700 space-y-1">
                  <p className="font-semibold">Unsatisfied Requirements:</p>
                  {eligibility.requirementsNotSatisfied.map((r: string, i: number) => (
                    <p key={i} className="flex items-start gap-1">
                      <span className="font-bold">✗</span>
                      <span>{r}</span>
                    </p>
                  ))}
                </div>
              )}

              {eligibility.missingOrUnknownInformation.length > 0 && (
                <div className="mt-2 text-[11px] text-amber-700 space-y-1">
                  <p className="font-semibold">Unknown In Profile:</p>
                  {eligibility.missingOrUnknownInformation.map((m: string, i: number) => (
                    <p key={i} className="flex items-start gap-1">
                      <HelpCircle className="h-3 w-3 shrink-0 mt-0.5" />
                      <span>{m}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Stage 2: Scoring Breakdown */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Stage 2: Scoring Breakdown (100 Max)
              </span>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Skills Alignment (35%):</span>
                  <span className="font-semibold">{breakdown.skillsScore} / 35</span>
                </div>
                <div className="flex justify-between">
                  <span>Education Level (25%):</span>
                  <span className="font-semibold">{breakdown.educationScore} / 25</span>
                </div>
                <div className="flex justify-between">
                  <span>Category Preference (15%):</span>
                  <span className="font-semibold">{breakdown.interestScore} / 15</span>
                </div>
                <div className="flex justify-between">
                  <span>Career Goals (10%):</span>
                  <span className="font-semibold">{breakdown.careerGoalScore} / 10</span>
                </div>
                <div className="flex justify-between">
                  <span>Workplace Style (10%):</span>
                  <span className="font-semibold">{breakdown.locationScore} / 10</span>
                </div>
              </div>
            </div>

            {/* Stage 3: Explainable Rationale */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Stage 3: Explainable Rationale
              </span>

              <ul className="text-xs text-slate-700 space-y-1.5">
                {reasons.map((r: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 p-2 bg-slate-50 rounded text-[11px] text-slate-600">
                <span className="font-semibold">Recommended Action:</span> {matchExplanation.suggestedNextAction}
              </div>

              <p className="mt-2 text-[10px] text-slate-400 italic leading-snug">
                {matchExplanation.disclaimer}
              </p>
            </div>
          </Card>

          {/* Source Provenance Card */}
          <Card className="text-xs space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Source Verification Provenance</span>
            </h3>

            <p className="text-slate-600">
              <span className="font-medium text-slate-800">Source Type:</span> {opportunity.sourceType}
            </p>
            <p className="text-slate-600">
              <span className="font-medium text-slate-800">Last Checked:</span>{" "}
              {new Date(opportunity.lastCheckedAt).toLocaleDateString()}
            </p>
            <p className="text-slate-600">
              <span className="font-medium text-slate-800">Verification Note:</span>{" "}
              {opportunity.verificationNotes || "Verified against primary institutional guidelines"}
            </p>

            <a
              href={opportunity.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-indigo-600 hover:underline font-medium text-xs break-all"
            >
              <span>{opportunity.sourceUrl}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
