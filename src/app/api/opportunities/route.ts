import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { Category, EducationLevel, Prisma } from "@prisma/client";
import { calculateMatchExplanation } from "@/lib/ai/grounded-engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const category = searchParams.get("category") as Category | null;
    const education = searchParams.get("education") as EducationLevel | null;
    const isRemote = searchParams.get("isRemote");
    const isPaid = searchParams.get("isPaid");
    const location = searchParams.get("location")?.trim();
    const sort = searchParams.get("sort") || "relevance";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
    const skip = (page - 1) * limit;

    const user = await getSessionUser();
    const isAdmin = user?.role === "ADMIN";

    const where: Prisma.OpportunityWhereInput = {
      isPublished: true,
      verificationStatus: isAdmin ? undefined : "VERIFIED",
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { provider: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { eligibilityRequirements: { contains: q, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (education) {
      where.educationRequirements = {
        has: education,
      };
    }

    if (isRemote !== null && isRemote !== undefined && isRemote !== "") {
      where.isRemote = isRemote === "true";
    }

    if (isPaid === "true") {
      where.compensationType = {
        in: ["PAID", "STIPEND", "FUNDING", "PRIZE"],
      };
    }

    if (location) {
      where.location = {
        contains: location,
        mode: "insensitive",
      };
    }

    let orderBy: Prisma.OpportunityOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "deadline") {
      orderBy = { applicationDeadline: "asc" };
    } else if (sort === "recent") {
      orderBy = { createdAt: "desc" };
    }

    const [total, opportunities] = await Promise.all([
      prisma.opportunity.count({ where }),
      prisma.opportunity.findMany({
        where,
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    // Check saved IDs for the current user
    let savedOppIds = new Set<string>();
    if (user) {
      const saved = await prisma.savedOpportunity.findMany({
        where: { userId: user.id },
        select: { opportunityId: true },
      });
      savedOppIds = new Set(saved.map((s) => s.opportunityId));
    }

    // Attach match scoring if user profile exists
    const enriched = opportunities.map((opp) => {
      const isSaved = savedOppIds.has(opp.id);
      if (user?.profile) {
        const match = calculateMatchExplanation(user.profile, opp);
        return {
          ...opp,
          isSaved,
          matchScore: match.breakdown.totalScore,
          eligibilityStatus: match.eligibility.status,
          reasons: match.reasons.slice(0, 2),
        };
      }
      return {
        ...opp,
        isSaved,
        matchScore: null,
        eligibilityStatus: null,
      };
    });

    if (sort === "relevance" && user?.profile) {
      enriched.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    return NextResponse.json({
      opportunities: enriched,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Opportunities GET error:", error);
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 });
  }
}
