import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireAuth();

    const saved = await prisma.savedOpportunity.findMany({
      where: { userId: user.id },
      include: {
        opportunity: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ saved });
  } catch (error) {
    console.error("Saved GET error:", error);
    return NextResponse.json({ error: "Failed to load saved items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { opportunityId } = await req.json();

    if (!opportunityId) {
      return NextResponse.json({ error: "opportunityId is required" }, { status: 400 });
    }

    const existing = await prisma.savedOpportunity.findUnique({
      where: {
        userId_opportunityId: {
          userId: user.id,
          opportunityId,
        },
      },
    });

    if (existing) {
      await prisma.savedOpportunity.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ isSaved: false, message: "Opportunity removed from saved items" });
    } else {
      await prisma.savedOpportunity.create({
        data: {
          userId: user.id,
          opportunityId,
        },
      });
      return NextResponse.json({ isSaved: true, message: "Opportunity saved successfully" });
    }
  } catch (error) {
    console.error("Saved POST error:", error);
    return NextResponse.json({ error: "Failed to toggle saved status" }, { status: 500 });
  }
}
