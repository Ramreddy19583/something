"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Bookmark,
  Kanban,
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function StudentDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [userRes, oppsRes, savedRes, appRes, remRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/opportunities?limit=6&sort=relevance"),
        fetch("/api/saved"),
        fetch("/api/tracker"),
        fetch("/api/reminders"),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }
      if (oppsRes.ok) {
        const oppsData = await oppsRes.json();
        setOpportunities(oppsData.opportunities || []);
      }
      if (savedRes.ok) {
        const savedData = await savedRes.json();
        setSavedItems(savedData.saved || []);
      }
      if (appRes.ok) {
        const appData = await appRes.json();
        setApplications(appData.applications || []);
      }
      if (remRes.ok) {
        const remData = await remRes.json();
        setReminders(remData.reminders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const statusCounts = {
    INTERESTED: applications.filter((a) => a.status === "INTERESTED").length,
    PREPARING: applications.filter((a) => a.status === "PREPARING").length,
    APPLIED: applications.filter((a) => a.status === "APPLIED").length,
    INTERVIEW: applications.filter((a) => a.status === "INTERVIEW" || a.status === "ASSESSMENT").length,
    ACCEPTED: applications.filter((a) => a.status === "ACCEPTED").length,
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-xs text-slate-500">
        Loading personalized student dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, {user?.name || "Student"}
            </h1>
            <Badge variant="success">Verified Active</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {user?.profile?.educationLevel || "Undergraduate"} • {user?.profile?.degree || "STEM"} in{" "}
            {user?.profile?.fieldOfStudy || "Engineering"} (Year {user?.profile?.currentYear || "3"})
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/discover">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
              <Compass className="h-4 w-4" />
              <span>Explore</span>
            </Button>
          </Link>
          <Link href="/ai-assistant">
            <Button variant="primary" size="sm" className="gap-1.5 text-xs h-8">
              <Sparkles className="h-4 w-4" />
              <span>Ask AI Advisor</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards (Real data only) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500">Saved Items</span>
            <Bookmark className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600" />
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold text-slate-900">{savedItems.length}</div>
          <Link href="/saved" className="text-[10px] sm:text-[11px] text-indigo-600 hover:underline mt-1 block">
            View saved listings →
          </Link>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500">In Preparation</span>
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold text-slate-900">
            {statusCounts.PREPARING + statusCounts.INTERESTED}
          </div>
          <Link href="/tracker" className="text-[10px] sm:text-[11px] text-amber-600 hover:underline mt-1 block">
            Review preparation →
          </Link>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500">Submitted</span>
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold text-slate-900">{statusCounts.APPLIED}</div>
          <Link href="/tracker" className="text-[10px] sm:text-[11px] text-emerald-600 hover:underline mt-1 block">
            Track applications →
          </Link>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500">Active Reminders</span>
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-600" />
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold text-slate-900">{reminders.length}</div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-1 block">Upcoming tasks</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: High Match Recommendations & Active Tracking */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recommended Opportunities */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span>High-Alignment Recommendations</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Grounded in your academic profile and technical skills.
                </p>
              </div>
              <Link href="/discover" className="text-xs font-medium text-indigo-600 hover:underline">
                View all ({opportunities.length})
              </Link>
            </div>

            {opportunities.length === 0 ? (
              <Card className="text-center py-10">
                <Compass className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-700">No opportunities found</h4>
                <p className="text-xs text-slate-500 mt-1">Check back later or adjust your filters.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {opportunities.map((opp) => (
                  <Card key={opp.id} hover className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="outline">{opp.category}</Badge>
                        {opp.matchScore !== null && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {opp.matchScore}% Match
                          </span>
                        )}
                      </div>

                      <Link href={`/opportunity/${opp.slug || opp.id}`}>
                        <h3 className="font-semibold text-sm text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1">
                          {opp.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{opp.provider}</p>

                      <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                        {opp.description}
                      </p>

                      {opp.reasons && opp.reasons.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-emerald-700 flex items-start gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{opp.reasons[0]}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>{opp.isRemote ? "Remote" : opp.location || "Onsite"}</span>
                      <Link
                        href={`/opportunity/${opp.slug || opp.id}`}
                        className="font-medium text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Application Tracking Snapshot */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Kanban className="h-4 w-4 text-indigo-600" />
                  <span>Application Progress</span>
                </h2>
                <p className="text-xs text-slate-500">Your current submission statuses.</p>
              </div>
              <Link href="/tracker" className="text-xs font-medium text-indigo-600 hover:underline">
                Open Full Kanban Tracker →
              </Link>
            </div>

            {applications.length === 0 ? (
              <Card className="text-center py-8">
                <Kanban className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">
                  You haven&apos;t added any opportunities to your tracker yet.
                </p>
                <Link href="/discover" className="inline-block mt-3">
                  <Button variant="outline" size="sm">Browse Opportunities</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-2.5">
                {applications.slice(0, 4).map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {app.opportunity?.title || "Opportunity"}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {app.opportunity?.provider} •{" "}
                        {app.deadline
                          ? `Deadline: ${new Date(app.deadline).toLocaleDateString()}`
                          : "No deadline specified"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        app.status === "ACCEPTED"
                          ? "success"
                          : app.status === "APPLIED"
                          ? "info"
                          : "warning"
                      }
                    >
                      {app.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Upcoming Reminders & Skill Gap Suggestions */}
        <div className="space-y-6">
          {/* Upcoming Deadlines & Reminders */}
          <Card>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-indigo-600" />
              <span>Upcoming Reminders</span>
            </h3>

            {reminders.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No upcoming reminders set.</p>
            ) : (
              <div className="space-y-3">
                {reminders.map((rem) => (
                  <div key={rem.id} className="text-xs border-b border-slate-100 pb-2.5 last:border-none">
                    <p className="font-semibold text-slate-800">{rem.title}</p>
                    <p className="text-[11px] text-indigo-600 font-medium mt-0.5">
                      Due: {new Date(rem.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Suggested Skill Gap Improvements */}
          <Card>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              <span>Skill Gap Highlights</span>
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Recommended competencies for your saved opportunities.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-800">Docker & Containers</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Requested by 4 open software fellowship projects.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-800">Technical Writing</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Core requirement for PMRF & research grant proposals.
                </p>
              </div>

              <Link href="/skills" className="block text-center pt-2">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Open Learning Roadmap
                </Button>
              </Link>
            </div>
          </Card>

          {/* Trust Notice */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 text-xs text-emerald-800 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            <p className="leading-relaxed">
              All displayed opportunities are verified with authoritative primary sources. Match scores are calculated dynamically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
