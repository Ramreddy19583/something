"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, Calendar, MapPin, Trash2, ExternalLink, ArrowRight, Compass } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function SavedOpportunitiesPage() {
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [sortByDeadline, setSortByDeadline] = useState(false);

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/saved");
      if (res.ok) {
        const data = await res.json();
        setSavedItems(data.saved || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (opportunityId: string) => {
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId }),
      });
      if (res.ok) {
        setSavedItems((prev) => prev.filter((item) => item.opportunityId !== opportunityId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  let displayed = [...savedItems];
  if (filterCategory) {
    displayed = displayed.filter((item) => item.opportunity?.category === filterCategory);
  }
  if (sortByDeadline) {
    displayed.sort((a, b) => {
      const d1 = a.opportunity?.applicationDeadline ? new Date(a.opportunity.applicationDeadline).getTime() : Infinity;
      const d2 = b.opportunity?.applicationDeadline ? new Date(b.opportunity.applicationDeadline).getTime() : Infinity;
      return d1 - d2;
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Bookmark className="h-6 w-6 text-indigo-600" />
            <span>Saved Opportunities</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage opportunities you have earmarked for upcoming application cycles.
          </p>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex items-center gap-2.5">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 focus:border-indigo-600 focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="INTERNSHIP">Internships</option>
            <option value="SCHOLARSHIP">Scholarships</option>
            <option value="HACKATHON">Hackathons</option>
            <option value="RESEARCH">Research</option>
            <option value="TRAINING">Training</option>
          </select>

          <Button
            variant={sortByDeadline ? "primary" : "outline"}
            size="sm"
            onClick={() => setSortByDeadline(!sortByDeadline)}
            className="text-xs"
          >
            Sort by Deadline
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading saved listings...</div>
      ) : displayed.length === 0 ? (
        <Card className="text-center py-16">
          <Bookmark className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No saved opportunities</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Browse verified listings and click the bookmark icon to save them for easy access.
          </p>
          <Link href="/discover" className="inline-block mt-4">
            <Button variant="primary" size="sm" className="gap-1.5">
              <Compass className="h-4 w-4" />
              <span>Explore Opportunities</span>
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map(({ opportunity }) => (
            <Card key={opportunity.id} hover className="flex flex-col justify-between p-4">
              <div>
                <div className="flex items-start justify-between gap-1.5 mb-2">
                  <Badge variant="outline">{opportunity.category}</Badge>
                  <button
                    type="button"
                    onClick={() => handleRemove(opportunity.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <Link href={`/opportunity/${opportunity.slug || opportunity.id}`}>
                  <h3 className="font-semibold text-sm text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2">
                    {opportunity.title}
                  </h3>
                </Link>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{opportunity.provider}</p>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {opportunity.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{opportunity.isRemote ? "Remote" : opportunity.location || "Onsite"}</span>
                  </span>
                  {opportunity.applicationDeadline && (
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(opportunity.applicationDeadline).toLocaleDateString()}</span>
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/opportunity/${opportunity.slug || opportunity.id}`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      View Details
                    </Button>
                  </Link>

                  <a
                    href={opportunity.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                    title="Open official site"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
