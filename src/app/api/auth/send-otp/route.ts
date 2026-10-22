import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { SendOtpSchema } from "@/lib/validations";
import { getEmailService } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SendOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Generate cryptographically secure 6-digit code
    const code = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Invalidate existing unused codes for this email
    await prisma.verificationCode.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    // Store new code in database
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // Send code via transactional email service
    const emailService = getEmailService();
    await emailService.sendEmail({
      to: email,
      subject: `Your Opportunity AI Login Code: ${code}`,
      text: `Hello,\n\nYour 6-digit verification code for Opportunity AI is: ${code}\n\nThis code expires in 10 minutes.\nIf you did not request this code, you can safely ignore this email.\n\nOpportunity AI Team`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px;">
          <h2 style="color: #4338ca; margin-bottom: 8px;">Opportunity AI</h2>
          <p style="color: #475569; font-size: 15px;">Your one-time login verification code is:</p>
          <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1e1b4b;">${code}</span>
          </div>
          <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes. If you did not request this, please disregard this email.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${email}`,
      // Return code in development/test environment for easy testing & demo
      ...(process.env.NODE_ENV !== "production" ? { debugCode: code } : {}),
    });
  } catch (error) {
    console.error("send-otp error:", error);
    return NextResponse.json(
      { error: "Failed to dispatch verification code. Please try again." },
      { status: 500 }
    );
  }
}
