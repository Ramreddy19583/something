import {
  EligibilityResult,
  MatchExplanation,
  MatchScoreBreakdown,
  SkillGapAnalysis,
  GroundedAssistantResponse,
} from "./types";
import { EducationLevel, Category } from "@prisma/client";

export interface StudentProfileWithSkills {
  educationLevel: EducationLevel;
  degree?: string | null;
  fieldOfStudy?: string | null;
  currentYear?: number | null;
  graduationYear?: number | null;
  country: string;
  stateOrCity?: string | null;
  preferredLocations: string[];
  remotePreference: string;
  preferredCategories: Category[];
  careerGoals: string[];
  skills: {
    skill: {
      name: string;
      category?: string | null;
    };
    proficiency: string;
  }[];
}

export interface OpportunityWithSkills {
  id: string;
  title: string;
  provider: string;
  category: Category;
  description: string;
  eligibilityRequirements: string;
  educationRequirements: EducationLevel[];
  location?: string | null;
  isRemote: boolean;
  compensationType: string;
  compensationDetails?: string | null;
  applicationDeadline?: Date | null;
  sourceUrl: string;
  skills: {
    skill: {
      name: string;
    };
    isMandatory: boolean;
  }[];
}

/**
 * Stage 1: Hard eligibility check
 */
export function evaluateEligibility(
  profile: StudentProfileWithSkills | null,
  opportunity: OpportunityWithSkills
): EligibilityResult {
  const satisfied: string[] = [];
  const notSatisfied: string[] = [];
  const unknownOrMissing: string[] = [];
  const sourceEvidence: string[] = [
    `Eligibility text: "${opportunity.eligibilityRequirements.slice(0, 200)}..."`,
  ];

  if (!profile) {
    return {
      status: "INSUFFICIENT_INFORMATION",
      overallVerdict: "Student profile has not been created or completed yet.",
      requirementsSatisfied: [],
      requirementsNotSatisfied: [],
      missingOrUnknownInformation: [
        "Education level",
        "Field of study / Branch",
        "Year of study",
        "Skills list",
      ],
      sourceEvidence,
      recommendedNextAction: "Complete your onboarding profile to view accurate eligibility checks.",
    };
  }

  // 1. Education Level check
  if (
    opportunity.educationRequirements &&
    opportunity.educationRequirements.length > 0
  ) {
    if (opportunity.educationRequirements.includes(profile.educationLevel)) {
      satisfied.push(
        `Education level '${profile.educationLevel}' matches opportunity requirements (${opportunity.educationRequirements.join(", ")}).`
      );
    } else {
      notSatisfied.push(
        `Your education level '${profile.educationLevel}' is not listed in allowed levels: ${opportunity.educationRequirements.join(", ")}.`
      );
    }
  } else {
    satisfied.push("Open to all education levels or no strict level restricted.");
  }

  // 2. Year of study check
  const eligLower = opportunity.eligibilityRequirements.toLowerCase();
  const yearMentionMatch = eligLower.match(/(1st|2nd|3rd|4th|final|first|second|third)\s*year/);
  if (yearMentionMatch) {
    if (profile.currentYear) {
      const yearStr = `${profile.currentYear}`;
      if (
        (yearMentionMatch[0].includes("1") && yearStr === "1") ||
        (yearMentionMatch[0].includes("2") && yearStr === "2") ||
        (yearMentionMatch[0].includes("3") && yearStr === "3") ||
        (yearMentionMatch[0].includes("4") && yearStr === "4")
      ) {
        satisfied.push(`Current year (${profile.currentYear}) matches mention in criteria.`);
      } else {
        unknownOrMissing.push(
          `Opportunity mentions '${yearMentionMatch[0]}'. You are in Year ${profile.currentYear}. Please double-check specific cohort requirements.`
        );
      }
    } else {
      unknownOrMissing.push(
        `Listing specifies year restrictions (${yearMentionMatch[0]}), but your current year of study is unrecorded.`
      );
    }
  }

  // 3. Location / Country check
  if (eligLower.includes("india only") || eligLower.includes("citizen of india")) {
    if (profile.country?.toLowerCase() === "india") {
      satisfied.push("Citizenship/Location requirement (India) satisfied.");
    } else {
      notSatisfied.push("Requires Indian residency or citizenship.");
    }
  }

  // 4. Mandatory skills check
  const mandatoryOppSkills = opportunity.skills.filter((s) => s.isMandatory);
  if (mandatoryOppSkills.length > 0) {
    const studentSkillNames = new Set(
      profile.skills.map((s) => s.skill.name.toLowerCase())
    );
    for (const mSkill of mandatoryOppSkills) {
      if (studentSkillNames.has(mSkill.skill.name.toLowerCase())) {
        satisfied.push(`Mandatory skill '${mSkill.skill.name}' present in profile.`);
      } else {
        notSatisfied.push(
          `Mandatory skill '${mSkill.skill.name}' is missing from your profile.`
        );
      }
    }
  }

  // Determine overall status honestly
  if (notSatisfied.length > 0) {
    return {
      status: "LIKELY_INELIGIBLE",
      overallVerdict: "You may not meet one or more mandatory eligibility requirements.",
      requirementsSatisfied: satisfied,
      requirementsNotSatisfied: notSatisfied,
      missingOrUnknownInformation: unknownOrMissing,
      sourceEvidence,
      recommendedNextAction:
        "Review the official listing criteria carefully or explore opportunities suited for your current year/branch.",
    };
  }

  if (unknownOrMissing.length > 0) {
    return {
      status: "INSUFFICIENT_INFORMATION",
      overallVerdict: "Additional details needed to confirm eligibility.",
      requirementsSatisfied: satisfied,
      requirementsNotSatisfied: notSatisfied,
      missingOrUnknownInformation: unknownOrMissing,
      sourceEvidence,
      recommendedNextAction:
        "Update your profile with your specific study year and verified course to get a definite match.",
    };
  }

  return {
    status: "LIKELY_ELIGIBLE",
    overallVerdict: "You appear likely eligible based on available published criteria.",
    requirementsSatisfied: satisfied,
    requirementsNotSatisfied: notSatisfied,
    missingOrUnknownInformation: unknownOrMissing,
    sourceEvidence,
    recommendedNextAction:
      "Proceed to prepare your application materials and review official guidelines.",
  };
}

