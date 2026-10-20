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
  Calendar,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AuthModal } from "@/components/auth/AuthModal";

function getDeadlineUrgency(deadlineString: string | null) {
  if (!deadlineString) {
    return {
      status: "ACTIVE",
      label: "Open / Ongoing",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dotClass: "bg-emerald-500",
    };
  }

  const now = new Date();
  const deadline = new Date(deadlineString);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: "EXPIRED",
      label: "Expired",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      dotClass: "bg-rose-500",
    };
  }

  if (diffDays <= 7) {
    const text =
      diffDays === 0
        ? "Closes Today"
        : diffDays === 1
        ? "1 Day Left"
        : `${diffDays} Days Left`;
    return {
      status: "CLOSING_SOON",
      label: text,
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200 font-semibold",
      dotClass: "bg-amber-500 animate-pulse",
    };
  }

  return {
    status: "ACTIVE",
    label: `Active • ${diffDays}d left`,
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
  };
}

function DiscoverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTitle, setAuthModalTitle] = useState("");
  const [authModalDesc, setAuthModalDesc] = useState("");

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [naturalQuery, setNaturalQuery] = useState("");
  const [naturalParams, setNaturalParams] = useState<any>(null);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [education, setEducation] = useState(searchParams.get("education") || "");
  const [workMode, setWorkMode] = useState(searchParams.get("workMode") || searchParams.get("isRemote") ? (searchParams.get("isRemote") === "true" ? "REMOTE" : searchParams.get("isRemote") === "false" ? "ONSITE" : "") : "");
  const [batch, setBatch] = useState(searchParams.get("batch") || "");
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
    // Check current user session for auth gating
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch(() => setCurrentUser(null));
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [category, education, workMode, batch, isPaid, sort, page]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (category) params.set("category", category);
      if (education) params.set("education", education);
      if (workMode) params.set("workMode", workMode);
      if (batch) params.set("batch", batch);
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
    setWorkMode("");
    setBatch("");
    setIsPaid("");
    setSort("relevance");
    setPage(1);
    router.push("/discover");
  };

  const handleToggleSave = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      setAuthModalTitle("Sign In to Save Opportunities");
      setAuthModalDesc("Opportunity AI lets you save verified listings so you can easily track deadlines and organize your applications.");
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: id }),
      });
      if (res.status === 401) {
        setAuthModalTitle("Sign In to Save Opportunities");
        setAuthModalDesc("Opportunity AI lets you save verified listings so you can easily track deadlines and organize your applications.");
        setAuthModalOpen(true);
        return;
      }
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

  const handleMatchScoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      setAuthModalTitle("Personalized AI Profile Fit");
      setAuthModalDesc("Create a free student profile or log in to calculate deterministic match scores based on your major, skills, and graduation batch.");
      setAuthModalOpen(true);
    }
  };

  const activeFilterCount = [category, education, workMode, batch, isPaid, query].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title={authModalTitle}
        description={authModalDesc}
        callbackUrl="/discover"
      />

      {/* Title & Natural Search Box */}
      <div className="space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Opportunity Discovery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Verified academic programs, internships, scholarships, and hackathons with transparent, explainable matching.
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
              placeholder="Ask naturally: 'Find remote Python internships for 2026 batch students in India'..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              aria-label="Natural language search input"
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
          <div className="p-3 bg-white border border-indigo-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-indigo-700">AI Filters Applied:</span>
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
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-slate-800 underline shrink-0 self-end sm:self-auto"
            >
              Clear
            </button>
          </div>
        )}

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-xs min-h-[44px]"
            aria-expanded={mobileFiltersOpen}
          >
            <Filter className="h-4 w-4 text-indigo-600" />
            <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount} active)` : ""}</span>
            {mobileFiltersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2.5 border border-slate-200 rounded-xl text-xs text-slate-500 hover:text-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Reset all filters"
              aria-label="Reset all filters"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Filters Sidebar */}
        <div className={`space-y-4 ${mobileFiltersOpen ? "block" : "hidden lg:block"}`}>
          <Card className="p-4 space-y-4 border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-indigo-600" />
                <span>Multi-Filter Controls</span>
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-medium"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset All</span>
              </button>
            </div>

            {/* Keyword Search (Title, Company, Skills) */}
            <div>
              <label htmlFor="filter-keyword" className="block text-xs font-semibold text-slate-700 mb-1">
                Keyword (Title, Company, Skills)
              </label>
              <form onSubmit={handleStandardSearch} className="flex gap-1.5">
                <input
                  id="filter-keyword"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Python, Google, ISRO, React..."
                  className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 focus:border-indigo-600 focus:outline-none"
                />
                <Button type="submit" variant="secondary" size="sm" className="px-2.5 text-xs font-medium">
                  Go
                </Button>
              </form>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="filter-category" className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                id="filter-category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-2 focus:border-indigo-600 focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="INTERNSHIP">Internships & Fellowships</option>
                <option value="SCHOLARSHIP">Scholarships & Grants</option>
                <option value="HACKATHON">Hackathons & Contests</option>
                <option value="COMPETITION">Competitions & Challenges</option>
                <option value="RESEARCH">Research Programmes</option>
                <option value="APPRENTICESHIP">Apprenticeships</option>
                <option value="TRAINING">Training & Ambassador</option>
              </select>
            </div>

            {/* Location / Work Mode */}
            <div>
              <label htmlFor="filter-workmode" className="block text-xs font-semibold text-slate-700 mb-1">
                Location / Work Mode
              </label>
              <select
                id="filter-workmode"
                value={workMode}
                onChange={(e) => {
                  setWorkMode(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-2 focus:border-indigo-600 focus:outline-none"
              >
                <option value="">All Work Modes</option>
                <option value="REMOTE">Remote / Virtual Only</option>
                <option value="ONSITE">On-site / In-person Only</option>
                <option value="HYBRID">Hybrid / Flexible</option>
              </select>
            </div>

            {/* Batch / Graduation Year */}
            <div>
              <label htmlFor="filter-batch" className="block text-xs font-semibold text-slate-700 mb-1">
                Batch / Graduation Year
              </label>
              <select
                id="filter-batch"
                value={batch}
                onChange={(e) => {
                  setBatch(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-2 focus:border-indigo-600 focus:outline-none"
              >
                <option value="">All Graduation Batches</option>
                <option value="2024">2024 Batch / Recent Grad</option>
                <option value="2025">2025 Batch / Final Year</option>
                <option value="2026">2026 Batch / Pre-Final Year</option>
                <option value="2027">2027 Batch / 2nd Year</option>
                <option value="2028">2028+ Batch / 1st Year</option>
              </select>
            </div>

            {/* Education Level */}
            <div>
              <label htmlFor="filter-education" className="block text-xs font-semibold text-slate-700 mb-1">
                Education Level
              </label>
              <select
                id="filter-education"
                value={education}
                onChange={(e) => {
                  setEducation(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-2 focus:border-indigo-600 focus:outline-none"
              >
                <option value="">All Education Levels</option>
                <option value="UNDERGRADUATE">Undergraduate (B.Tech / B.E / B.Sc)</option>
                <option value="POSTGRADUATE">Postgraduate (M.Tech / M.Sc / Ph.D)</option>
                <option value="DIPLOMA">Diploma</option>
                <option value="RECENT_GRADUATE">Recent Graduate</option>
                <option value="SCHOOL">School Student</option>
              </select>
            </div>

            {/* Paid / Stipend Filter */}
            <div>
              <label htmlFor="filter-paid" className="block text-xs font-semibold text-slate-700 mb-1">
                Compensation & Funding
              </label>
              <select
                id="filter-paid"
                value={isPaid}
                onChange={(e) => {
                  setIsPaid(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-2 focus:border-indigo-600 focus:outline-none"
              >
                <option value="">All Funding Types</option>
                <option value="true">Paid / Stipend / Grants Only</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label htmlFor="filter-sort" className="block text-xs font-semibold text-slate-700 mb-1">
                Sort Order
              </label>
              <select
                id="filter-sort"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-2 focus:border-indigo-600 focus:outline-none"
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
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 self-start sm:self-auto">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>100% Authoritative Sourced</span>
            </div>
          </div>

          {loading ? (
            <div className="py-24 text-center text-xs text-slate-400">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent mb-2" />
              <p>Loading verified opportunities...</p>
            </div>
          ) : opportunities.length === 0 ? (
            <Card className="text-center py-16 px-4">
              <Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h2 className="text-base font-bold text-slate-800">No opportunities found</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                No verified listings match your selected keyword, category, or batch criteria. We never synthesize fake listings.
              </p>
              <div className="mt-5">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleResetFilters}
                  className="gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset All Filters</span>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {opportunities.map((opp) => {
                const urgency = getDeadlineUrgency(opp.applicationDeadline);
                return (
                  <Card
                    key={opp.id}
                    hover
                    className="flex flex-col justify-between p-4 border-slate-200 transition-all hover:border-indigo-200 hover:shadow-md"
                  >
                    <div>
                      {/* Top Bar: Category + Urgency Badge + Bookmark */}
                      <div className="flex items-start justify-between gap-1.5 mb-2.5">
                        <Badge variant="outline" className="text-[10px] font-semibold uppercase">
                          {opp.category}
                        </Badge>

                        <div className="flex items-center gap-1.5">
                          {/* Deadline Urgency Badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${urgency.badgeClass}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${urgency.dotClass}`} />
                            <span>{urgency.label}</span>
                          </span>

                          {/* Save Bookmark Button */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleSave(opp.id, e)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              opp.isSaved
                                ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                                : "bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            }`}
                            aria-label={opp.isSaved ? "Remove from saved opportunities" : "Save opportunity"}
                          >
                            <Bookmark className="h-4 w-4" fill={opp.isSaved ? "currentColor" : "none"} />
                          </button>
                        </div>
                      </div>

                      {/* Title & Provider */}
                      <Link href={`/opportunity/${opp.slug || opp.id}`}>
                        <h3 className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                          {opp.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-indigo-700 font-semibold mt-1">{opp.provider}</p>

                      {/* Description */}
                      <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                        {opp.description}
                      </p>

                      {/* Direct Link Badge: Verified Official Source */}
                      <div className="mt-3">
                        <a
                          href={opp.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition-colors"
                          title={`Visit official ${opp.provider} portal`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ShieldCheck className="h-3 w-3 text-emerald-600" />
                          <span>Verified Official Source</span>
                          <ExternalLink className="h-2.5 w-2.5 ml-0.5 text-emerald-600" />
                        </a>
                      </div>

                      {/* Match Score Badge / Guest prompt */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-medium text-slate-500">Alignment:</span>
                        {opp.matchScore !== null ? (
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[11px] border ${
                              opp.matchScore >= 70
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-indigo-50 text-indigo-700 border-indigo-200"
                            }`}
                          >
                            {opp.matchScore}% Match
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleMatchScoreClick}
                            className="text-[10px] font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-200 hover:bg-indigo-100 transition-colors"
                          >
                            Sign In for Match %
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 truncate max-w-[130px]">
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
                        <Button variant="outline" size="sm" className="w-full text-xs gap-1 py-1.5 h-8 font-medium">
                          <span>View Details & Interview Prep</span>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
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
                aria-label="Previous page"
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
                aria-label="Next page"
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
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading discovery...</div>}>
      <DiscoverContent />
    </Suspense>
  );
}
