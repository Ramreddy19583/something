import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OpportunitySchema } from "@/lib/validations";
import { canonicalizeUrl, detectDuplicate } from "@/lib/ingestion/pipeline";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const opportunities = await prisma.opportunity.findMany({
      where: status ? { verificationStatus: status as any } : undefined,
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        _count: {
          select: {
            savedBy: true,
            applications: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ opportunities });
  } catch (error: any) {
    if (error.message === "FORBIDDEN" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }
    console.error("Admin opportunities GET error:", error);
    return NextResponse.json({ error: "Failed to fetch admin opportunities" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const parsed = OpportunitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const canonical = canonicalizeUrl(data.sourceUrl);

    // Duplicate check
    const dupCheck = await detectDuplicate(canonical, data.provider, data.title);
    if (dupCheck.isDuplicate) {
      return NextResponse.json(
        { error: `Duplicate detected: ${dupCheck.reason}` },
        { status: 409 }
      );
    }

    const slug =
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      Math.random().toString(36).substring(2, 7);

    const opportunity = await prisma.opportunity.create({
      data: {
        title: data.title,
        slug,
        provider: data.provider,
        category: data.category,
        description: data.description,
        eligibilityRequirements: data.eligibilityRequirements,
        educationRequirements: data.educationRequirements,
        location: data.location,
        isRemote: data.isRemote,
        compensationType: data.compensationType,
        compensationDetails: data.compensationDetails,
        applicationOpenDate: data.applicationOpenDate ? new Date(data.applicationOpenDate) : null,
        applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null,
        sourceUrl: data.sourceUrl,
        canonicalUrl: canonical,
        sourceType: data.sourceType,
        verificationStatus: data.verificationStatus,
        verificationNotes: data.verificationNotes || "Created by administrator",
        isPublished: data.isPublished,
      },
    });

    // Add skills
    if (data.skills && data.skills.length > 0) {
      for (const sk of data.skills) {
        const skill = await prisma.skill.upsert({
          where: { name: sk.name.trim() },
          update: {},
          create: { name: sk.name.trim(), category: "Admin Ingested" },
        });

        await prisma.opportunitySkill.create({
          data: {
            opportunityId: opportunity.id,
            skillId: skill.id,
            isMandatory: sk.isMandatory,
          },
        });
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "OPPORTUNITY_CREATED_BY_ADMIN",
        targetType: "Opportunity",
        targetId: opportunity.id,
        details: JSON.stringify({ title: opportunity.title, provider: opportunity.provider }),
      },
    });

    return NextResponse.json({ message: "Opportunity created successfully", opportunity });
  } catch (error: any) {
    if (error.message === "FORBIDDEN" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Forbidden: Administrator role required" }, { status: 403 });
    }
    console.error("Admin opportunity POST error:", error);
    return NextResponse.json({ error: "Failed to create opportunity" }, { status: 500 });
  }
}