/**
 * Stage 2 & 3: Transparent Scoring and Explainable Rationale
 */
export function calculateMatchExplanation(
  profile: StudentProfileWithSkills | null,
  opportunity: OpportunityWithSkills
): MatchExplanation {
  const eligibility = evaluateEligibility(profile, opportunity);

  if (!profile) {
    const breakdown: MatchScoreBreakdown = {
      totalScore: 40,
      educationScore: 10,
      skillsScore: 10,
      interestScore: 5,
      careerGoalScore: 5,
      locationScore: 5,
      categoryScore: 5,
    };
    return {
      breakdown,
      eligibility,
      reasons: ["General listing relevant to college students."],
      skillMatches: [],
      missingSkills: opportunity.skills.map((s) => s.skill.name),
      suggestedNextAction: "Complete your student profile to calculate personalized match score.",
      disclaimer:
        "Match score indicates profile alignment only. It does not predict or guarantee acceptance.",
    };
  }

  // 1. Education score (max 25)
  let educationScore = 15;
  if (
    opportunity.educationRequirements &&
    opportunity.educationRequirements.includes(profile.educationLevel)
  ) {
    educationScore = 25;
  } else if (
    !opportunity.educationRequirements ||
    opportunity.educationRequirements.length === 0
  ) {
    educationScore = 20;
  } else {
    educationScore = 5;
  }

  // 2. Skills score (max 35)
  const userSkillMap = new Map(
    profile.skills.map((s) => [s.skill.name.toLowerCase(), s.proficiency])
  );
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const s of opportunity.skills) {
    const sName = s.skill.name.toLowerCase();
    if (userSkillMap.has(sName)) {
      matchedSkills.push(s.skill.name);
    } else {
      missingSkills.push(s.skill.name);
    }
  }

  let skillsScore = 10;
  if (opportunity.skills.length > 0) {
    const ratio = matchedSkills.length / opportunity.skills.length;
    skillsScore = Math.round(ratio * 35);
  } else {
    skillsScore = 25; // Open / general skills
  }

  // 3. Category match (max 15)
  let categoryScore = 5;
  if (
    profile.preferredCategories &&
    profile.preferredCategories.includes(opportunity.category)
  ) {
    categoryScore = 15;
  }

  // 4. Career Goal match (max 10)
  let careerGoalScore = 5;
  const oppText = `${opportunity.title} ${opportunity.description}`.toLowerCase();
  for (const goal of profile.careerGoals) {
    if (oppText.includes(goal.toLowerCase())) {
      careerGoalScore = 10;
      break;
    }
  }

  // 5. Location / Remote preference (max 10)
  let locationScore = 5;
  if (opportunity.isRemote && profile.remotePreference !== "ONSITE_ONLY") {
    locationScore = 10;
  } else if (!opportunity.isRemote && profile.remotePreference !== "REMOTE_ONLY") {
    locationScore = 8;
  }

  // 6. Recency / Deadline bonus (max 5)
  let deadlineScore = 5;
  if (opportunity.applicationDeadline) {
    const daysLeft =
      (new Date(opportunity.applicationDeadline).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24);
    if (daysLeft < 0) {
      deadlineScore = 0; // Expired
    } else if (daysLeft > 3) {
      deadlineScore = 5;
    }
  }

  let totalScore =
    educationScore +
    skillsScore +
    categoryScore +
    careerGoalScore +
    locationScore +
    deadlineScore;

  if (eligibility.status === "LIKELY_INELIGIBLE") {
    totalScore = Math.min(totalScore, 45); // Hard cap if ineligible
  }

  // Build clear, explainable reasons
  const reasons: string[] = [];
  if (educationScore >= 20) {
    reasons.push(`Education level (${profile.educationLevel}) matches this opportunity.`);
  }
  if (matchedSkills.length > 0) {
    reasons.push(
      `Direct skill match with: ${matchedSkills.slice(0, 3).join(", ")}${
        matchedSkills.length > 3 ? "..." : ""
      }.`
    );
  }
  if (categoryScore === 15) {
    reasons.push(`Matches your preferred category: ${opportunity.category}.`);
  }
  if (opportunity.isRemote && profile.remotePreference !== "ONSITE_ONLY") {
    reasons.push("Fully remote opportunity matching your flexibility preference.");
  }

  let suggestedNextAction = "Save this opportunity and review the deadline.";
  if (eligibility.status === "LIKELY_ELIGIBLE") {
    suggestedNextAction = "Prepare your application portfolio and track your submission.";
  } else if (missingSkills.length > 0) {
    suggestedNextAction = `Consider reviewing foundational resources for ${missingSkills[0]} to strengthen your profile.`;
  }

  return {
    breakdown: {
      totalScore: Math.min(100, Math.max(0, totalScore)),
      educationScore,
      skillsScore,
      interestScore: categoryScore,
      careerGoalScore,
      locationScore,
      categoryScore: deadlineScore,
    },
    eligibility,
    reasons,
    skillMatches: matchedSkills,
    missingSkills,
    suggestedNextAction,
    disclaimer:
      "Match score indicates profile alignment only. It does not predict or guarantee acceptance.",
  };
}

