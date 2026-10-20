import { z } from "zod";

export const SignUpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["STUDENT", "ADMIN"]).optional().default("STUDENT"),
});

export const LoginSchema = z.object({
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const PasswordRecoverSchema = z.object({
  email: z.string().trim().email("Invalid email address").toLowerCase(),
});

export const EducationLevelEnum = z.enum([
  "SCHOOL",
  "DIPLOMA",
  "UNDERGRADUATE",
  "POSTGRADUATE",
  "RECENT_GRADUATE",
  "OTHER",
]);

export const CategoryEnum = z.enum([
  "INTERNSHIP",
  "SCHOLARSHIP",
  "HACKATHON",
  "COMPETITION",
  "RESEARCH",
  "APPRENTICESHIP",
  "CERTIFICATION",
  "TRAINING",
  "PLACEMENT",
]);

export const RemotePreferenceEnum = z.enum([
  "REMOTE_ONLY",
  "ONSITE_ONLY",
  "HYBRID_OR_ANY",
]);

export const SkillProficiencyEnum = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
]);

export const StudentProfileSchema = z.object({
  educationLevel: EducationLevelEnum,
  degree: z.string().trim().max(100).optional().nullable(),
  fieldOfStudy: z.string().trim().max(100).optional().nullable(),
  currentYear: z.coerce.number().int().min(1).max(10).optional().nullable(),
  graduationYear: z.coerce.number().int().min(1990).max(2040).optional().nullable(),
  gpaOrPercentage: z.string().trim().max(50).optional().nullable(),
  country: z.string().trim().min(2).max(100).default("India"),
  stateOrCity: z.string().trim().max(100).optional().nullable(),
  preferredLocations: z.array(z.string().trim()).default([]),
  remotePreference: RemotePreferenceEnum.default("HYBRID_OR_ANY"),
  preferredCategories: z.array(CategoryEnum).default([]),
  careerGoals: z.array(z.string().trim()).default([]),
  bio: z.string().trim().max(1000).optional().nullable(),
  skills: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(50),
        proficiency: SkillProficiencyEnum.default("INTERMEDIATE"),
      })
    )
    .default([]),
});

export const OpportunitySchema = z.object({
  title: z.string().trim().min(3).max(255),
  provider: z.string().trim().min(2).max(255),
  category: CategoryEnum,
  description: z.string().trim().min(10),
  eligibilityRequirements: z.string().trim().min(5),
  educationRequirements: z.array(EducationLevelEnum).default([]),
  location: z.string().trim().max(255).optional().nullable(),
  isRemote: z.boolean().default(false),
  compensationType: z.enum([
    "PAID",
    "UNPAID",
    "STIPEND",
    "FUNDING",
    "PRIZE",
    "NOT_APPLICABLE",
  ]).default("NOT_APPLICABLE"),
  compensationDetails: z.string().trim().max(255).optional().nullable(),
  applicationOpenDate: z.string().datetime().optional().nullable(),
  applicationDeadline: z.string().datetime().optional().nullable(),
  sourceUrl: z.string().trim().url("Valid source URL required"),
  sourceType: z.enum([
    "OFFICIAL_PORTAL",
    "INSTITUTION",
    "GOVERNMENT_FEED",
    "VERIFIED_PARTNER",
    "MANUAL_ENTRY",
  ]).default("OFFICIAL_PORTAL"),
  verificationStatus: z.enum([
    "IMPORTED",
    "NEEDS_REVIEW",
    "VERIFIED",
    "EXPIRED",
    "WITHDRAWN",
    "SUSPICIOUS",
  ]).default("VERIFIED"),
  verificationNotes: z.string().trim().max(1000).optional().nullable(),
  isPublished: z.boolean().default(true),
  skills: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(50),
        isMandatory: z.boolean().default(false),
      })
    )
    .default([]),
});

export const ApplicationUpdateSchema = z.object({
  status: z.enum([
    "INTERESTED",
    "PREPARING",
    "APPLIED",
    "ASSESSMENT",
    "INTERVIEW",
    "ACCEPTED",
    "REJECTED",
    "WITHDRAWN",
  ]),
  notes: z.string().trim().max(5000).optional().nullable(),
  appliedDate: z.string().datetime().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
});

export const ReminderCreateSchema = z.object({
  applicationId: z.string().optional().nullable(),
  title: z.string().trim().min(2).max(255),
  dueDate: z.string().datetime(),
});

export const AiQuerySchema = z.object({
  query: z.string().trim().min(2).max(1000),
  opportunityId: z.string().optional().nullable(),
  context: z.string().trim().max(2000).optional().nullable(),
});

export const ResumeBulletSchema = z.object({
  action: z.string().trim().min(2).max(200),
  context: z.string().trim().min(2).max(300),
  outcome: z.string().trim().max(200).optional(),
  targetOpportunityTitle: z.string().optional(),
});
