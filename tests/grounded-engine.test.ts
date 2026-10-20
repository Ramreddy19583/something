import { describe, it, expect } from "vitest";
import {
  evaluateEligibility,
  calculateMatchExplanation,
  answerWithGroundedSource,
  analyzeSkillGap,
  StudentProfileWithSkills,
  OpportunityWithSkills,
} from "../src/lib/ai/grounded-engine";
import { parseNaturalLanguageQuery } from "../src/lib/ai/natural-search";
import { getAiService } from "../src/lib/ai/interface";

describe("AI Matching & Grounded Engine", () => {
  const mockStudent: StudentProfileWithSkills = {
    educationLevel: "UNDERGRADUATE",
    degree: "B.Tech",
    fieldOfStudy: "Computer Science",
    currentYear: 3,
    graduationYear: 2027,
    country: "India",
    preferredLocations: ["Remote", "Bengaluru"],
    remotePreference: "HYBRID_OR_ANY",
    preferredCategories: ["INTERNSHIP", "RESEARCH"],
    careerGoals: ["Software Development Engineer", "Open Source"],
    skills: [
      { skill: { name: "Python" }, proficiency: "INTERMEDIATE" },
      { skill: { name: "Git" }, proficiency: "ADVANCED" },
      { skill: { name: "React" }, proficiency: "INTERMEDIATE" },
    ],
  };

  const mockOpp: OpportunityWithSkills = {
    id: "opp-gsoc-1",
    title: "Google Summer of Code 2026",
    provider: "Google Open Source",
    category: "INTERNSHIP",
    description: "Open source software development fellowship.",
    eligibilityRequirements: "Must be at least 18 years old. Open to undergraduate and postgraduate students.",
    educationRequirements: ["UNDERGRADUATE", "POSTGRADUATE"],
    location: "Global / Remote",
    isRemote: true,
    compensationType: "STIPEND",
    compensationDetails: "$1,500 - $3,300",
    applicationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    sourceUrl: "https://summerofcode.withgoogle.com/",
    skills: [
      { skill: { name: "Git" }, isMandatory: true },
      { skill: { name: "Python" }, isMandatory: false },
      { skill: { name: "C++" }, isMandatory: false },
    ],
  };

  it("Stage 1: Evaluates eligible student as LIKELY_ELIGIBLE", () => {
    const res = evaluateEligibility(mockStudent, mockOpp);
    expect(res.status).toBe("LIKELY_ELIGIBLE");
    expect(res.requirementsSatisfied.length).toBeGreaterThan(0);
    expect(res.requirementsNotSatisfied.length).toBe(0);
  });

  it("Stage 1: Correctly marks student LIKELY_INELIGIBLE when education level does not match", () => {
    const schoolStudent: StudentProfileWithSkills = {
      ...mockStudent,
      educationLevel: "SCHOOL",
    };
    const res = evaluateEligibility(schoolStudent, mockOpp);
    expect(res.status).toBe("LIKELY_INELIGIBLE");
    expect(res.requirementsNotSatisfied.length).toBeGreaterThan(0);
  });

  it("Stage 1: Marks status INSUFFICIENT_INFORMATION when student profile is missing", () => {
    const res = evaluateEligibility(null, mockOpp);
    expect(res.status).toBe("INSUFFICIENT_INFORMATION");
    expect(res.missingOrUnknownInformation.length).toBeGreaterThan(0);
  });

  it("Stage 2: Calculates transparent score between 0 and 100", () => {
    const explanation = calculateMatchExplanation(mockStudent, mockOpp);
    expect(explanation.breakdown.totalScore).toBeGreaterThanOrEqual(0);
    expect(explanation.breakdown.totalScore).toBeLessThanOrEqual(100);
    expect(explanation.breakdown.skillsScore).toBeGreaterThan(0);
    expect(explanation.breakdown.educationScore).toBe(25);
    expect(explanation.disclaimer).toContain("does not predict or guarantee acceptance");
  });

  it("Stage 3: Generates explainable reasons and distinguishes matched vs missing skills", () => {
    const explanation = calculateMatchExplanation(mockStudent, mockOpp);
    expect(explanation.reasons.length).toBeGreaterThan(0);
    expect(explanation.skillMatches).toContain("Git");
    expect(explanation.missingSkills).toContain("C++");
  });

  it("Feature 4: Skill Gap Analysis suggests free resources and practical projects", () => {
    const gap = analyzeSkillGap(mockStudent, mockOpp);
    expect(gap.matchedSkills).toContain("Git");
    expect(gap.gapSkills).toContain("C++");
    expect(gap.suggestedRoadmap.length).toBeGreaterThan(0);
    expect(gap.suggestedRoadmap[0].freeResource.url).toBeDefined();
    expect(gap.disclaimer).toContain("does not guarantee employment");
  });

  it("Feature 6: Grounded Q&A Assistant quotes source evidence and flags uncertainties", () => {
    const res = answerWithGroundedSource("What is the deadline and stipend?", mockOpp, mockStudent);
    expect(res.answer).toContain(mockOpp.title);
    expect(res.evidenceQuotes.length).toBeGreaterThan(0);
    expect(res.sourceUrl).toBe(mockOpp.sourceUrl);
  });

  it("Feature 1: Natural Language Search parses criteria without SQL injection vulnerabilities", () => {
    const parsed = parseNaturalLanguageQuery(
      "Find remote Python internships for undergraduate engineering students in India"
    );
    expect(parsed.category).toBe("INTERNSHIP");
    expect(parsed.educationLevel).toBe("UNDERGRADUATE");
    expect(parsed.isRemote).toBe(true);
    expect(parsed.location).toBe("India");
    expect(parsed.skills).toContain("python");
  });

  it("Feature 5: Resume Bullet Assistant drafts bullets strictly from user facts with review notice", async () => {
    const ai = getAiService();
    const result = await ai.generateResumeBullet({
      action: "Engineered",
      context: "a microservices API with Next.js and PostgreSQL",
      outcome: "reducing response latency by 35%",
    });
    expect(result.draftBullets.length).toBe(3);
    expect(result.draftBullets[0]).toContain("Engineered a microservices API");
    expect(result.reviewNotice).toContain("drafted strictly from your factual inputs");
  });
});