/**
 * Curated high-quality open learning resources
 */
const CURATED_RESOURCES: Record<
  string,
  { title: string; provider: string; url: string; project: string }
> = {
  python: {
    title: "Python for Everybody Specialization (Free Audit / Course)",
    provider: "University of Michigan / FreeCodeCamp",
    url: "https://www.freecodecamp.org/news/learn-python-free-python-courses-for-beginners/",
    project: "Build an automated web scraper for tracking job notifications",
  },
  typescript: {
    title: "TypeScript Handbook & Practical Course",
    provider: "Microsoft Official Docs",
    url: "https://www.typescriptlang.org/docs/handbook/intro.html",
    project: "Build a type-safe CLI task runner with Zod validation",
  },
  react: {
    title: "React.dev Interactive Documentation",
    provider: "React Team",
    url: "https://react.dev/learn",
    project: "Build a responsive student course planner with local storage persistence",
  },
  machinelearning: {
    title: "Machine Learning Crash Course",
    provider: "Google Developers",
    url: "https://developers.google.com/machine-learning/crash-course",
    project: "Train a text classifier to categorize opportunity listings",
  },
  sql: {
    title: "SQL & Relational Databases Interactive Course",
    provider: "Khan Academy & PostgreSQL Tutorial",
    url: "https://www.postgresqltutorial.com/",
    project: "Design and normalize a university library management schema",
  },
  git: {
    title: "Pro Git Official Book & Interactive Lab",
    provider: "Git SCM",
    url: "https://git-scm.com/book/en/v2",
    project: "Collaborate on an open-source documentation issue with branch PR workflow",
  },
  docker: {
    title: "Docker Get Started & Container Labs",
    provider: "Docker Community",
    url: "https://docs.docker.com/get-started/",
    project: "Containerize a full-stack Next.js and PostgreSQL application",
  },
};

