import { Category, EducationLevel } from "@prisma/client";
import { NaturalSearchParams } from "./types";

function matchesSkill(text: string, skill: string): boolean {
  if (skill === "c++") {
    return /(?:^|\s|\W)c\+\+(?:$|\s|\W)/i.test(text);
  }
  const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|\\W)${escaped}(?:$|\\W)`, "i").test(text);
}

/**
 * Converts natural language query into validated structured search parameters
 * without allowing arbitrary SQL injection or fabricated filter values.
 */
export function parseNaturalLanguageQuery(query: string): NaturalSearchParams {
  const normalized = query.toLowerCase().trim();
  const criteria: Record<string, string | boolean | undefined> = {};
  let category: Category | undefined = undefined;
  let educationLevel: EducationLevel | undefined = undefined;
  let isRemote: boolean | undefined = undefined;
  let isPaid: boolean | undefined = undefined;
  let location: string | undefined = undefined;
  const detectedSkills: string[] = [];

  // Category detection
  if (normalized.includes("internship") || normalized.includes("intern")) {
    category = "INTERNSHIP";
    criteria.category = "INTERNSHIP";
  } else if (normalized.includes("scholarship") || normalized.includes("fellowship") || normalized.includes("grant")) {
    category = "SCHOLARSHIP";
    criteria.category = "SCHOLARSHIP";
  } else if (normalized.includes("hackathon") || normalized.includes("hack")) {
    category = "HACKATHON";
    criteria.category = "HACKATHON";
  } else if (normalized.includes("competition") || normalized.includes("contest")) {
    category = "COMPETITION";
    criteria.category = "COMPETITION";
  } else if (normalized.includes("research")) {
    category = "RESEARCH";
    criteria.category = "RESEARCH";
  } else if (normalized.includes("apprenticeship")) {
    category = "APPRENTICESHIP";
    criteria.category = "APPRENTICESHIP";
  } else if (normalized.includes("certification") || normalized.includes("certificate")) {
    category = "CERTIFICATION";
    criteria.category = "CERTIFICATION";
  } else if (normalized.includes("training") || normalized.includes("course") || normalized.includes("bootcamp")) {
    category = "TRAINING";
    criteria.category = "TRAINING";
  }

  // Education level detection
  if (
    normalized.includes("undergraduate") ||
    normalized.includes("b.tech") ||
    normalized.includes("btech") ||
    normalized.includes("b.sc") ||
    normalized.includes("bsc") ||
    normalized.includes("b.e") ||
    normalized.includes("college student") ||
    normalized.includes("engineering student")
  ) {
    educationLevel = "UNDERGRADUATE";
    criteria.educationLevel = "UNDERGRADUATE";
  } else if (
    normalized.includes("postgraduate") ||
    normalized.includes("master") ||
    normalized.includes("m.tech") ||
    normalized.includes("mtech") ||
    normalized.includes("msc") ||
    normalized.includes("m.sc") ||
    normalized.includes("phd")
  ) {
    educationLevel = "POSTGRADUATE";
    criteria.educationLevel = "POSTGRADUATE";
  } else if (normalized.includes("diploma")) {
    educationLevel = "DIPLOMA";
    criteria.educationLevel = "DIPLOMA";
  } else if (normalized.includes("school") || normalized.includes("12th") || normalized.includes("10th")) {
    educationLevel = "SCHOOL";
    criteria.educationLevel = "SCHOOL";
  } else if (normalized.includes("recent graduate") || normalized.includes("fresh graduate") || normalized.includes("passout")) {
    educationLevel = "RECENT_GRADUATE";
    criteria.educationLevel = "RECENT_GRADUATE";
  }

  // Remote detection
  if (normalized.includes("remote") || normalized.includes("work from home") || normalized.includes("virtual")) {
    isRemote = true;
    criteria.isRemote = true;
  } else if (normalized.includes("onsite") || normalized.includes("in-person") || normalized.includes("offline")) {
    isRemote = false;
    criteria.isRemote = false;
  }

  // Paid / Stipend detection
  if (normalized.includes("paid") || normalized.includes("stipend") || normalized.includes("salary")) {
    isPaid = true;
    criteria.isPaid = true;
  }

  // Location detection
  if (normalized.includes("india")) {
    location = "India";
    criteria.location = "India";
  } else if (normalized.includes("bangalore") || normalized.includes("bengaluru")) {
    location = "Bengaluru";
    criteria.location = "Bengaluru";
  } else if (normalized.includes("hyderabad")) {
    location = "Hyderabad";
    criteria.location = "Hyderabad";
  } else if (normalized.includes("delhi") || normalized.includes("ncr")) {
    location = "Delhi";
    criteria.location = "Delhi";
  } else if (normalized.includes("mumbai") || normalized.includes("pune")) {
    location = "Maharashtra";
    criteria.location = "Maharashtra";
  }

  // Common skill keyword detection
  const commonSkills = [
    "python",
    "javascript",
    "typescript",
    "react",
    "node",
    "java",
    "c++",
    "machine learning",
    "ai",
    "data science",
    "sql",
    "cloud",
    "docker",
    "kubernetes",
    "design",
    "ui/ux",
    "rust",
    "go",
  ];

  for (const s of commonSkills) {
    if (matchesSkill(normalized, s)) {
      detectedSkills.push(s);
    }
  }

  if (detectedSkills.length > 0) {
    criteria.skills = detectedSkills.join(", ");
  }

  // Clean remaining query keywords for free-text search
  let cleanQuery = normalized
    .replace(/find|search|show|get|list|looking for|for|in|remote|onsite|undergraduate|postgraduate|internship|scholarship|hackathon/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    searchQuery: cleanQuery.length > 1 ? cleanQuery : undefined,
    category,
    educationLevel,
    isRemote,
    isPaid,
    location,
    skills: detectedSkills.length > 0 ? detectedSkills : undefined,
    confidence: Object.keys(criteria).length > 0 ? 0.85 : 0.4,
    extractedCriteria: criteria,
  };
}
