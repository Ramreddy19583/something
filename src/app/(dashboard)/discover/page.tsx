"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Sparkles,
  MapPin,
  Clock,
  Bookmark,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

function DiscoverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [naturalQuery, setNaturalQuery] = useState("");
  const [naturalParams, setNaturalParams] = useState<any>(null);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [education, setEducation] = useState(searchParams.get("education") || "");
  const [isRemote, setIsRemote] = useState(searchParams.get("isRemote") || "");
  const [isPaid, setIsPaid] = useState(searchParams.get("isPaid") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "relevance");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [naturalSearching, setNaturalSearching] = useState(false);

  useEffect(() => {
    fetchOpportunities();
  }, [category, education, isRemote, isPaid, sort, page]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (category) params.set("category", category);
      if (education) params.set("education", education);
      if (isRemote) params.set("isRemote", isRemote);
      if (isPaid) params.set("isPaid", isPaid);
      if (sort) params.set("sort", sort);
      params.set("page", page.toString());
      params.set("limit", "9");

      const res = await fetch(`/api/opportunities?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data.opportunities || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStandardSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOpportunities();
  };

  const handleNaturalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalQuery.trim()) return;

    setNaturalSearching(true);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/natural-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: naturalQuery }),
      });

      if (res.ok) {
        const data = await res.json();
        setNaturalParams(data.parsedParams);
        setOpportunities(data.opportunities || []);
        setTotal(data.count || 0);
        setTotalPages(1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setNaturalSearching(false);
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setQuery("");
    setNaturalQuery("");
    setNaturalParams(null);
    setCategory("");
    setEducation("");
    setIsRemote("");
    setIsPaid("");
    setSort("relevance");
    setPage(1);
    router.push("/discover");
  };

  const handleToggleSave = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setOpportunities((prev) =>
          prev.map((o) => (o.id === id ? { ...o, isSaved: data.isSaved } : o))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeFilterCount = [category, education, isRemote, isPaid, query].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Title & Natural Search Box */}
      <div className="space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Opportunity Discovery
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified academic programs, internships, scholarships, and hackathons with transparent matching.
          </p>
        </div>

        {/* AI Natural Language Query Box */}
        <form
          onSubmit={handleNaturalSearch}
          className="p-2 sm:p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row gap-2.5 items-center shadow-xs"
        >
          <div className="flex items-center gap-2 pl-2 flex-1 w-full">
            <Sparkles className="h-5 w-5 text-indigo-600 shrink-0" />
            <input
              type="text"
              value={naturalQuery}
              onChange={(e) => setNaturalQuery(e.target.value)}
              placeholder="Ask naturally: 'Find remote Python internships for 2nd year students in India'..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={naturalSearching}
            className="w-full sm:w-auto shrink-0 font-medium h-9 text-xs"
          >
            AI Search
          </Button>
        </form>

        {/* Extracted criteria feedback banner */}
        {naturalParams && (
          <div className="p-3 bg-white border border-indigo-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-indigo-700">AI Filters:</span>
              {naturalParams.category && (
                <Badge variant="info">{naturalParams.category}</Badge>
              )}
              {naturalParams.educationLevel && (
                <Badge variant="outline">{naturalParams.educationLevel}</Badge>
              )}
              {naturalParams.isRemote !== undefined && (
                <Badge variant="outline">{naturalParams.isRemote ? "Remote" : "Onsite"}</Badge>
              )}
              {naturalParams.skills && (
                <Badge variant="default">{naturalParams.skills}</Badge>
              )}
              {naturalParams.location && (
                <Badge variant="default">{naturalParams.location}</Badge>
              )}
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-slate-800 underline shrink-0 self-end sm:self-auto"
            >
              Clear
            </button>
          </div>
        )}

        {/* Mobile Filter Toggle Button (Visible only on < lg) */}
        <div className="lg:hidden flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-xs"
          >
            <Filter className="h-4 w-4 text-indigo-600" />
            <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount} active)` : ""}</span>
            {mobileFiltersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2 border border-slate-200 rounded-xl text-xs text-slate-500 hover:text-slate-800"
              title="Reset filters"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Filters Sidebar (Collapsible on mobile, permanent on desktop) */}
        <div className={`space-y-4 ${mobileFiltersOpen ? "block" : "hidden lg:block"}`}>
          <Card className="p-4 space-y-4 border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-indigo-600" />
                <span>Filter Criteria</span>
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Keyword</label>
              <form onSubmit={handleStandardSearch} className="flex gap-1.5">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Google, AICTE, ISRO..."
                  className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 focus:border-indigo-600 focus:outline-none"
                />
                <Button type="submit" variant="secondary" size="sm" className="px-2.5">
                  Go
                </Button>
              </form>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 focus:border-indigo-600 focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="INTERNSHIP">Internships & Fellowships</option>
                <option value="SCHOLARSHIP">Scholarships & Grants</option>
                <option value="HACKATHON">Hackathons & Contests</option>
                <option value="COMPETITION">Competitions & Quizzes</option>
                <option value="RESEARCH">Research Fellowships</option>
                <option value="TRAINING">Campus Training</option>
                <option value="APPRENTICESHIP">Apprenticeships</option>
              </select>
            </div>

            {/* Education Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Education Level
              </label>
              <select
                value={education}
                onChange={(e) => {
                  setEducation(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 focus:border-indigo-600 focus:outline-none"
              >
                <option value="">All Education Levels</option>
                <option value="UNDERGRADUATE">Undergraduate</option>
                <option value="POSTGRADUATE">Postgraduate</option>
                <option value="DIPLOMA">Diploma</option>
                <option value="RECENT_GRADUATE">Recent Graduate</option>
                <option value="SCHOOL">School Student</option>
              </select>
            </div>

            {/* Remote Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location Style
              </label>
              <select
                value={isRemote}
                onChange={(e) => {
                  setIsRemote(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 focus:border-indigo-600 focus:outline-none"
              >
                <option value="">Any Location</option>
                <option value="true">Remote / Virtual Only</option>
                <option value="false">Onsite / In-person Only</option>
              </select>
            </div>

            {/* Paid / Stipend */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Funding</label>
              <select
                value={isPaid}
                onChange={(e) => {
                  setIsPaid(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 focus:border-indigo-600 focus:outline-none"
              >
                <option value="">All Types</option>
                <option value="true">Paid / Stipend / Grants</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sort By</label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 focus:border-indigo-600 focus:outline-none"
              >
                <option value="relevance">Profile Alignment (Score)</option>
                <option value="deadline">Approaching Deadline</option>
                <option value="recent">Recently Added</option>
              </select>
            </div>
          </Card>
        </div>

        {/* Right Listings Column */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              Showing <span className="font-semibold text-slate-900">{opportunities.length}</span> of{" "}
              <span className="font-semibold text-slate-900">{total}</span> verified opportunities
            </span>
            <div className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 self-start sm:self-auto">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Verified Primary Sources</span>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400">Loading opportunities...</div>
          ) : opportunities.length === 0 ? (
            <Card className="text-center py-16">
              <Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No opportunities match criteria</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try widening your category or location filters. We do not synthesize fake listings when no real data matches.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="mt-4"
              >
                Clear all filters
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {opportunities.map((opp) => (
                <Card
                  key={opp.id}
                  hover
                  className="flex flex-col justify-between p-4 border-slate-200"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1.5 mb-2">
                      <Badge variant="outline">{opp.category}</Badge>
                      <button
                        type="button"
                        onClick={(e) => handleToggleSave(opp.id, e)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          opp.isSaved
                            ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                            : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                        }`}
                        aria-label="Save opportunity"
                      >
                        <Bookmark className="h-4 w-4" fill={opp.isSaved ? "currentColor" : "none"} />
                      </button>
                    </div>

                    <Link href={`/opportunity/${opp.slug || opp.id}`}>
                      <h3 className="font-semibold text-sm text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2">
                        {opp.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{opp.provider}</p>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {opp.description}
                    </p>

                    {/* Match Score Badge */}
                    {opp.matchScore !== null && (
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-medium text-slate-500">Alignment:</span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] border ${
                            opp.matchScore >= 70
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-indigo-50 text-indigo-700 border-indigo-200"
                          }`}
                        >
                          {opp.matchScore}% Match
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 truncate max-w-[140px]">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{opp.isRemote ? "Remote" : opp.location || "Onsite"}</span>
                      </span>
                      {opp.applicationDeadline && (
                        <span className="flex items-center gap-1 text-slate-600 font-medium shrink-0">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(opp.applicationDeadline).toLocaleDateString()}</span>
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/opportunity/${opp.slug || opp.id}`}
                      className="block text-center w-full"
                    >
                      <Button variant="outline" size="sm" className="w-full text-xs gap-1 py-1.5 h-8">
                        <span>View Details</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-4 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-xs text-slate-600 px-3">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading discovery...</div>}>
      <DiscoverContent />
    </Suspense>
  );
}
