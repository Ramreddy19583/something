import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, requireAuth, COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudentProfileSchema } from "@/lib/validations";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const parsed = StudentProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Upsert student profile
    const profile = await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {
        educationLevel: data.educationLevel,
        degree: data.degree,
        fieldOfStudy: data.fieldOfStudy,
        currentYear: data.currentYear,
        graduationYear: data.graduationYear,
        gpaOrPercentage: data.gpaOrPercentage,
        country: data.country,
        stateOrCity: data.stateOrCity,
        preferredLocations: data.preferredLocations,
        remotePreference: data.remotePreference,
        preferredCategories: data.preferredCategories,
        careerGoals: data.careerGoals,
        bio: data.bio,
        onboardingCompleted: true,
      },
      create: {
        userId: user.id,
        educationLevel: data.educationLevel,
        degree: data.degree,
        fieldOfStudy: data.fieldOfStudy,
        currentYear: data.currentYear,
        graduationYear: data.graduationYear,
        gpaOrPercentage: data.gpaOrPercentage,
        country: data.country,
        stateOrCity: data.stateOrCity,
        preferredLocations: data.preferredLocations,
        remotePreference: data.remotePreference,
        preferredCategories: data.preferredCategories,
        careerGoals: data.careerGoals,
        bio: data.bio,
        onboardingCompleted: true,
      },
    });

    // Sync skills if provided
    if (data.skills) {
      // Clear existing skills for clean sync
      await prisma.userSkill.deleteMany({
        where: { profileId: profile.id },
      });

      for (const s of data.skills) {
        const skill = await prisma.skill.upsert({
          where: { name: s.name.trim() },
          update: {},
          create: { name: s.name.trim(), category: "Student Added" },
        });

        await prisma.userSkill.create({
          data: {
            profileId: profile.id,
            skillId: skill.id,
            proficiency: s.proficiency,
          },
        });
      }
    }

    const updated = await prisma.studentProfile.findUnique({
      where: { id: profile.id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: updated,
    });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

/**
 * Account Deletion & Privacy Data Export
 */
export async function DELETE() {
  try {
    const user = await requireAuth();

    // Log account deletion before cascade
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "ACCOUNT_DELETED_BY_USER",
        targetType: "User",
        targetId: user.id,
        details: `User requested permanent account deletion for ${user.email}`,
      },
    });

    // Delete user (cascade removes profile, skills, saved items, applications, reminders)
    await prisma.user.delete({
      where: { id: user.id },
    });

    const response = NextResponse.json({ message: "Account deleted permanently." });
    response.cookies.set({
      name: COOKIE_NAME,
      value: "",
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Account delete error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { action } = await req.json();

    if (action === "export") {
      const fullData = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          profile: {
            include: {
              skills: {
                include: {
                  skill: true,
                },
              },
            },
          },
          savedItems: {
            include: {
              opportunity: true,
            },
          },
          applications: {
            include: {
              opportunity: true,
              reminders: true,
            },
          },
        },
      });

      return NextResponse.json({ exportData: fullData });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Profile action error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
