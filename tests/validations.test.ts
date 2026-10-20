import { describe, it, expect } from "vitest";
import {
  SignUpSchema,
  LoginSchema,
  StudentProfileSchema,
  OpportunitySchema,
  AiQuerySchema,
} from "../src/lib/validations";

describe("Input Validation & Security Schemas", () => {
  it("validates correct signup payload", () => {
    const valid = {
      name: "Aarav Sharma",
      email: "aarav@university.edu",
      password: "ValidPassword123",
    };
    const res = SignUpSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("rejects weak password with fewer than 8 characters", () => {
    const invalid = {
      name: "Aarav Sharma",
      email: "aarav@university.edu",
      password: "short",
    };
    const res = SignUpSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("rejects invalid email formats", () => {
    const invalid = {
      email: "not-an-email",
      password: "ValidPassword123",
    };
    const res = LoginSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("validates student profile schema with allowed enums", () => {
    const validProfile = {
      educationLevel: "UNDERGRADUATE",
      degree: "B.Tech",
      fieldOfStudy: "Computer Science",
      currentYear: 2,
      country: "India",
      remotePreference: "REMOTE_ONLY",
      preferredCategories: ["INTERNSHIP", "HACKATHON"],
      careerGoals: ["SDE"],
      skills: [{ name: "Python", proficiency: "INTERMEDIATE" }],
    };
    const res = StudentProfileSchema.safeParse(validProfile);
    expect(res.success).toBe(true);
  });

  it("validates opportunity schema and rejects invalid source URLs", () => {
    const invalidOpp = {
      title: "Test Opportunity",
      provider: "Test Provider",
      category: "INTERNSHIP",
      description: "Short description here",
      eligibilityRequirements: "Valid eligibility",
      sourceUrl: "not-a-valid-url",
    };
    const res = OpportunitySchema.safeParse(invalidOpp);
    expect(res.success).toBe(false);
  });

  it("validates AI query length limits", () => {
    const emptyQuery = { query: " " };
    const res = AiQuerySchema.safeParse(emptyQuery);
    expect(res.success).toBe(false);

    const validQuery = { query: "What are the eligibility requirements for GSoC?" };
    const res2 = AiQuerySchema.safeParse(validQuery);
    expect(res2.success).toBe(true);
  });
});
