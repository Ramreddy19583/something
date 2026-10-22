import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, COOKIE_NAME } from "@/lib/auth";
import { VerifyOtpSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = VerifyOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, code } = parsed.data;

    // Check verification code
    const record = await prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired verification code. Please check and try again or request a new code." },
        { status: 400 }
      );
    }

    // Mark code as used
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { used: true },
    });

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
    });

    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      // Derive display name from email (e.g. "alex.smith@gmail.com" -> "Alex Smith")
      const localPart = email.split("@")[0];
      const derivedName = localPart
        .replace(/[._-]+/g, " ")
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ") || "Student";

      user = await prisma.user.create({
        data: {
          email,
          name: derivedName,
          role: "STUDENT",
          isEmailVerified: true,
          profile: {
            create: {
              country: "India",
              onboardingCompleted: false,
            },
          },
        },
        include: {
          profile: {
            include: {
              skills: {
                include: {
                  skill: true,
                },
              },
            },
          },
        },
      });
    } else if (!user.isEmailVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      });
    }

    // Generate JWT token
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      message: "Authentication successful",
      isNewUser,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.profile,
      },
    });

    // Establish persistent HTTP-only cookie session
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days persistent session
    });

    return response;
  } catch (error) {
    console.error("verify-otp error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while verifying code." },
      { status: 500 }
    );
  }
}
