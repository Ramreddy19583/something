import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PasswordRecoverSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PasswordRecoverSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Check user existence safely
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "PASSWORD_RECOVERY_REQUESTED",
          targetType: "User",
          targetId: user.id,
          details: `Password reset requested for ${email}`,
        },
      });
    }

    // Return generic safe message to prevent email enumeration
    return NextResponse.json({
      message:
        "If an account is associated with this email, password recovery instructions have been initiated.",
    });
  } catch (error) {
    console.error("Recover error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred." },
      { status: 500 }
    );
  }
}
