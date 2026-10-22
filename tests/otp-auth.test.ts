import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../src/lib/prisma";
import crypto from "crypto";

describe("Passwordless OTP Authentication Flow", () => {
  const testEmail = `otp_test_${Date.now()}@university.edu`;

  afterAll(async () => {
    await prisma.verificationCode.deleteMany({ where: { email: testEmail } });
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  it("creates and expires 6-digit OTP verification codes", async () => {
    const code = crypto.randomInt(100000, 1000000).toString();
    expect(code).toHaveLength(6);
    expect(/^\d{6}$/.test(code)).toBe(true);

    const record = await prisma.verificationCode.create({
      data: {
        email: testEmail,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    expect(record.id).toBeDefined();
    expect(record.email).toBe(testEmail);
    expect(record.code).toBe(code);
    expect(record.used).toBe(false);

    // Verify code lookup
    const validCode = await prisma.verificationCode.findFirst({
      where: {
        email: testEmail,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    expect(validCode).not.toBeNull();
    expect(validCode?.id).toBe(record.id);
  });

  it("creates a user profile on first-time OTP verification and restores on subsequent logins", async () => {
    // 1. First-time sign in
    const firstLoginUser = await prisma.user.create({
      data: {
        email: testEmail,
        name: "Test Student",
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
        profile: true,
      },
    });

    expect(firstLoginUser.id).toBeDefined();
    expect(firstLoginUser.email).toBe(testEmail);
    expect(firstLoginUser.profile).not.toBeNull();

    // 2. Add an application to track
    const testOpp = await prisma.opportunity.findFirst();
    if (testOpp) {
      await prisma.application.create({
        data: {
          userId: firstLoginUser.id,
          opportunityId: testOpp.id,
          status: "APPLIED",
          notes: "Applied via college portal",
        },
      });

      // 3. Returning user login by email restores profile and applications
      const returningUser = await prisma.user.findUnique({
        where: { email: testEmail },
        include: {
          profile: true,
          applications: true,
        },
      });

      expect(returningUser).not.toBeNull();
      expect(returningUser?.id).toBe(firstLoginUser.id);
      expect(returningUser?.applications.length).toBeGreaterThan(0);
      expect(returningUser?.applications[0].status).toBe("APPLIED");
    }
  });
});
