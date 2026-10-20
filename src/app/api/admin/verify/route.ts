import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VerificationStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { opportunityId, status, notes } = await req.json();

    if (!opportunityId || !status) {
      return NextResponse.json(
        { error: "opportunityId and status are required" },
        { status: 400 }
      );
    }

    const validStatuses: VerificationStatus[] = [
      "IMPORTED",
      "NEEDS_REVIEW",
      "VERIFIED",
      "EXPIRED",
      "WITHDRAWN",
      "SUSPICIOUS",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const existing = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    const updated = await prisma.opportunity.update({
      where: { id: opportunityId },
      data: {
        verificationStatus: status,
        verificationNotes: notes || `Status changed from ${existing.verificationStatus} to ${status}`,
        isPublished: status === "VERIFIED",
        lastCheckedAt: new Date(),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "VERIFICATION_STATUS_CHANGED",
        targetType: "Opportunity",
        targetId: opportunityId,
        details: JSON.stringify({
          previousStatus: existing.verificationStatus,
          newStatus: status,
          notes: notes || "No note provided",
        }),
      },
    });

    return NextResponse.json({
      message: `Status updated to ${status}`,
      opportunity: updated,
    });
  } catch (error: any) {
    if (error.message === "FORBIDDEN" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Administrator privileges required" }, { status: 403 });
    }
    console.error("Admin verify POST error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
