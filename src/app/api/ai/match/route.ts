import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateMatchExplanation } from "@/lib/ai/grounded-engine";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const { opportunityId } = await req.json();

    if (!opportunityId) {
      return NextResponse.json({ error: "opportunityId is required" }, { status: 400 });
    }

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    const match = calculateMatchExplanation(user?.profile || null, opportunity);

    return NextResponse.json({ match });
  } catch (error) {
    console.error("AI Match error:", error);
    return NextResponse.json({ error: "Failed to evaluate match" }, { status: 500 });
  }
}
