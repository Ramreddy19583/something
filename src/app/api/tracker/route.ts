import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";

export async function GET() {
  try {
    const user = await requireAuth();

    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      include: {
        opportunity: true,
        reminders: {
          orderBy: { dueDate: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Tracker GET error:", error);
    return NextResponse.json({ error: "Failed to fetch tracker items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { opportunityId, status, notes, appliedDate, deadline } = body;

    if (!opportunityId) {
      return NextResponse.json({ error: "opportunityId is required" }, { status: 400 });
    }

    const validStatuses: ApplicationStatus[] = [
      "INTERESTED",
      "PREPARING",
      "APPLIED",
      "ASSESSMENT",
      "INTERVIEW",
      "ACCEPTED",
      "REJECTED",
      "WITHDRAWN",
    ];

    const targetStatus = validStatuses.includes(status) ? status : "INTERESTED";

    const application = await prisma.application.upsert({
      where: {
        userId_opportunityId: {
          userId: user.id,
          opportunityId,
        },
      },
      update: {
        status: targetStatus,
        notes: notes !== undefined ? notes : undefined,
        appliedDate: appliedDate ? new Date(appliedDate) : undefined,
        deadline: deadline ? new Date(deadline) : undefined,
      },
      create: {
        userId: user.id,
        opportunityId,
        status: targetStatus,
        notes: notes || "",
        appliedDate: appliedDate ? new Date(appliedDate) : null,
        deadline: deadline ? new Date(deadline) : null,
      },
      include: {
        opportunity: true,
        reminders: true,
      },
    });

    return NextResponse.json({
      message: "Application tracker updated successfully",
      application,
    });
  } catch (error) {
    console.error("Tracker POST error:", error);
    return NextResponse.json({ error: "Failed to update tracker" }, { status: 500 });
  }
}
