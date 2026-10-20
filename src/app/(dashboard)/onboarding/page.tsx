"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Check, ArrowRight, BookOpen, GraduationCap, Laptop, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function OnboardingPage() {
  const router = useRouter();
  const [educationLevel, setEducationLevel] = useState("UNDERGRADUATE");
  const [degree, setDegree] = useState("B.Tech");
  const [fieldOfStudy, setFieldOfStudy] = useState("Computer Science & Engineering");
  const [currentYear, setCurrentYear] = useState("3");
  const [country, setCountry] = useState("India");
  const [stateOrCity, setStateOrCity] = useState("Bengaluru");
  const [remotePreference, setRemotePreference] = useState("HYBRID_OR_ANY");
  const [preferredCategories, setPreferredCategories] = useState<string[]>([
    "INTERNSHIP",
    "SCHOLARSHIP",
    "HACKATHON",
  ]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "Python",
    "React",
    "Git",
  ]);
  const [skillInput, setSkillInput] = useState("");
  const [careerGoalInput, setCareerGoalInput] = useState("");
  const [careerGoals, setCareerGoals] = useState<string[]>([
    "Software Development Engineer",
    "AI / ML Engineer",
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const availableCategories = [
    { id: "INTERNSHIP", label: "Internships" },
    { id: "SCHOLARSHIP", label: "Scholarships" },
    { id: "HACKATHON", label: "Hackathons" },
    { id: "COMPETITION", label: "Competitions" },
    { id: "RESEARCH", label: "Research Fellowships" },
    { id: "APPRENTICESHIP", label: "Apprenticeships" },
    { id: "TRAINING", label: "Campus Training" },
  ];

  const suggestedSkills = [
    "Python",
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "SQL",
    "Data Structures",
    "Machine Learning",
    "Git",
    "Cloud Computing",
  ];

  const toggleCategory = (catId: string) => {
    if (preferredCategories.includes(catId)) {
      setPreferredCategories(preferredCategories.filter((c) => c !== catId));
    } else {
      setPreferredCategories([...preferredCategories, catId]);
    }
  };

  const addSkill = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (name: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== name));
  };

  const addGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (careerGoalInput.trim() && !careerGoals.includes(careerGoalInput.trim())) {
      setCareerGoals([...careerGoals, careerGoalInput.trim()]);
      setCareerGoalInput("");
    }
  };

  const removeGoal = (g: string) => {
    setCareerGoals(careerGoals.filter((x) => x !== g));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          educationLevel,
          degree,
          fieldOfStudy,
          currentYear: parseInt(currentYear, 10) || 1,
          country,
          stateOrCity,
          remotePreference,
          preferredCategories,
          careerGoals,
          skills: selectedSkills.map((s) => ({ name: s, proficiency: "INTERMEDIATE" })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save profile.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Network error while saving profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <Badge variant="info" className="mb-2">Setup Profile</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Let&apos;s Personalize Your Opportunity Recommendations
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Provide your academic standing and skill focus. We use this strictly to calculate hard eligibility and explainable match scores.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
            {error}
          </div>
        )}

        <Card className="space-y-6">
          {/* Academic Details */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <GraduationCap className="h-4 w-4 text-indigo-600" />
              <span>1. Academic Background</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Education Level
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                >
                  <option value="UNDERGRADUATE">Undergraduate (B.Tech / B.Sc / B.E)</option>
                  <option value="POSTGRADUATE">Postgraduate (M.Tech / M.Sc / Ph.D)</option>
                  <option value="DIPLOMA">Polytechnic / Diploma</option>
                  <option value="RECENT_GRADUATE">Recent Graduate (Alumni)</option>
                  <option value="SCHOOL">Senior Secondary (11th / 12th)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Current Year of Study
                </label>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(e.target.value)}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year (Pre-final)</option>
                  <option value="4">4th Year (Final Year)</option>
                  <option value="5">Completed / Graduate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Degree / Program
                </label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. B.Tech, B.Sc, BCA"
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Branch / Field of Study
                </label>
                <input
                  type="text"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  placeholder="e.g. Computer Science, Mechanical"
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Location & Remote Preference */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-indigo-600" />
              <span>2. Location & Work Style</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Current City / State
                </label>
                <input
                  type="text"
                  value={stateOrCity}
                  onChange={(e) => setStateOrCity(e.target.value)}
                  placeholder="e.g. Bengaluru, Hyderabad, Delhi"
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Work Preference
                </label>
                <select
                  value={remotePreference}
                  onChange={(e) => setRemotePreference(e.target.value)}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                >
                  <option value="HYBRID_OR_ANY">Any / Hybrid (Flexible)</option>
                  <option value="REMOTE_ONLY">Remote Only (Virtual)</option>
                  <option value="ONSITE_ONLY">Onsite Only (In-person)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Opportunity Categories */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              <span>3. Target Opportunity Types</span>
            </h3>
            <p className="text-xs text-slate-500 mb-3">Select the categories you want prioritized on your feed.</p>

            <div className="flex flex-wrap gap-2">
              {availableCategories.map((c) => {
                const selected = preferredCategories.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCategory(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border ${
                      selected
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {selected && <Check className="h-3.5 w-3.5" />}
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skills */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Laptop className="h-4 w-4 text-indigo-600" />
              <span>4. Technical & Practical Skills</span>
            </h3>
            <p className="text-xs text-slate-500 mb-3">These are matched against listing requirements to compute skill alignment.</p>

            {/* Selected Skills */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {selectedSkills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSkill(s)}
                    className="text-slate-400 hover:text-rose-600 text-xs font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Add Custom Skill */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(skillInput);
                  }
                }}
                placeholder="Type a skill and press Enter (e.g. Docker, C++, UI/UX)..."
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addSkill(skillInput)}
              >
                Add
              </Button>
            </div>

            {/* Suggested Skills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="text-[11px] font-semibold text-slate-600">Quick Add:</span>
              {suggestedSkills.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSkill(s)}
                  className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-[11px]"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {/* Career Goals */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>5. Career Aspirations</span>
            </h3>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {careerGoals.map((g) => (
                <span
                  key={g}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-200"
                >
                  {g}
                  <button
                    type="button"
                    onClick={() => removeGoal(g)}
                    className="text-indigo-400 hover:text-rose-600 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <form onSubmit={addGoal} className="flex gap-2">
              <input
                type="text"
                value={careerGoalInput}
                onChange={(e) => setCareerGoalInput(e.target.value)}
                placeholder="Add career goal (e.g. Research Scientist, Full Stack Dev)..."
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
              <Button type="submit" variant="outline" size="sm">
                Add Goal
              </Button>
            </form>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Skip and finish later
            </button>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleSaveProfile}
              isLoading={loading}
              className="gap-2"
            >
              <span>Save & Launch Feed</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
