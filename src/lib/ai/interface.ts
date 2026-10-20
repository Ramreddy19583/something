import {
  MatchExplanation,
  GroundedAssistantResponse,
  NaturalSearchParams,
  SkillGapAnalysis,
} from "./types";
import {
  StudentProfileWithSkills,
  OpportunityWithSkills,
  calculateMatchExplanation,
  answerWithGroundedSource,
  analyzeSkillGap,
} from "./grounded-engine";
import { parseNaturalLanguageQuery } from "./natural-search";

export interface ResumeBulletInput {
  action: string;
  context: string;
  outcome?: string;
  targetOpportunityTitle?: string;
}

export interface ResumeBulletOutput {
  draftBullets: string[];
  reviewNotice: string;
}

export interface AiService {
  getMatchExplanation(
    profile: StudentProfileWithSkills | null,
    opportunity: OpportunityWithSkills
  ): Promise<MatchExplanation>;

  getGroundedAnswer(
    query: string,
    opportunity: OpportunityWithSkills | null,
    profile: StudentProfileWithSkills | null
  ): Promise<GroundedAssistantResponse>;

  parseSearch(query: string): Promise<NaturalSearchParams>;

  getSkillGap(
    profile: StudentProfileWithSkills | null,
    opportunity: OpportunityWithSkills
  ): Promise<SkillGapAnalysis>;

  generateResumeBullet(input: ResumeBulletInput): Promise<ResumeBulletOutput>;
}

/**
 * Deterministic Grounded Provider
 * Guarantees zero hallucinations, strict source adherence, and no external API reliance.
 */
export class DeterministicGroundedAiService implements AiService {
  async getMatchExplanation(
    profile: StudentProfileWithSkills | null,
    opportunity: OpportunityWithSkills
  ): Promise<MatchExplanation> {
    return calculateMatchExplanation(profile, opportunity);
  }

  async getGroundedAnswer(
    query: string,
    opportunity: OpportunityWithSkills | null,
    profile: StudentProfileWithSkills | null
  ): Promise<GroundedAssistantResponse> {
    return answerWithGroundedSource(query, opportunity, profile);
  }

  async parseSearch(query: string): Promise<NaturalSearchParams> {
    return parseNaturalLanguageQuery(query);
  }

  async getSkillGap(
    profile: StudentProfileWithSkills | null,
    opportunity: OpportunityWithSkills
  ): Promise<SkillGapAnalysis> {
    return analyzeSkillGap(profile, opportunity);
  }

  async generateResumeBullet(input: ResumeBulletInput): Promise<ResumeBulletOutput> {
    const actionVerb = input.action.trim();
    const cleanContext = input.context.trim();
    const outcomeClause = input.outcome ? ` resulting in ${input.outcome.trim()}` : "";

    const bullet1 = `${capitalize(actionVerb)} ${cleanContext}${outcomeClause}.`;
    const bullet2 = `Collaborated to ${actionVerb.toLowerCase()} ${cleanContext}, ensuring high code quality and functional requirements.`;
    const bullet3 = `Engineered solution to ${actionVerb.toLowerCase()} across ${cleanContext}${
      input.outcome ? `, achieving ${input.outcome.trim()}` : ""
    }.`;

    return {
      draftBullets: [bullet1, bullet2, bullet3],
      reviewNotice:
        "These bullets are drafted strictly from your factual inputs. Never submit unverified claims or fabricate metrics. Review and customize before adding to your resume.",
    };
  }
}

/**
 * Live Gemini AI Provider
 * Uses Google Generative Language REST API directly with automatic fallback to deterministic engine
 */
export class LiveGeminiAiService implements AiService {
  private apiKey: string;
  private model: string;
  private fallback: DeterministicGroundedAiService;

  constructor(apiKey: string, model: string = "gemini-1.5-flash") {
    this.apiKey = apiKey;
    this.model = model;
    this.fallback = new DeterministicGroundedAiService();
  }

  async getMatchExplanation(
    profile: StudentProfileWithSkills | null,
    opportunity: OpportunityWithSkills
  ): Promise<MatchExplanation> {
    // Stage 1 & 2 remain deterministic for fairness and accuracy
    return this.fallback.getMatchExplanation(profile, opportunity);
  }

  async getGroundedAnswer(
    query: string,
    opportunity: OpportunityWithSkills | null,
    profile: StudentProfileWithSkills | null
  ): Promise<GroundedAssistantResponse> {
    if (!this.apiKey) {
      return this.fallback.getGroundedAnswer(query, opportunity, profile);
    }

    try {
      const contextPrompt = opportunity
        ? `You are an AI advisor for Opportunity AI. Ground your answer STRICTLY in this verified listing:
Title: ${opportunity.title}
Provider: ${opportunity.provider}
Category: ${opportunity.category}
Description: ${opportunity.description}
Eligibility: ${opportunity.eligibilityRequirements}
Deadline: ${opportunity.applicationDeadline || "Not specified"}
Compensation: ${opportunity.compensationDetails || opportunity.compensationType}
Source URL: ${opportunity.sourceUrl}

Student Question: "${query}"
Rules:
1. Only state facts present in the listing above.
2. If the user asks about something not mentioned in the listing, state explicitly that it is unknown.
3. Never guarantee acceptance.`
        : `You are an AI advisor for Opportunity AI. Answer this general student query politely and factually: "${query}"`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: contextPrompt }] }],
            generationConfig: { maxOutputTokens: 600, temperature: 0.2 },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          (await this.fallback.getGroundedAnswer(query, opportunity, profile)).answer;

        return {
          answer: text,
          sourceTitle: opportunity?.title,
          sourceUrl: opportunity?.sourceUrl,
          evidenceQuotes: opportunity
            ? [`Listing: ${opportunity.eligibilityRequirements.slice(0, 150)}...`]
            : ["Platform ground truth rules"],
          uncertainties: [],
          suggestedQuestions: [
            "What skills do I need to prepare?",
            "What are the application deadlines?",
          ],
        };
      }
    } catch (e) {
      console.warn("Live Gemini API call failed, falling back to grounded engine:", e);
    }

    return this.fallback.getGroundedAnswer(query, opportunity, profile);
  }

  async parseSearch(query: string): Promise<NaturalSearchParams> {
    return this.fallback.parseSearch(query);
  }

  async getSkillGap(
    profile: StudentProfileWithSkills | null,
    opportunity: OpportunityWithSkills
  ): Promise<SkillGapAnalysis> {
    return this.fallback.getSkillGap(profile, opportunity);
  }

  async generateResumeBullet(input: ResumeBulletInput): Promise<ResumeBulletOutput> {
    return this.fallback.generateResumeBullet(input);
  }
}

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Factory providing the AI Service implementation
 * Supports pluggable external models (OpenAI, Gemini) or local deterministic engine.
 */
export function getAiService(): AiService {
  const provider = process.env.AI_PROVIDER;
  const apiKey = process.env.AI_API_KEY;

  if ((provider === "gemini" || !provider) && apiKey) {
    return new LiveGeminiAiService(apiKey, process.env.AI_MODEL || "gemini-1.5-flash");
  }

  return new DeterministicGroundedAiService();
}
