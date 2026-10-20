"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Kanban,
  Calendar,
  Clock,
  Plus,
  Trash2,
  FileText,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Bell,
  ArrowRight,
  List,
  LayoutGrid,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const COLUMNS = [
  { id: "INTERESTED", title: "Interested", color: "bg-slate-100 text-slate-700" },
  { id: "PREPARING", title: "Preparing", color: "bg-amber-100 text-amber-800" },
  { id: "APPLIED", title: "Applied", color: "bg-blue-100 text-blue-800" },
  { id: "ASSESSMENT", title: "Assessment", color: "bg-purple-100 text-purple-800" },
  { id: "INTERVIEW", title: "Interview", color: "bg-indigo-100 text-indigo-800" },
  { id: "ACCEPTED", title: "Accepted 🎉", color: "bg-emerald-100 text-emerald-800" },
  { id: "REJECTED", title: "Not Selected", color: "bg-rose-100 text-rose-800" },
];

export default function ApplicationTrackerPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [editNotes, setEditNotes] = useState("");
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderMsg, setReminderMsg] = useState("");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");

  useEffect(() => {
    fetchApplications();
    // Auto-detect mobile screen width on mount
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setViewMode("list");
    }
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tracker");
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tracker/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    try {
      const res = await fetch(`/api/tracker/${selectedApp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editNotes }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === selectedApp.id ? { ...a, notes: editNotes } : a))
        );
        setSelectedApp(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !reminderTitle || !reminderDate) return;
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          title: reminderTitle,
          dueDate: new Date(reminderDate).toISOString(),
        }),
      });
      if (res.ok) {
        setReminderMsg("Reminder set successfully!");
        setReminderTitle("");
        setReminderDate("");
        fetchApplications();
        setTimeout(() => setReminderMsg(""), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (appId: string) => {
    if (!confirm("Are you sure you want to remove this opportunity from your tracker?")) return;
    try {
      const res = await fetch(`/api/tracker/${appId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.id !== appId));
        if (selectedApp?.id === appId) setSelectedApp(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Kanban className="h-6 w-6 text-indigo-600" />
            <span>Application Tracker</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize and track your submissions from initial research to interview and acceptance.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View toggle (Board vs List) */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("board")}
              className={`p-1.5 rounded-md flex items-center gap-1 transition-colors ${
                viewMode === "board" ? "bg-white text-indigo-700 font-bold shadow-xs" : "text-slate-600"
              }`}
              title="Board View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Board</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md flex items-center gap-1 transition-colors ${
                viewMode === "list" ? "bg-white text-indigo-700 font-bold shadow-xs" : "text-slate-600"
              }`}
              title="List View (Mobile Optimized)"
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">List</span>
            </button>
          </div>

          <Link href="/discover">
            <Button variant="outline" size="sm" className="gap-1 text-xs h-8">
              <span>+ Add</span>
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading tracker board...</div>
      ) : applications.length === 0 ? (
        <Card className="text-center py-16">
          <Kanban className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Your tracker is empty</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Discover opportunities and click &quot;Track Application&quot; to monitor your preparation milestones.
          </p>
          <Link href="/discover" className="inline-block mt-4">
            <Button variant="primary" size="sm">Browse Opportunities</Button>
          </Link>
        </Card>
      ) : viewMode === "board" ? (
        /* Kanban Columns Container (Horizontal Scroll for Desktop & Tablets) */
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {COLUMNS.map((col) => {
            const columnApps = applications.filter((a) => a.status === col.id);
            return (
              <div
                key={col.id}
                className="w-72 shrink-0 flex flex-col bg-slate-100/70 border border-slate-200 rounded-xl p-3 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${col.color}`}>
                    {col.title}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{columnApps.length}</span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1">
                  {columnApps.map((app) => (
                    <Card
                      key={app.id}
                      hover
                      className="p-3.5 bg-white border-slate-200 shadow-xs flex flex-col justify-between cursor-pointer"
                      onClick={() => {
                        setSelectedApp(app);
                        setEditNotes(app.notes || "");
                      }}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {app.opportunity?.category}
                          </Badge>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(app.id);
                            }}
                            className="text-slate-400 hover:text-rose-600 p-0.5"
                            title="Remove from tracker"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        <h4 className="font-bold text-xs text-slate-900 line-clamp-2">
                          {app.opportunity?.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {app.opportunity?.provider}
                        </p>

                        {app.notes && (
                          <div className="mt-2 p-1.5 rounded bg-slate-50 text-[11px] text-slate-600 line-clamp-2 italic">
                            &quot;{app.notes}&quot;
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                        {app.deadline && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Clock className="h-3 w-3 text-amber-600 shrink-0" />
                            <span className="truncate">Deadline: {new Date(app.deadline).toLocaleDateString()}</span>
                          </div>
                        )}

                        {/* Move column quick selector */}
                        <div
                          className="pt-1 flex items-center justify-between text-[11px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-slate-400 text-[10px]">Move:</span>
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className="text-[11px] rounded border border-slate-200 bg-white px-1.5 py-0.5 focus:border-indigo-600"
                          >
                            {COLUMNS.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Mobile-Optimized Vertical List View */
        <div className="space-y-4">
          {COLUMNS.map((col) => {
            const columnApps = applications.filter((a) => a.status === col.id);
            if (columnApps.length === 0) return null;

            return (
              <div key={col.id} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${col.color}`}>
                    {col.title}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{columnApps.length} item(s)</span>
                </div>

                <div className="space-y-2">
                  {columnApps.map((app) => (
                    <Card
                      key={app.id}
                      hover
                      className="p-3.5 bg-white border-slate-200 cursor-pointer flex flex-col justify-between"
                      onClick={() => {
                        setSelectedApp(app);
                        setEditNotes(app.notes || "");
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {app.opportunity?.category}
                            </Badge>
                            {app.deadline && (
                              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Clock className="h-3 w-3 text-amber-600" />
                                {new Date(app.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-xs text-slate-900 truncate">
                            {app.opportunity?.title}
                          </h4>
                          <p className="text-[11px] text-slate-500">{app.opportunity?.provider}</p>
                          {app.notes && (
                            <p className="mt-1 text-[11px] text-slate-600 italic line-clamp-1">
                              &quot;{app.notes}&quot;
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className="text-xs rounded border border-slate-200 bg-white px-2 py-1 focus:border-indigo-600"
                          >
                            {COLUMNS.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.title}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleDelete(app.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail / Note / Reminder Modal (Responsive max-w-lg with touch padding) */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="pr-4 min-w-0">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  Application Details
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 line-clamp-2">
                  {selectedApp.opportunity?.title}
                </h3>
                <p className="text-xs text-slate-500">{selectedApp.opportunity?.provider}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Note Editor */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Private Notes (Self-Reflection, Mentor Feedback)
              </label>
              <textarea
                rows={4}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add private preparation notes, submission confirmations, or next steps..."
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-indigo-600 focus:outline-none"
              />
              <div className="flex justify-end mt-2">
                <Button size="sm" variant="primary" onClick={handleSaveNotes}>
                  Save Notes
                </Button>
              </div>
            </div>

            {/* Add Reminder Section */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                <Bell className="h-3.5 w-3.5 text-indigo-600" />
                <span>Set Deadline Reminder</span>
              </h4>

              {reminderMsg && (
                <div className="mb-2 p-2 rounded bg-emerald-50 text-emerald-700 text-xs">
                  {reminderMsg}
                </div>
              )}

              <form onSubmit={handleCreateReminder} className="space-y-2">
                <input
                  type="text"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  placeholder="e.g. Email professor for letter of recommendation"
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-1.5 focus:border-indigo-600 focus:outline-none"
                />

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    required
                    className="flex-1 text-xs rounded-lg border border-slate-300 px-3 py-1.5 focus:border-indigo-600 focus:outline-none"
                  />
                  <Button type="submit" size="sm" variant="secondary" className="w-full sm:w-auto">
                    Add Reminder
                  </Button>
                </div>
              </form>
            </div>

            {/* Quick Links */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
              <Link
                href={`/opportunity/${selectedApp.opportunity?.slug || selectedApp.opportunity?.id}`}
                className="text-indigo-600 hover:underline flex items-center gap-1"
              >
                <span>View Full Opportunity Page</span>
                <ArrowRight className="h-3 w-3" />
              </Link>

              <a
                href={selectedApp.opportunity?.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-indigo-600 flex items-center gap-1"
              >
                <span>Open Official Source</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