/**
 * Feature 4: Skill-gap analysis
 */
export function analyzeSkillGap(
  profile: StudentProfileWithSkills | null,
  opportunity: OpportunityWithSkills
): SkillGapAnalysis {
  const userSkillNames = profile?.skills.map((s) => s.skill.name) ?? [];
  const oppSkillNames = opportunity.skills.map((s) => s.skill.name);

  const userLower = new Set(userSkillNames.map((s) => s.toLowerCase()));
  const matched = oppSkillNames.filter((s) => userLower.has(s.toLowerCase()));
  const gap = oppSkillNames.filter((s) => !userLower.has(s.toLowerCase()));

  const suggestedRoadmap = gap.map((skillName) => {
    const key = skillName.toLowerCase().replace(/[^a-z]/g, "");
    const match =
      CURATED_RESOURCES[key] || {
        title: `Comprehensive Guide to ${skillName}`,
        provider: "Open Educational Resource",
        url: "https://developer.mozilla.org/en-US/",
        project: `Build a starter portfolio project demonstrating core concepts of ${skillName}`,
      };

    return {
      skill: skillName,
      description: `Target requirement for ${opportunity.title}. Understanding fundamental concepts enhances application competitiveness.`,
      freeResource: {
        title: match.title,
        provider: match.provider,
        url: match.url,
      },
      suggestedProject: match.project,
    };
  });

  return {
    targetTitle: opportunity.title,
    userSkills: userSkillNames,
    requiredSkills: oppSkillNames,
    matchedSkills: matched,
    gapSkills: gap,
    suggestedRoadmap,
    disclaimer:
      "Completing learning resources or projects helps develop relevant competencies, but does not guarantee employment or selection.",
  };
}

/**
 * Feature 6: Source-Grounded Q&A Assistant
 */
