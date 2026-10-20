"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Settings,
  ShieldCheck,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Lock,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Profile editable fields
  const [degree, setDegree] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [currentYear, setCurrentYear] = useState(1);
  const [stateOrCity, setStateOrCity] = useState("");
  const [remotePreference, setRemotePreference] = useState("HYBRID_OR_ANY");
  const [bio, setBio] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user?.profile) {
          setDegree(data.user.profile.degree || "");
          setFieldOfStudy(data.user.profile.fieldOfStudy || "");
          setCurrentYear(data.user.profile.currentYear || 1);
          setStateOrCity(data.user.profile.stateOrCity || "");
          setRemotePreference(data.user.profile.remotePreference || "HYBRID_OR_ANY");
          setBio(data.user.profile.bio || "");
        }
      }
    } catch {
      setErrorMsg("Failed to load user profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setStatusMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          educationLevel: user.profile?.educationLevel || "UNDERGRADUATE",
          degree,
          fieldOfStudy,
          currentYear,
          country: "India",
          stateOrCity,
          remotePreference,
          bio,
          skills: user.profile?.skills?.map((s: any) => ({
            name: s.skill.name,
            proficiency: s.proficiency,
          })) || [],
        }),
      });

      if (res.ok) {
        setStatusMsg("Profile updated successfully!");
        setTimeout(() => setStatusMsg(""), 3000);
      } else {
        const d = await res.json();
        setErrorMsg(d.error || "Failed to update profile.");
      }
    } catch {
      setErrorMsg("Network error.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export" }),
      });
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data.exportData, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `opportunity-ai-student-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt(
      "Type 'DELETE' to confirm permanent deletion of your account and all associated applications, saved items, and notes."
    );
    if (confirmation !== "DELETE") return;

    setDeleteLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (e) {
      console.error(e);
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-indigo-600" />
          <span>Profile & Privacy Settings</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your academic information, privacy controls, and data export.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Account Info */}
      <Card className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User className="h-4 w-4 text-indigo-600" />
          <span>Account Credentials</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-semibold text-slate-500">Registered Name:</span>
            <p className="font-bold text-slate-900 mt-0.5">{user?.name}</p>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Email Address:</span>
            <p className="font-bold text-slate-900 mt-0.5">{user?.email}</p>
          </div>
        </div>
      </Card>

      {/* Academic Information */}
      <Card className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileText className="h-4 w-4 text-indigo-600" />
          <span>Academic & Discovery Profile</span>
        </h3>

        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Degree Program</label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. B.Tech"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Field of Study / Branch</label>
              <input
                type="text"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Study Year</label>
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year (Pre-final)</option>
                <option value={4}>4th Year (Final)</option>
                <option value={5}>Graduated</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">City / Region</label>
              <input
                type="text"
                value={stateOrCity}
                onChange={(e) => setStateOrCity(e.target.value)}
                placeholder="e.g. Bengaluru, Karnataka"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Work Style</label>
              <select
                value={remotePreference}
                onChange={(e) => setRemotePreference(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              >
                <option value="HYBRID_OR_ANY">Flexible / Any</option>
                <option value="REMOTE_ONLY">Remote Only</option>
                <option value="ONSITE_ONLY">Onsite Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bio / Goals Summary</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short description of your research or engineering interests..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="sm" isLoading={saveLoading}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Privacy, Data Export & Deletion */}
      <Card className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Data Privacy, Rights & Export</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-600">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl gap-2">
            <div>
              <h4 className="font-bold text-slate-900">GDPR & DPDP Data Export</h4>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Download a complete JSON export of your profile, saved listings, and application notes.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              isLoading={exportLoading}
              className="gap-1.5 shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export My Data</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl gap-2">
            <div>
              <h4 className="font-bold text-rose-900">Permanent Account Deletion</h4>
              <p className="text-rose-700 text-[11px] mt-0.5">
                Permanently purge your account and remove all private records from PostgreSQL.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteAccount}
              isLoading={deleteLoading}
              className="gap-1.5 shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Account</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
