import { describe, it, expect } from "vitest";
import { getInterviewGuidance } from "../src/lib/interview-prep";

describe("Interview Preparation & Public Utility Helper", () => {
  it("generates top 5 core topics for software engineering internships", () => {
    const opp = {
      id: "opp-1",
      title: "Google Summer of Code",
      category: "INTERNSHIP",
      provider: "Google Open Source",
      description: "Global program focusing on bringing student developers into open source software development.",
      skills: [{ skill: { name: "Python" } }, { skill: { name: "Git" } }],
      applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrl: "https://summerofcode.withgoogle.com",
    };

    const guidance = getInterviewGuidance(opp);
    expect(guidance.coreTopics).toHaveLength(5);
    expect(guidance.coreTopics[0].title).toContain("Data Structures");
    expect(guidance.screeningQuestions.length).toBeGreaterThanOrEqual(3);
    expect(guidance.screeningQuestions[0].modelAnswer).toBeDefined();
    expect(guidance.screeningQuestions[0].modelAnswer.length).toBeGreaterThan(20);
    expect(guidance.freeResources.length).toBeGreaterThanOrEqual(2);
    expect(guidance.googleCalendarUrl).toContain("calendar.google.com");
  });

  it("generates research-specific core topics and questions for research fellowships", () => {
    const opp = {
      id: "opp-2",
      title: "Prime Minister's Research Fellowship (PMRF)",
      category: "RESEARCH",
      provider: "Ministry of Education, Govt of India",
      description: "Direct doctoral research admission in IITs and IISc.",
      skills: [{ skill: { name: "Research" } }],
      applicationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrl: "https://www.pmrf.in",
    };

    const guidance = getInterviewGuidance(opp);
    expect(guidance.coreTopics).toHaveLength(5);
    expect(guidance.coreTopics[0].title).toContain("Research Methodology");
    expect(guidance.screeningQuestions[0].focusArea).toContain("Research");
    expect(guidance.googleCalendarUrl).toContain("calendar.google.com");
  });

  it("handles opportunities with no deadline gracefully", () => {
    const opp = {
      id: "opp-3",
      title: "Open Source Ongoing Hack",
      category: "HACKATHON",
      provider: "Open Community",
      description: "Year-round open source participation.",
      skills: [],
      applicationDeadline: null,
      sourceUrl: "https://example.com",
    };

    const guidance = getInterviewGuidance(opp);
    expect(guidance.coreTopics).toHaveLength(5);
    expect(guidance.googleCalendarUrl).toBeNull();
    expect(guidance.freeResources.length).toBeGreaterThanOrEqual(3);
  });
});
