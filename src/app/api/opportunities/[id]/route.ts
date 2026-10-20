import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { calculateMatchExplanation } from "@/lib/ai/grounded-engine";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();

    const opportunity = await prisma.opportunity.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
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

    let isSaved = false;
    let application = null;
    if (user) {
      const [savedRecord, appRecord] = await Promise.all([
        prisma.savedOpportunity.findUnique({
          where: {
            userId_opportunityId: {
              userId: user.id,
              opportunityId: opportunity.id,
            },
          },
        }),
        prisma.application.findUnique({
          where: {
            userId_opportunityId: {
              userId: user.id,
              opportunityId: opportunity.id,
            },
          },
          include: {
            reminders: true,
          },
        }),
      ]);
      isSaved = !!savedRecord;
      application = appRecord;
    }

    // AI Match Calculation (Stage 1, 2, 3)
    const matchExplanation = calculateMatchExplanation(user?.profile || null, opportunity);

    return NextResponse.json({
      opportunity,
      isSaved,
      application,
      matchExplanation,
    });
  } catch (error) {
    console.error("Opportunity detail GET error:", error);
    return NextResponse.json({ error: "Failed to load opportunity" }, { status: 500 });
  }
}
