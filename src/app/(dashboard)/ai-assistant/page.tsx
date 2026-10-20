"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Send,
  HelpCircle,
  ShieldCheck,
  ExternalLink,
  BookOpen,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function AiAssistantPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "resume">("chat");
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [chatLog, setChatLog] = useState<any[]>([
    {
      sender: "ai",
      text: "Hello! I am your Opportunity AI Advisor. I am grounded directly in official opportunity documents and your student profile. Ask me about eligibility rules, missing qualifications, or how to prepare your application.",
      evidence: ["Platform Verified Ground Truth Rules"],
      uncertainties: [],
      suggestedQuestions: [
        "What are the eligibility requirements for Google Summer of Code?",
        "How do I apply for the Prime Minister's Research Fellowship (PMRF)?",
        "Am I eligible for Smart India Hackathon?",
      ],
    },
  ]);
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  // Resume builder state
  const [resumeAction, setResumeAction] = useState("");
  const [resumeContext, setResumeContext] = useState("");
  const [resumeOutcome, setResumeOutcome] = useState("");
  const [draftBullets, setDraftBullets] = useState<string[]>([]);
  const [resumeNotice, setResumeNotice] = useState("");
  const [loadingResume, setLoadingResume] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/opportunities?limit=15")
      .then((res) => res.json())
      .then((data) => setOpportunities(data.opportunities || []))
      .catch(console.error);
  }, []);

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = queryText || query;
    if (!textToSend.trim()) return;

    const userMessage = { sender: "user", text: textToSend };
    setChatLog((prev) => [...prev, userMessage]);
    setQuery("");
    setLoadingAnswer(true);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToSend,
          opportunityId: selectedOppId || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatLog((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.response.answer,
            sourceTitle: data.response.sourceTitle,
            sourceUrl: data.response.sourceUrl,
            evidence: data.response.evidenceQuotes,
            uncertainties: data.response.uncertainties,
            suggestedQuestions: data.response.suggestedQuestions,
          },
        ]);
      } else {
        setChatLog((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "Sorry, I could not complete the query. Please ensure the server is connected.",
          },
        ]);
      }
    } catch {
      setChatLog((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Network error occurred while fetching the grounded response.",
        },
      ]);
    } finally {
      setLoadingAnswer(false);
    }
  };

  const handleGenerateBullets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeAction || !resumeContext) return;

    setLoadingResume(true);
    try {
      const res = await fetch("/api/ai/resume-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: resumeAction,
          context: resumeContext,
          outcome: resumeOutcome || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDraftBullets(data.draftBullets || []);
        setResumeNotice(data.reviewNotice || "");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingResume(false);
    }
  };

  const handleCopyBullet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            <span>AI Career & Opportunity Advisor</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Grounded in verified listings. Strictly forbids hallucinated rules or fabricated achievements.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "chat" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Grounded Q&A
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("resume")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "resume" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Factual Resume Drafter
          </button>
        </div>
      </div>

      {activeTab === "chat" ? (
        <div className="space-y-4">
          {/* Opportunity Context selector */}
          <Card className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 shrink-0">Focus on Opportunity:</span>
              <select
                value={selectedOppId}
                onChange={(e) => setSelectedOppId(e.target.value)}
                className="w-full sm:w-80 text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 focus:border-indigo-600"
              >
                <option value="">General (All Verified Opportunities)</option>
                {opportunities.map((opp) => (
                  <option key={opp.id} value={opp.id}>
                    {opp.title} ({opp.provider})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Evidence-Backed Response Mode</span>
            </div>
          </Card>

          {/* Chat Window */}
          <Card className="p-4 min-h-[420px] max-h-[600px] flex flex-col justify-between overflow-hidden bg-slate-50/50">
            {/* Messages Log */}
            <div className="space-y-4 overflow-y-auto pr-1 pb-4 flex-1">
              {chatLog.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-tr-none shadow-sm"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-xs"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Grounded Source Quote Badges */}
                    {msg.evidence && msg.evidence.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                        <span className="font-bold text-slate-700 block">Cited Official Evidence:</span>
                        {msg.evidence.map((ev: string, idx: number) => (
                          <div key={idx} className="p-1.5 bg-slate-50 rounded border border-slate-200 italic">
                            {ev}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Uncertainty Notice */}
                    {msg.uncertainties && msg.uncertainties.length > 0 && (
                      <div className="pt-2 text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                        <span className="font-bold flex items-center gap-1 mb-0.5">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Uncertainty Disclosed:</span>
                        </span>
                        {msg.uncertainties.map((u: string, idx: number) => (
                          <p key={idx}>• {u}</p>
                        ))}
                      </div>
                    )}

                    {/* Official Link */}
                    {msg.sourceUrl && (
                      <div className="pt-1">
                        <a
                          href={msg.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline font-semibold"
                        >
                          <span>Review on {msg.sourceTitle || "Official Source"}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {/* Suggested follow-up questions */}
                    {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {msg.suggestedQuestions.map((sq: string, sqIdx: number) => (
                          <button
                            key={sqIdx}
                            type="button"
                            onClick={() => handleSendQuery(sq)}
                            className="text-[10px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-full"
                          >
                            + {sq}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loadingAnswer && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl p-3 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-spin text-indigo-600" />
                    <span>Cross-referencing verified opportunity documents...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery();
              }}
              className="mt-3 pt-3 border-t border-slate-200 flex gap-2"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything about eligibility, deadlines, stipend, or application steps..."
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={loadingAnswer}
                className="rounded-xl px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Card>
        </div>
      ) : (
        /* Factual Resume Drafter Tab */
        <div className="space-y-6">
          <Card className="p-5 border-slate-200 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Action-Oriented Resume Bullet Assistant
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Draft professional resume bullets strictly using facts you provide. The model will never invent degrees, metrics, or certifications.
              </p>
            </div>

            <form onSubmit={handleGenerateBullets} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  1. Action Verb (What did you do?)
                </label>
                <input
                  type="text"
                  value={resumeAction}
                  onChange={(e) => setResumeAction(e.target.value)}
                  placeholder="e.g. Developed, Architected, Refactored, Evaluated, Designed"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  2. Technical Context & Tools (On what project or system?)
                </label>
                <input
                  type="text"
                  value={resumeContext}
                  onChange={(e) => setResumeContext(e.target.value)}
                  placeholder="e.g. a full-stack real-time bus tracking web app using Next.js, PostgreSQL, and WebSockets"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  3. Outcome or Impact (Optional factual result)
                </label>
                <input
                  type="text"
                  value={resumeOutcome}
                  onChange={(e) => setResumeOutcome(e.target.value)}
                  placeholder="e.g. reducing query latency by 40% across 500 daily active student users"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="sm" isLoading={loadingResume}>
                  Draft High-Impact Bullets
                </Button>
              </div>
            </form>
          </Card>

          {/* Generated Bullets Output */}
          {draftBullets.length > 0 && (
            <Card className="p-5 border-indigo-200 bg-indigo-50/20 space-y-4">
              <div>
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  Drafted Bullets for Review
                </span>
                <p className="text-xs text-slate-600 mt-0.5">
                  Click the copy button on the bullet that best reflects your contribution:
                </p>
              </div>

              <div className="space-y-3">
                {draftBullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs leading-relaxed"
                  >
                    <span>• {bullet}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyBullet(bullet, idx)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-50 shrink-0"
                      title="Copy to clipboard"
                    >
                      {copiedIndex === idx ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {resumeNotice && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
                  <span className="font-semibold">Review Requirement: </span>
                  {resumeNotice}
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
