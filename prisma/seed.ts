import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { VERIFIED_SEED_OPPORTUNITIES } from "../src/lib/ingestion/seed-data";
import { canonicalizeUrl } from "../src/lib/ingestion/pipeline";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Opportunity AI database seeding...");

  // 1. Seed Admin User
  const adminPasswordHash = await bcrypt.hash("Admin@123456", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@opportunity.ai" },
    update: {},
    create: {
      email: "admin@opportunity.ai",
      name: "Platform Administrator",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      isEmailVerified: true,
    },
  });
  console.log(`✅ Admin user ready: ${admin.email}`);

  // 2. Seed Student User
  const studentPasswordHash = await bcrypt.hash("Student@123456", 10);
  const student = await prisma.user.upsert({
    where: { email: "student@opportunity.ai" },
    update: {},
    create: {
      email: "student@opportunity.ai",
      name: "Aarav Sharma",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      isEmailVerified: true,
    },
  });
  console.log(`✅ Student user ready: ${student.email}`);

  // 3. Seed Student Profile
  const profile = await prisma.studentProfile.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      educationLevel: "UNDERGRADUATE",
      degree: "B.Tech",
      fieldOfStudy: "Computer Science & Engineering",
      currentYear: 3,
      graduationYear: 2027,
      gpaOrPercentage: "8.6 CGPA",
      country: "India",
      stateOrCity: "Bengaluru, Karnataka",
      preferredLocations: ["Bengaluru", "Remote", "Hyderabad"],
      remotePreference: "HYBRID_OR_ANY",
      preferredCategories: ["INTERNSHIP", "HACKATHON", "RESEARCH"],
      careerGoals: ["Software Development Engineer", "Open Source Contributor", "AI Engineer"],
      bio: "Pre-final year Computer Science undergraduate interested in distributed systems, full-stack development, and open source.",
      onboardingCompleted: true,
    },
  });
  console.log(`✅ Student profile configured for: ${student.name}`);

  // 4. Seed Standard Skills
  const studentSkills = [
    { name: "Python", proficiency: "INTERMEDIATE" as const },
    { name: "React", proficiency: "INTERMEDIATE" as const },
    { name: "Git", proficiency: "ADVANCED" as const },
    { name: "TypeScript", proficiency: "INTERMEDIATE" as const },
    { name: "Data Structures & Algorithms", proficiency: "INTERMEDIATE" as const },
  ];

  for (const s of studentSkills) {
    const skill = await prisma.skill.upsert({
      where: { name: s.name },
      update: {},
      create: { name: s.name, category: "Engineering" },
    });

    await prisma.userSkill.upsert({
      where: {
        profileId_skillId: {
          profileId: profile.id,
          skillId: skill.id,
        },
      },
      update: {},
      create: {
        profileId: profile.id,
        skillId: skill.id,
        proficiency: s.proficiency,
      },
    });
  }
  console.log(`✅ Attached skills to student profile.`);

  // 5. Seed Verified Real Opportunities
  let firstOppId = "";
  for (const opp of VERIFIED_SEED_OPPORTUNITIES) {
    const canonical = canonicalizeUrl(opp.sourceUrl);
    const slug = opp.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const createdOpp = await prisma.opportunity.upsert({
      where: { slug },
      update: {},
      create: {
        title: opp.title,
        slug,
        provider: opp.provider,
        category: opp.category,
        description: opp.description,
        eligibilityRequirements: opp.eligibilityRequirements,
        educationRequirements: opp.educationRequirements,
        location: opp.location,
        isRemote: opp.isRemote,
        compensationType: opp.compensationType,
        compensationDetails: opp.compensationDetails,
        applicationOpenDate: opp.applicationOpenDate,
        applicationDeadline: opp.applicationDeadline,
        sourceUrl: opp.sourceUrl,
        canonicalUrl: canonical,
        sourceType: opp.sourceType,
        verificationStatus: opp.verificationStatus,
        verificationNotes: opp.verificationNotes,
        isPublished: true,
      },
    });

    if (!firstOppId) firstOppId = createdOpp.id;

    // Attach skills
    for (const sk of opp.skills) {
      const skill = await prisma.skill.upsert({
        where: { name: sk.name },
        update: {},
        create: { name: sk.name, category: "Technical" },
      });

      await prisma.opportunitySkill.upsert({
        where: {
          opportunityId_skillId: {
            opportunityId: createdOpp.id,
            skillId: skill.id,
          },
        },
        update: {},
        create: {
          opportunityId: createdOpp.id,
          skillId: skill.id,
          isMandatory: sk.isMandatory,
        },
      });
    }
  }
  console.log(`✅ Seeded ${VERIFIED_SEED_OPPORTUNITIES.length} verified authentic opportunities.`);

  // 6. Seed Sample Saved Opportunity & Application for demo user
  if (firstOppId) {
    await prisma.savedOpportunity.upsert({
      where: {
        userId_opportunityId: {
          userId: student.id,
          opportunityId: firstOppId,
        },
      },
      update: {},
      create: {
        userId: student.id,
        opportunityId: firstOppId,
      },
    });

    const app = await prisma.application.upsert({
      where: {
        userId_opportunityId: {
          userId: student.id,
          opportunityId: firstOppId,
        },
      },
      update: {},
      create: {
        userId: student.id,
        opportunityId: firstOppId,
        status: "PREPARING",
        deadline: new Date("2026-04-15T18:00:00Z"),
        notes: "Drafted project proposal. Reached out to mentor organization on IRC/Slack.",
      },
    });

    // Reminder
    await prisma.reminder.create({
      data: {
        userId: student.id,
        applicationId: app.id,
        title: "Submit Google Summer of Code project draft to mentor for review",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
        isCompleted: false,
      },
    });
  }

  // 7. Seed In-app Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: student.id,
        title: "Welcome to Opportunity AI",
        message: "Your personalized opportunity feed is active. We found 3 high-alignment matches for your profile.",
        type: "SYSTEM",
      },
      {
        userId: student.id,
        title: "Upcoming Deadline: Google Summer of Code",
        message: "Your saved opportunity 'Google Summer of Code' proposal deadline is approaching.",
        type: "DEADLINE_APPROACHING",
      },
    ],
  });

  // 8. Seed Audit Log for Admin Ingestion
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "INITIAL_SEED_INGESTION",
      targetType: "Database",
      targetId: "SeedBatch-001",
      details: "Initial deployment verified opportunity batch ingested.",
    },
  });

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
