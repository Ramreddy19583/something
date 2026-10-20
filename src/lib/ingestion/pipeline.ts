import { prisma } from "../prisma";
import { VerificationStatus, SourceType, Category, EducationLevel, CompensationType } from "@prisma/client";

/**
 * Normalizes URL by stripping UTM parameters, session tags, and trailing slashes
 */
export function canonicalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim());
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "ref",
      "fbclid",
      "gclid",
    ];
    for (const p of trackingParams) {
      parsed.searchParams.delete(p);
    }
    // Remove trailing slash from pathname, including root /
    let path = parsed.pathname;
    if (path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    return `${parsed.protocol}//${parsed.host}${path}${parsed.search ? parsed.search : ""}`;
  } catch {
    return rawUrl.trim();
  }
}

/**
 * Levenshtein-based similarity calculation for titles
 */
export function calculateTitleSimilarity(a: string, b: string): number {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;

  const matrix: number[][] = [];
  for (let i = 0; i <= s2.length; i++) matrix[i] = [i];
  for (let j = 0; j <= s1.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const distance = matrix[s2.length][s1.length];
  const maxLen = Math.max(s1.length, s2.length);
  return 1 - distance / maxLen;
}

export interface IngestOpportunityInput {
  title: string;
  provider: string;
  category: Category;
  description: string;
  eligibilityRequirements: string;
  educationRequirements?: EducationLevel[];
  location?: string | null;
  isRemote?: boolean;
  compensationType?: CompensationType;
  compensationDetails?: string | null;
  applicationOpenDate?: Date | null;
  applicationDeadline?: Date | null;
  sourceUrl: string;
  sourceType?: SourceType;
  verificationStatus?: VerificationStatus;
  verificationNotes?: string | null;
  skillNames?: string[];
}

/**
 * Checks for duplicate listings by canonical URL or strong provider + title match
 */
export async function detectDuplicate(
  canonicalUrl: string,
  provider: string,
  title: string
): Promise<{ isDuplicate: boolean; matchedId?: string; reason?: string }> {
  // Check exact canonical URL match
  const urlMatch = await prisma.opportunity.findFirst({
    where: { canonicalUrl },
    select: { id: true, title: true, provider: true },
  });

  if (urlMatch) {
    return {
      isDuplicate: true,
      matchedId: urlMatch.id,
      reason: `Matches canonical URL of existing listing "${urlMatch.title}"`,
    };
  }

  // Check provider matches with high title similarity
  const providerCandidates = await prisma.opportunity.findMany({
    where: {
      provider: {
        equals: provider,
        mode: "insensitive",
      },
    },
    select: { id: true, title: true },
  });

  for (const candidate of providerCandidates) {
    const sim = calculateTitleSimilarity(title, candidate.title);
    if (sim > 0.85) {
      return {
        isDuplicate: true,
        matchedId: candidate.id,
        reason: `Title "${title}" is ${(sim * 100).toFixed(0)}% similar to existing "${candidate.title}" under ${provider}`,
      };
    }
  }

  return { isDuplicate: false };
}

/**
 * Ingestion handler enforcing verification workflows & audit logs
 */
export async function ingestOpportunity(
  input: IngestOpportunityInput,
  adminUserId?: string
) {
  const canonicalUrl = canonicalizeUrl(input.sourceUrl);
  const dupCheck = await detectDuplicate(canonicalUrl, input.provider, input.title);

  if (dupCheck.isDuplicate) {
    throw new Error(`DUPLICATE_OPPORTUNITY: ${dupCheck.reason}`);
  }

  const slug =
    input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Math.random().toString(36).substring(2, 7);

  const status = input.verificationStatus || "NEEDS_REVIEW";

  const created = await prisma.opportunity.create({
    data: {
      title: input.title,
      slug,
      provider: input.provider,
      category: input.category,
      description: input.description,
      eligibilityRequirements: input.eligibilityRequirements,
      educationRequirements: input.educationRequirements || [],
      location: input.location,
      isRemote: input.isRemote || false,
      compensationType: input.compensationType || "NOT_APPLICABLE",
      compensationDetails: input.compensationDetails,
      applicationOpenDate: input.applicationOpenDate,
      applicationDeadline: input.applicationDeadline,
      sourceUrl: input.sourceUrl,
      canonicalUrl,
      sourceType: input.sourceType || "OFFICIAL_PORTAL",
      verificationStatus: status,
      verificationNotes: input.verificationNotes || "Awaiting authoritative manual check",
      isPublished: status === "VERIFIED",
    },
  });

  // Link skills
  if (input.skillNames && input.skillNames.length > 0) {
    for (const name of input.skillNames) {
      const skill = await prisma.skill.upsert({
        where: { name: name.trim() },
        update: {},
        create: { name: name.trim(), category: "General" },
      });

      await prisma.opportunitySkill.create({
        data: {
          opportunityId: created.id,
          skillId: skill.id,
          isMandatory: false,
        },
      });
    }
  }

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: adminUserId,
      action: "OPPORTUNITY_INGESTED",
      targetType: "Opportunity",
      targetId: created.id,
      details: JSON.stringify({
        title: created.title,
        provider: created.provider,
        canonicalUrl,
        status: created.verificationStatus,
      }),
    },
  });

  return created;
}

/**
 * Automated batch sweep to identify expired listings
 */
export async function sweepExpiredDeadlines(): Promise<number> {
  const now = new Date();
  const result = await prisma.opportunity.updateMany({
    where: {
      applicationDeadline: {
        lt: now,
      },
      verificationStatus: "VERIFIED",
    },
    data: {
      verificationStatus: "EXPIRED",
      verificationNotes: "Automatically marked expired after deadline passed.",
    },
  });

  return result.count;
}
