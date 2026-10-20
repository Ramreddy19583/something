import { Category, EducationLevel, CompensationType, SourceType, VerificationStatus } from "@prisma/client";

export interface SeedOpportunity {
  title: string;
  provider: string;
  category: Category;
  description: string;
  eligibilityRequirements: string;
  educationRequirements: EducationLevel[];
  location: string;
  isRemote: boolean;
  compensationType: CompensationType;
  compensationDetails: string;
  applicationOpenDate?: Date;
  applicationDeadline?: Date;
  sourceUrl: string;
  sourceType: SourceType;
  verificationStatus: VerificationStatus;
  verificationNotes: string;
  skills: { name: string; isMandatory: boolean }[];
}

export const VERIFIED_SEED_OPPORTUNITIES: SeedOpportunity[] = [
  {
    title: "Google Summer of Code (GSoC) 2026",
    provider: "Google Open Source",
    category: "INTERNSHIP",
    description:
      "A global program focused on bringing new contributors into open source software development. Contributors work with open source mentor organizations on 12-week or extended programming projects.",
    eligibilityRequirements:
      "Must be at least 18 years old upon registration. Eligible to work in country of residence. Open to students and individuals new to open source software development.",
    educationRequirements: ["UNDERGRADUATE", "POSTGRADUATE", "RECENT_GRADUATE"],
    location: "Global / Remote",
    isRemote: true,
    compensationType: "STIPEND",
    compensationDetails: "$1,500 - $3,300 stipend depending on location purchasing power",
    applicationOpenDate: new Date("2026-03-01T00:00:00Z"),
    applicationDeadline: new Date("2026-04-15T18:00:00Z"),
    sourceUrl: "https://summerofcode.withgoogle.com/",
    sourceType: "OFFICIAL_PORTAL",
    verificationStatus: "VERIFIED",
    verificationNotes: "Verified via official Google Open Source Program portal.",
    skills: [
      { name: "Git", isMandatory: true },
      { name: "Python", isMandatory: false },
      { name: "C++", isMandatory: false },
      { name: "JavaScript", isMandatory: false },
      { name: "Open Source", isMandatory: true },
    ],
  },
  {
    title: "Prime Minister's Research Fellowship (PMRF)",
    provider: "Ministry of Education, Government of India",
    category: "RESEARCH",
    description:
      "Prestigious doctoral fellowship designed to attract meritorious talent for doctoral programs at leading institutions (IITs, IISc, IISERs) to carry out cutting-edge research in national priority areas.",
    eligibilityRequirements:
      "Citizen of India. Completed or in final year of B.Tech/Integrated M.Tech/M.Sc from eligible institutions with minimum CGPA of 8.0 on a 10-point scale, or qualified GATE score.",
    educationRequirements: ["UNDERGRADUATE", "POSTGRADUATE"],
    location: "India (IITs / IISc / NITs)",
    isRemote: false,
    compensationType: "STIPEND",
    compensationDetails: "₹70,000/mo (Years 1-2), ₹75,000/mo (Year 3), ₹80,000/mo (Years 4-5) + ₹2 Lakh/year contingency grant",
    applicationOpenDate: new Date("2026-02-01T00:00:00Z"),
    applicationDeadline: new Date("2026-05-30T23:59:00Z"),
    sourceUrl: "https://www.pmrf.in/",
    sourceType: "GOVERNMENT_FEED",
    verificationStatus: "VERIFIED",
    verificationNotes: "Verified via official National Coordination Committee PMRF portal.",
    skills: [
      { name: "Academic Research", isMandatory: true },
      { name: "Data Analysis", isMandatory: false },
      { name: "Mathematics", isMandatory: false },
      { name: "Technical Writing", isMandatory: true },
    ],
  },
  {
    title: "Smart India Hackathon (SIH) 2026 - Software Edition",
    provider: "Ministry of Education Innovation Cell & AICTE",
    category: "HACKATHON",
    description:
      "Nationwide initiative providing students with a platform to solve pressing challenges faced by government ministries, departments, industries, and non-profits.",
    eligibilityRequirements:
      "Regular undergraduate or postgraduate students from recognized colleges, universities, and technical institutes across India. Teams of 6 students with at least 1 female team member.",
    educationRequirements: ["UNDERGRADUATE", "POSTGRADUATE", "DIPLOMA"],
    location: "Pan-India Nodal Centers & Virtual Preliminary Rounds",
    isRemote: true,
    compensationType: "PRIZE",
    compensationDetails: "₹1,00,000 cash prize per problem statement winner",
    applicationOpenDate: new Date("2026-01-15T00:00:00Z"),
    applicationDeadline: new Date("2026-09-30T23:59:00Z"),
    sourceUrl: "https://www.sih.gov.in/",
    sourceType: "GOVERNMENT_FEED",
    verificationStatus: "VERIFIED",
    verificationNotes: "Verified via AICTE & MIC official SIH portal.",
    skills: [
      { name: "Full Stack Development", isMandatory: false },
      { name: "Problem Solving", isMandatory: true },
      { name: "Python", isMandatory: false },
      { name: "React", isMandatory: false },
      { name: "Team Leadership", isMandatory: false },
    ],
  },
  {
    title: "Adobe India Women in Technology Scholarship",
    provider: "Adobe Systems India",
    category: "SCHOLARSHIP",
    description:
      "Strives to recognize outstanding female students in technology and computing, supporting future leaders and role models in the tech industry.",
    eligibilityRequirements:
      "Must be a full-time female student pursuing B.Tech, M.Tech, or Dual Degree in Computer Science/Engineering in India. Minimum 1st to 3rd year at time of application.",
    educationRequirements: ["UNDERGRADUATE", "POSTGRADUATE"],
    location: "Bengaluru / Noida, India",
    isRemote: false,
    compensationType: "FUNDING",
    compensationDetails: "₹1,00,000 scholarship award towards tuition + Summer Internship interview with Adobe India",
    applicationOpenDate: new Date("2026-08-01T00:00:00Z"),
    applicationDeadline: new Date("2026-10-31T23:59:00Z"),
    sourceUrl: "https://www.adobe.com/careers/university/india/women-in-tech-scholarship.html",
    sourceType: "OFFICIAL_PORTAL",
    verificationStatus: "VERIFIED",
    verificationNotes: "Verified via Adobe University Talent Relations program.",
    skills: [
      { name: "Data Structures & Algorithms", isMandatory: true },
      { name: "Java", isMandatory: false },
      { name: "C++", isMandatory: false },
      { name: "Software Engineering", isMandatory: true },
    ],
  },
  {
    title: "ISRO VSSC Student Project & Internship Scheme",
    provider: "Vikram Sarabhai Space Centre (ISRO)",
    category: "INTERNSHIP",
    description:
      "Hands-on scientific and technical project training for college students under the guidance of senior scientists and engineers at India's primary launch vehicle research facility.",
    eligibilityRequirements:
      "Citizen of India. Regular students pursuing B.E/B.Tech (completed 6th semester) or M.E/M.Tech/M.Sc with minimum 60% marks or 6.5 CGPA in recognized university.",
    educationRequirements: ["UNDERGRADUATE", "POSTGRADUATE"],
    location: "Thiruvananthapuram, Kerala, India",
    isRemote: false,
    compensationType: "UNPAID",
    compensationDetails: "Institutional project training certificate & access to aerospace labs (unpaid)",
    applicationOpenDate: new Date("2026-01-01T00:00:00Z"),
    applicationDeadline: new Date("2026-07-31T23:59:00Z"),
    sourceUrl: "https://www.vssc.gov.in/",
    sourceType: "INSTITUTION",
    verificationStatus: "VERIFIED",
    verificationNotes: "Verified via VSSC / ISRO HRDD official training portal guidelines.",
    skills: [
      { name: "Embedded Systems", isMandatory: false },
      { name: "Signal Processing", isMandatory: false },
      { name: "Python", isMandatory: false },
      { name: "Aerospace Engineering", isMandatory: false },
    ],
  },
  {
    title: "Microsoft Learn Student Ambassadors Program",
    provider: "Microsoft",
    category: "TRAINING",
    description:
      "Global community program providing students with exclusive training, cloud credits, and mentoring to build real-world tech solutions and lead campus workshops.",
    eligibilityRequirements:
      "Enrolled full-time or part-time in an accredited higher education institution. At least 16 years old. Strong passion for technology and teaching others.",
    educationRequirements: ["UNDERGRADUATE", "POSTGRADUATE", "DIPLOMA"],
    location: "Global / Remote",
    isRemote: true,
    compensationType: "NOT_APPLICABLE",
    compensationDetails: "$150/mo Azure credits, free certification exam vouchers, Microsoft 365, LinkedIn Learning",
    applicationOpenDate: new Date("2026-01-01T00:00:00Z"),
    applicationDeadline: new Date("2026-11-30T23:59:00Z"),
    sourceUrl: "https://studentambassadors.microsoft.com/",
    sourceType: "OFFICIAL_PORTAL",
    verificationStatus: "VERIFIED",
    verificationNotes: "Verified via Microsoft Student Ambassador Developer Relations portal.",
    skills: [
      { name: "Public Speaking", isMandatory: false },
      { name: "Cloud Computing", isMandatory: false },
      { name: "Azure", isMandatory: false },
      { name: "Community Building", isMandatory: true },
    ],
  },
  {
    title: "AWS AI & ML Scholarship Program",
    provider: "Amazon Web Services (AWS) & Udacity",
    category: "SCHOLARSHIP",
    description:
      "Delivers 2,500 annual scholarships globally for students from historically underrepresented backgrounds to master foundational AI, Machine Learning, and Cloud skills.",
    eligibilityRequirements:
      "High school or undergraduate/postgraduate college students (16+ years of age). Must score eligible lap time on AWS DeepRacer Student League track.",
    educationRequirements: ["SCHOOL", "UNDERGRADUATE", "POSTGRADUATE", "DIPLOMA"],
    location: "Global / Online",
    isRemote: true,
    compensationType: "FUNDING",
    compensationDetails: "Full 100% tuition coverage for Udacity AI Programming with Python Nanodegree ($1,200 value)",
    applicationOpenDate: new Date("2026-02-01T00:00:00Z"),
    applicationDeadline: new Date("2026-05-31T23:59:00Z"),
    sourceUrl: "https://aws.amazon.com/machine-learning/scholarship/",
    sourceType: "VERIFIED_PARTNER",
    verificationStatus: "VERIFIED",
    verificationNotes: "Verified via official AWS Machine Learning Scholarship announcement.",
    skills: [
      { name: "Python", isMandatory: true },
      { name: "Machine Learning", isMandatory: false },
      { name: "AWS", isMandatory: false },
      { name: "Deep Learning", isMandatory: false },
    ],
  },
  {
    title: "Tata Crucible Campus Quiz 2026",
    provider: "Tata Group",
    category: "COMPETITION",
    description:
      "One of India's largest and most celebrated business quizzes for university students, challenging participants on business, technology, current affairs, and innovation.",
    eligibilityRequirements:
      "Full-time bonafide undergraduate or postgraduate students from recognized colleges, polytechnics, and universities across India.",
    educationRequirements: ["UNDERGRADUATE", "POSTGRADUATE", "DIPLOMA"],
    location: "Hybrid (Online prelims + Zonal/National Finals in Mumbai)",
    isRemote: true,
    compensationType: "PRIZE",
    compensationDetails: "₹2,50,000 cash prize for National Winners + regional cluster prizes",
    applicationOpenDate: new Date("2026-06-01T00:00:00Z"),
    applicationDeadline: new Date("2026-08-30T23:59:00Z"),
    sourceUrl: "https://tatacrucible.com/campus/",
    sourceType: "OFFICIAL_PORTAL",
    verificationStatus: "VERIFIED",
    verificationNotes: "Verified via official Tata Crucible Campus portal.",
    skills: [
      { name: "Business Acumen", isMandatory: true },
      { name: "General Knowledge", isMandatory: true },
      { name: "Critical Thinking", isMandatory: false },
    ],
  },
  {
    title: "National Apprenticeship Training Scheme (NATS)",
    provider: "Ministry of Education & BOAT (Government of India)",
    category: "APPRENTICESHIP",
    description:
      "One-year government-backed training program providing technical qualifications and practical on-the-job training in premier public and private sector engineering firms.",
    eligibilityRequirements:
      "Indian citizens holding an Engineering Degree or Diploma obtained within the last 3 years from an AICTE/UGC recognized university. Must not have prior work experience exceeding 1 year.",
    educationRequirements: ["DIPLOMA", "UNDERGRADUATE", "RECENT_GRADUATE"],
    location: "Pan-India Industrial Centers",
    isRemote: false,
    compensationType: "STIPEND",
    compensationDetails: "₹8,000 to ₹9,000 monthly statutory stipend with direct benefit transfer subsidy",
    applicationOpenDate: new Date("2026-01-01T00:00:00Z"),
    applicationDeadline: new Date("2026-12-31T23:59:00Z"),
    sourceUrl: "https://nats.education.gov.in/",
    sourceType: "GOVERNMENT_FEED",
    verificationStatus: "VERIFIED",
    verificationNotes: "Verified via National Apprenticeship Training Scheme (MHRD) official portal.",
    skills: [
      { name: "Technical Engineering", isMandatory: true },
      { name: "Industrial Operations", isMandatory: false },
      { name: "Safety Compliance", isMandatory: false },
    ],
  },
];
