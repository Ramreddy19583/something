import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    // Verify ownership
    const existing = await prisma.application.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden: Not your application" }, { status: 403 });
    }

    const { status, notes, appliedDate, deadline } = body;

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

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: status && validStatuses.includes(status) ? status : undefined,
        notes: notes !== undefined ? notes : undefined,
        appliedDate: appliedDate !== undefined ? (appliedDate ? new Date(appliedDate) : null) : undefined,
        deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : undefined,
      },
      include: {
        opportunity: true,
        reminders: true,
      },
    });

    return NextResponse.json({ application: updated });
  } catch (error) {
    console.error("Tracker PATCH error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const existing = await prisma.application.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.application.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Application removed from tracker" });
  } catch (error) {
    console.error("Tracker DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 });
  }
}
