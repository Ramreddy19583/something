import { NextRequest, NextResponse } from "next/server";
import { getAiService } from "@/lib/ai/interface";
import { ResumeBulletSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ResumeBulletSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const ai = getAiService();
    const result = await ai.generateResumeBullet(parsed.data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Resume bullet error:", error);
    return NextResponse.json({ error: "Failed to generate resume bullets" }, { status: 500 });
  }
}
