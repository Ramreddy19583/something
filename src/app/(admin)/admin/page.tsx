"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  History,
  FileCheck,
  Trash2,
  RefreshCw,
  Eye,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function AdminDashboardPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"listings" | "create" | "audit">("listings");
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Create Opportunity Form State
  const [newTitle, setNewTitle] = useState("");
  const [newProvider, setNewProvider] = useState("");
  const [newCategory, setNewCategory] = useState("INTERNSHIP");
  const [newDescription, setNewDescription] = useState("");
  const [newEligibility, setNewEligibility] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newCompensationType, setNewCompensationType] = useState("STIPEND");
  const [newCompensationDetails, setNewCompensationDetails] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newIsRemote, setNewIsRemote] = useState(false);
  const [newSkills, setNewSkills] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, [statusFilter]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const url = statusFilter
        ? `/api/admin/opportunities?status=${statusFilter}`
        : `/api/admin/opportunities`;

      const [oppRes, auditRes] = await Promise.all([
        fetch(url),
        fetch("/api/admin/audit-logs"),
      ]);

      if (oppRes.status === 403 || auditRes.status === 403) {
        setErrorMsg("Access Denied: You do not possess Administrator credentials.");
        return;
      }

      if (oppRes.ok) {
        const oppData = await oppRes.json();
        setOpportunities(oppData.opportunities || []);
      }
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditLogs(auditData.auditLogs || []);
      }
    } catch {
      setErrorMsg("Failed to connect to administrative endpoints.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    opportunityId: string,
    newStatus: string,
    notes?: string
  ) => {
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId,
          status: newStatus,
          notes: notes || `Admin changed status to ${newStatus}`,
        }),
      });

      if (res.ok) {
        setActionMsg(`Listing status transitioned to ${newStatus}`);
        fetchAdminData();
        setTimeout(() => setActionMsg(""), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setErrorMsg("");
    setActionMsg("");

    try {
      const skillsArray = newSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ name, isMandatory: false }));

      const res = await fetch("/api/admin/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          provider: newProvider,
          category: newCategory,
          description: newDescription,
          eligibilityRequirements: newEligibility,
          sourceUrl: newSourceUrl,
          location: newLocation || null,
          compensationType: newCompensationType,
          compensationDetails: newCompensationDetails || null,
          applicationDeadline: newDeadline ? new Date(newDeadline).toISOString() : null,
          isRemote: newIsRemote,
          verificationStatus: "VERIFIED",
          skills: skillsArray,
        }),
      });

      if (res.ok) {
        setActionMsg("New verified opportunity ingested successfully!");
        setNewTitle("");
        setNewProvider("");
        setNewDescription("");
        setNewEligibility("");
        setNewSourceUrl("");
        setNewDeadline("");
        setNewSkills("");
        setActiveTab("listings");
        fetchAdminData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to create opportunity.");
      }
    } catch {
      setErrorMsg("Network error.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-indigo-600" />
            <span>Administrator Control Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Authoritative source verification, ingestion pipeline management, duplicate resolution, and audit logs.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("listings")}
            className={`px-3 py-1.5 rounded-md ${
              activeTab === "listings" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
            }`}
          >
            Review Listings ({opportunities.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={`px-3 py-1.5 rounded-md ${
              activeTab === "create" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
            }`}
          >
            + Ingest Opportunity
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`px-3 py-1.5 rounded-md ${
              activeTab === "audit" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
            }`}
          >
            Audit Trail ({auditLogs.length})
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{actionMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {activeTab === "listings" && (
        <div className="space-y-4">
          {/* Status filter bar */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs focus:border-indigo-600"
              >
                <option value="">All Statuses</option>
                <option value="VERIFIED">Verified</option>
                <option value="NEEDS_REVIEW">Needs Review</option>
                <option value="EXPIRED">Expired</option>
                <option value="WITHDRAWN">Withdrawn</option>
                <option value="SUSPICIOUS">Suspicious</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchAdminData}
              className="gap-1 text-xs"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Refresh</span>
            </Button>
          </div>

          {/* Opportunities Table */}
          <Card className="p-0 overflow-hidden border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Opportunity</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Verification Status</th>
                    <th className="px-4 py-3">Deadline</th>
                    <th className="px-4 py-3">Source URL</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {opportunities.map((opp) => (
                    <tr key={opp.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/opportunity/${opp.slug || opp.id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600"
                        >
                          {opp.title}
                        </Link>
                        <p className="text-[11px] text-slate-500">{opp.provider}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{opp.category}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            opp.verificationStatus === "VERIFIED"
                              ? "success"
                              : opp.verificationStatus === "EXPIRED"
                              ? "warning"
                              : opp.verificationStatus === "SUSPICIOUS"
                              ? "danger"
                              : "default"
                          }
                        >
                          {opp.verificationStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {opp.applicationDeadline
                          ? new Date(opp.applicationDeadline).toLocaleDateString()
                          : "None specified"}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={opp.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:underline max-w-[150px] truncate"
                        >
                          <span>{opp.sourceUrl}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {opp.verificationStatus !== "VERIFIED" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(opp.id, "VERIFIED")}
                              className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold hover:bg-emerald-100"
                            >
                              Verify
                            </button>
                          )}
                          {opp.verificationStatus !== "EXPIRED" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(opp.id, "EXPIRED")}
                              className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold hover:bg-amber-100"
                            >
                              Expire
                            </button>
                          )}
                          {opp.verificationStatus !== "SUSPICIOUS" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(opp.id, "SUSPICIOUS")}
                              className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold hover:bg-rose-100"
                            >
                              Flag
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "create" && (
        <Card className="p-6 max-w-3xl space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Ingest Verified Student Opportunity
          </h2>
          <p className="text-xs text-slate-500">
            Enforces canonical URL deduplication and generates an authoritative audit log entry.
          </p>

          <form onSubmit={handleCreateOpportunity} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Adobe India Women in Technology Scholarship"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Provider / Host *</label>
                <input
                  type="text"
                  value={newProvider}
                  onChange={(e) => setNewProvider(e.target.value)}
                  placeholder="e.g. Adobe Systems India"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-indigo-600"
                >
                  <option value="INTERNSHIP">Internship</option>
                  <option value="SCHOLARSHIP">Scholarship</option>
                  <option value="HACKATHON">Hackathon</option>
                  <option value="COMPETITION">Competition</option>
                  <option value="RESEARCH">Research</option>
                  <option value="TRAINING">Training</option>
                  <option value="APPRENTICESHIP">Apprenticeship</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Authoritative Source URL *</label>
                <input
                  type="url"
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  placeholder="https://..."
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Program Overview Description *</label>
              <textarea
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Detailed overview of program objectives, mentorship, and timeline..."
                required
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Published Eligibility *</label>
              <textarea
                rows={3}
                value={newEligibility}
                onChange={(e) => setNewEligibility(e.target.value)}
                placeholder="Explicit education level, branch, year of study, and minimum marks required..."
                required
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Compensation Type</label>
                <select
                  value={newCompensationType}
                  onChange={(e) => setNewCompensationType(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-indigo-600"
                >
                  <option value="STIPEND">Stipend</option>
                  <option value="FUNDING">Funding / Grant</option>
                  <option value="PRIZE">Prize Money</option>
                  <option value="PAID">Paid</option>
                  <option value="UNPAID">Unpaid</option>
                  <option value="NOT_APPLICABLE">Not Applicable</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Compensation Details</label>
                <input
                  type="text"
                  value={newCompensationDetails}
                  onChange={(e) => setNewCompensationDetails(e.target.value)}
                  placeholder="e.g. ₹1,00,000 / $1,500"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Application Deadline</label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Skills (comma-separated)</label>
              <input
                type="text"
                value={newSkills}
                onChange={(e) => setNewSkills(e.target.value)}
                placeholder="e.g. Python, Git, Docker, Machine Learning"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" size="md" isLoading={creating}>
                Ingest & Verify Listing
              </Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === "audit" && (
        <Card className="p-0 overflow-hidden border-slate-200">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <History className="h-4 w-4 text-indigo-600" />
              <span>Administrative Audit Event Log</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Immutable ledger of opportunity creations, status transitions, and data ingestions.
            </p>
          </div>

          <div className="divide-y divide-slate-200 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">{log.details}</p>
                  <span className="text-[10px] text-slate-400">
                    By: {log.user?.name || "System"} ({log.user?.email || "internal"})
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
