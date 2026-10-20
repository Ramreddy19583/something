"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Code,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  FolderGit2,
  Award,
  Layers,
  HelpCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function SkillDevelopmentPage() {
  const [user, setUser] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<string>("");
  const [skillGap, setSkillGap] = useState<any>(null);
  const [loadingGap, setLoadingGap] = useState(false);

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    try {
      const [userRes, oppsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/opportunities?limit=10"),
      ]);
      if (userRes.ok) {
        const u = await userRes.json();
        setUser(u.user);
      }
      if (oppsRes.ok) {
        const o = await oppsRes.json();
        const opps = o.opportunities || [];
        setOpportunities(opps);
        if (opps.length > 0) {
          setSelectedOppId(opps[0].id);
          evaluateGap(opps[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const evaluateGap = async (oppId: string) => {
    setLoadingGap(true);
    try {
      const res = await fetch("/api/ai/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: oppId }),
      });
      if (res.ok) {
        const data = await res.json();
        setSkillGap(data.analysis);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGap(false);
    }
  };

  const handleSelectOpportunity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const oppId = e.target.value;
    setSelectedOppId(oppId);
    evaluateGap(oppId);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-indigo-600" />
          <span>Skill Gap & Practical Learning Roadmap</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Bridge the gap between your current academic skillset and the verified requirements of your target opportunities.
        </p>
      </div>

      {/* Target Opportunity Selector */}
      <Card className="p-4 bg-white border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Target Opportunity
            </label>
            <p className="text-xs text-slate-500">
              Analyze missing skills and generate a structured curriculum with free resources.
            </p>
          </div>

          <div className="w-full sm:w-80">
            <select
              value={selectedOppId}
              onChange={handleSelectOpportunity}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
            >
              {opportunities.map((opp) => (
                <option key={opp.id} value={opp.id}>
                  {opp.title} ({opp.provider})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {loadingGap ? (
        <div className="py-20 text-center text-xs text-slate-400">
          Analyzing required skills against your student profile...
        </div>
      ) : !skillGap ? (
        <Card className="text-center py-12">
          <p className="text-xs text-slate-500">Select an opportunity above to view skill analysis.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-emerald-50/50 border-emerald-200">
              <span className="text-xs font-semibold text-emerald-800">Your Matched Skills</span>
              <div className="mt-2 text-2xl font-bold text-emerald-900">
                {skillGap.matchedSkills.length}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {skillGap.matchedSkills.map((s: string) => (
                  <Badge key={s} variant="success">{s}</Badge>
                ))}
              </div>
            </Card>

            <Card className="p-4 bg-amber-50/50 border-amber-200">
              <span className="text-xs font-semibold text-amber-800">Identified Skill Gaps</span>
              <div className="mt-2 text-2xl font-bold text-amber-900">
                {skillGap.gapSkills.length}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {skillGap.gapSkills.map((s: string) => (
                  <Badge key={s} variant="warning">{s}</Badge>
                ))}
              </div>
            </Card>

            <Card className="p-4 bg-indigo-50/50 border-indigo-200">
              <span className="text-xs font-semibold text-indigo-800">Total Listing Requirements</span>
              <div className="mt-2 text-2xl font-bold text-indigo-900">
                {skillGap.requiredSkills.length}
              </div>
              <p className="mt-2 text-[11px] text-indigo-600">
                Required for {skillGap.targetTitle}
              </p>
            </Card>
          </div>

          {/* Structured Learning Roadmap */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Recommended Open-Access Learning Steps</span>
            </h2>

            {skillGap.suggestedRoadmap.length === 0 ? (
              <Card className="text-center py-8">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-900">All Core Skills Satisfied!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Your profile matches all specified skills for this opportunity. Focus on drafting your proposal.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {skillGap.suggestedRoadmap.map((item: any, idx: number) => (
                  <Card key={idx} className="p-5 border-slate-200">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                            {idx + 1}
                          </span>
                          <h3 className="font-bold text-sm text-slate-900">
                            Master: {item.skill}
                          </h3>
                        </div>

                        <p className="text-xs text-slate-600 pl-8 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Practical Project Suggestion */}
                        <div className="ml-8 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                          <span className="font-bold text-slate-800 flex items-center gap-1 mb-1">
                            <FolderGit2 className="h-3.5 w-3.5 text-indigo-600" />
                            <span>Recommended Portfolio Project:</span>
                          </span>
                          <p className="text-slate-600 pl-4">{item.suggestedProject}</p>
                        </div>
                      </div>

                      {/* Curated Free Resource */}
                      <div className="w-full md:w-72 shrink-0 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                          Curated Free Course / Guide
                        </span>
                        <h4 className="font-bold text-slate-900 line-clamp-2">
                          {item.freeResource.title}
                        </h4>
                        <p className="text-[11px] text-slate-500">Provider: {item.freeResource.provider}</p>
                        <a
                          href={item.freeResource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pt-1 inline-flex items-center gap-1 text-indigo-600 hover:underline font-semibold text-xs"
                        >
                          <span>Open Resource</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Honest Disclaimer */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-700">Fair Notice: </span>
            {skillGap.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
}