export function answerWithGroundedSource(
  query: string,
  opportunity: OpportunityWithSkills | null,
  profile: StudentProfileWithSkills | null
): GroundedAssistantResponse {
  const qLower = query.toLowerCase();

  if (!opportunity) {
    // General student guidance grounded in platform principles
    if (qLower.includes("resume") || qLower.includes("cv")) {
      return {
        answer:
          "For technical and academic applications, structure your resume with: (1) Verified Education & Current GPA, (2) Core Technical Skills grouped by category, (3) 2-3 Hands-on Projects with GitHub links and verifiable outcomes, and (4) Relevant Certifications or Coursework. Never exaggerate experience, and tailor bullet points directly to published listing requirements.",
        evidenceQuotes: ["Standard engineering application guidelines"],
        uncertainties: ["Specific organization resume format preferences may vary."],
        suggestedQuestions: [
          "How do I draft bullet points for my personal projects?",
          "What opportunities match my current skills?",
        ],
      };
    }

    return {
      answer:
        "Opportunity AI provides verified discovery for internships, scholarships, research fellowships, and hackathons. You can ask me to evaluate your eligibility for any opportunity, check missing skills, or explain application steps.",
      evidenceQuotes: ["Platform ground truth rules"],
      uncertainties: [],
      suggestedQuestions: [
        "What are the top open hackathons or research fellowships?",
        "Check my eligibility for Google Summer of Code",
        "How can I bridge the skill gap for machine learning roles?",
      ],
    };
  }

  // Answering specific to an opportunity
  const quotes: string[] = [];
  const uncertainties: string[] = [];
  let answer = "";

  if (qLower.includes("eligible") || qLower.includes("who can apply")) {
    const evalRes = evaluateEligibility(profile, opportunity);
    quotes.push(`Eligibility text: "${opportunity.eligibilityRequirements}"`);
    answer = `Based on the official listing from ${opportunity.provider}: ${evalRes.overallVerdict}\n\n`;
    if (evalRes.requirementsSatisfied.length > 0) {
      answer += `Requirements Satisfied:\n• ${evalRes.requirementsSatisfied.join("\n• ")}\n\n`;
    }
    if (evalRes.requirementsNotSatisfied.length > 0) {
      answer += `Requirements Not Satisfied:\n• ${evalRes.requirementsNotSatisfied.join("\n• ")}\n\n`;
    }
    if (evalRes.missingOrUnknownInformation.length > 0) {
      answer += `Unknown / Missing Profile Information:\n• ${evalRes.missingOrUnknownInformation.join("\n• ")}\n`;
      uncertainties.push("Missing exact study year or course verification in your profile.");
    }
  } else if (qLower.includes("deadline") || qLower.includes("last date")) {
    if (opportunity.applicationDeadline) {
      const formatted = new Date(opportunity.applicationDeadline).toLocaleDateString(
        "en-IN",
        { day: "numeric", month: "long", year: "numeric" }
      );
      answer = `The published deadline for ${opportunity.title} is ${formatted}.`;
      quotes.push(`Official deadline: ${opportunity.applicationDeadline.toISOString()}`);
    } else {
      answer = `No explicit deadline is recorded in the official listing for ${opportunity.title}.`;
      uncertainties.push("Deadline is not specified or ongoing rolling admissions.");
    }
  } else if (qLower.includes("stipend") || qLower.includes("paid") || qLower.includes("funding")) {
    if (opportunity.compensationDetails) {
      answer = `Compensation / Funding for ${opportunity.title} is listed as: ${opportunity.compensationDetails} (${opportunity.compensationType}).`;
      quotes.push(`Compensation: ${opportunity.compensationDetails}`);
    } else {
      answer = `The listing categorizes compensation as ${opportunity.compensationType}, with no specific monetary amount disclosed.`;
      uncertainties.push("Exact financial disbursement schedule not published in initial listing.");
    }
  } else {
    // General opportunity question
    answer = `${opportunity.title} is offered by ${opportunity.provider} under category ${opportunity.category}.\n\nOverview:\n${opportunity.description}\n\nOfficial Source: ${opportunity.sourceUrl}`;
    quotes.push(`Provider: ${opportunity.provider}`, `Category: ${opportunity.category}`);
  }

  return {
    answer,
    sourceTitle: opportunity.title,
    sourceUrl: opportunity.sourceUrl,
    evidenceQuotes: quotes,
    uncertainties,
    suggestedQuestions: [
      "What skills do I need to learn for this?",
      "Are there any location or remote restrictions?",
      "What are the application deadlines?",
    ],
  };
}
