import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReminderCreateSchema } from "@/lib/validations";

export async function GET() {
  try {
    const user = await requireAuth();

    const reminders = await prisma.reminder.findMany({
      where: { userId: user.id },
      include: {
        application: {
          include: {
            opportunity: {
              select: { title: true, provider: true },
            },
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json({ reminders });
  } catch (error) {
    console.error("Reminders GET error:", error);
    return NextResponse.json({ error: "Failed to load reminders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const parsed = ReminderCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { title, dueDate, applicationId } = parsed.data;

    // Verify application ownership if specified
    if (applicationId) {
      const app = await prisma.application.findUnique({
        where: { id: applicationId },
      });
      if (!app || app.userId !== user.id) {
        return NextResponse.json({ error: "Invalid application reference" }, { status: 403 });
      }
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId: user.id,
        applicationId: applicationId || null,
        title,
        dueDate: new Date(dueDate),
        isCompleted: false,
      },
    });

    return NextResponse.json({ message: "Reminder created", reminder });
  } catch (error) {
    console.error("Reminders POST error:", error);
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { reminderId, isCompleted } = await req.json();

    if (!reminderId) {
      return NextResponse.json({ error: "reminderId is required" }, { status: 400 });
    }

    const reminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
    });

    if (!reminder || reminder.userId !== user.id) {
      return NextResponse.json({ error: "Reminder not found or forbidden" }, { status: 404 });
    }

    const updated = await prisma.reminder.update({
      where: { id: reminderId },
      data: { isCompleted: !!isCompleted },
    });

    return NextResponse.json({ reminder: updated });
  } catch (error) {
    console.error("Reminders PATCH error:", error);
    return NextResponse.json({ error: "Failed to update reminder" }, { status: 500 });
  }
}
