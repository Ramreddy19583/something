import { NextRequest, NextResponse } from "next/server";
import { parseNaturalLanguageQuery } from "@/lib/ai/natural-search";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "Query string is required" }, { status: 400 });
    }

    const parsed = parseNaturalLanguageQuery(query);

    const where: Prisma.OpportunityWhereInput = {
      isPublished: true,
      verificationStatus: "VERIFIED",
    };

    if (parsed.category) {
      where.category = parsed.category;
    }

    if (parsed.educationLevel) {
      where.educationRequirements = {
        has: parsed.educationLevel,
      };
    }

    if (parsed.isRemote !== undefined) {
      where.isRemote = parsed.isRemote;
    }

    if (parsed.isPaid) {
      where.compensationType = {
        in: ["PAID", "STIPEND", "FUNDING", "PRIZE"],
      };
    }

    if (parsed.location) {
      where.location = {
        contains: parsed.location,
        mode: "insensitive",
      };
    }

    if (parsed.searchQuery) {
      where.OR = [
        { title: { contains: parsed.searchQuery, mode: "insensitive" } },
        { provider: { contains: parsed.searchQuery, mode: "insensitive" } },
        { description: { contains: parsed.searchQuery, mode: "insensitive" } },
      ];
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
      take: 20,
    });

    return NextResponse.json({
      parsedParams: parsed,
      opportunities,
      count: opportunities.length,
    });
  } catch (error) {
    console.error("Natural search error:", error);
    return NextResponse.json({ error: "Failed to process natural search" }, { status: 500 });
  }
}
