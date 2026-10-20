import { EducationLevel, Category } from "@prisma/client";

export type EligibilityStatus = "LIKELY_ELIGIBLE" | "LIKELY_INELIGIBLE" | "INSUFFICIENT_INFORMATION";

export interface EligibilityResult {
  status: EligibilityStatus;
  overallVerdict: string;
  requirementsSatisfied: string[];
  requirementsNotSatisfied: string[];
  missingOrUnknownInformation: string[];
  sourceEvidence: string[];
  recommendedNextAction: string;
}

export interface MatchScoreBreakdown {
  totalScore: number; // 0 - 100
  educationScore: number; // 0 - 25
  skillsScore: number; // 0 - 35
  interestScore: number; // 0 - 15
  careerGoalScore: number; // 0 - 10
  locationScore: number; // 0 - 10
  categoryScore: number; // 0 - 5
}

export interface MatchExplanation {
  breakdown: MatchScoreBreakdown;
  eligibility: EligibilityResult;
  reasons: string[];
  skillMatches: string[];
  missingSkills: string[];
  suggestedNextAction: string;
  disclaimer: string;
}

export interface NaturalSearchParams {
  searchQuery?: string;
  category?: Category;
  educationLevel?: EducationLevel;
  isRemote?: boolean;
  location?: string;
  skills?: string[];
  isPaid?: boolean;
  confidence: number;
  extractedCriteria: Record<string, string | boolean | undefined>;
}

export interface SkillGapAnalysis {
  targetTitle: string;
  userSkills: string[];
  requiredSkills: string[];
  matchedSkills: string[];
  gapSkills: string[];
  suggestedRoadmap: {
    skill: string;
    description: string;
    freeResource: {
      title: string;
      provider: string;
      url: string;
    };
    suggestedProject: string;
  }[];
  disclaimer: string;
}

export interface GroundedAssistantResponse {
  answer: string;
  sourceTitle?: string;
  sourceUrl?: string;
  evidenceQuotes: string[];
  uncertainties: string[];
  suggestedQuestions: string[];
}
