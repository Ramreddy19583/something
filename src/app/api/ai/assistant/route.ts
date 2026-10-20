import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { answerWithGroundedSource } from "@/lib/ai/grounded-engine";
import { AiQuerySchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await req.json();

    const parsed = AiQuerySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { query, opportunityId } = parsed.data;

    let opportunity = null;
    if (opportunityId) {
      opportunity = await prisma.opportunity.findUnique({
        where: { id: opportunityId },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
        },
      });
    }

    const response = answerWithGroundedSource(query, opportunity, user?.profile || null);

    return NextResponse.json({
      query,
      response,
    });
  } catch (error) {
    console.error("AI Assistant error:", error);
    return NextResponse.json({ error: "Failed to process assistant query" }, { status: 500 });
  }
}
