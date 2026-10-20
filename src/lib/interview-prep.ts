/**
 * Opportunity AI — Interview Preparation & Public Utility Helper
 * Provides structured interview topics, screening questions with concise model answers,
 * curated free learning resources, and Google Calendar integration.
 */

export interface CoreTopic {
  title: string;
  category: string;
  importance: string;
  keyConcepts: string[];
}

export interface ScreeningQuestion {
  question: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  modelAnswer: string;
  focusArea: string;
}

export interface CuratedResource {
  skill: string;
  title: string;
  provider: string;
  url: string;
  type: "Official Docs" | "Interactive Course" | "Handbook" | "Open Courseware";
}

export interface InterviewGuidance {
  coreTopics: CoreTopic[];
  screeningQuestions: ScreeningQuestion[];
  freeResources: CuratedResource[];
  googleCalendarUrl: string | null;
}

const RESOURCE_DATABASE: Record<string, CuratedResource> = {
  python: {
    skill: "Python",
    title: "Official Python 3 Documentation & Tutorial",
    provider: "Python Software Foundation",
    url: "https://docs.python.org/3/tutorial/",
    type: "Official Docs",
  },
  react: {
    skill: "React",
    title: "React Official Interactive Tutorial & Guide",
    provider: "React Team",
    url: "https://react.dev/learn",
    type: "Official Docs",
  },
  typescript: {
    skill: "TypeScript",
    title: "TypeScript Official Handbook",
    provider: "Microsoft",
    url: "https://www.typescriptlang.org/docs/handbook/intro.html",
    type: "Handbook",
  },
  javascript: {
    skill: "JavaScript",
    title: "MDN Web Docs — Complete JavaScript Guide",
    provider: "Mozilla Developer Network",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
    type: "Official Docs",
  },
  sql: {
    skill: "SQL",
    title: "Interactive SQL Lessons & Schema Modeling",
    provider: "SQLBolt",
    url: "https://sqlbolt.com/",
    type: "Interactive Course",
  },
  postgresql: {
    skill: "PostgreSQL",
    title: "PostgreSQL Official Tutorial & Indexing Guide",
    provider: "PostgreSQL Global Development Group",
    url: "https://www.postgresql.org/docs/current/tutorial.html",
    type: "Official Docs",
  },
  "data structures": {
    skill: "Data Structures & Algorithms",
    title: "Computer Science & DSA Learning Roadmap",
    provider: "roadmap.sh",
    url: "https://roadmap.sh/computer-science",
    type: "Handbook",
  },
  algorithms: {
    skill: "Algorithms",
    title: "Visual Algorithms & Problem Solving Patterns",
    provider: "freeCodeCamp",
    url: "https://www.freecodecamp.org/learn/coding-interview-prep/",
    type: "Interactive Course",
  },
  "machine learning": {
    skill: "Machine Learning",
    title: "Google Machine Learning Crash Course",
    provider: "Google for Developers",
    url: "https://developers.google.com/machine-learning/crash-course",
    type: "Interactive Course",
  },
  git: {
    skill: "Git & Version Control",
    title: "Pro Git Book (Complete 2nd Edition)",
    provider: "Git SCM",
    url: "https://git-scm.com/book/en/v2",
    type: "Handbook",
  },
  "system design": {
    skill: "System Design",
    title: "System Design Primer & Scalability Patterns",
    provider: "GitHub Open Source",
    url: "https://github.com/donnemartin/system-design-primer",
    type: "Handbook",
  },
  docker: {
    skill: "Docker & Containers",
    title: "Docker Official Getting Started Guide",
    provider: "Docker Inc.",
    url: "https://docs.docker.com/get-started/",
    type: "Official Docs",
  },
  research: {
    skill: "Academic Research & Writing",
    title: "Scientific Research Methodology & Publication Guide",
    provider: "MIT OpenCourseWare",
    url: "https://ocw.mit.edu/",
    type: "Open Courseware",
  },
};

export function getInterviewGuidance(opportunity: any): InterviewGuidance {
  const category = (opportunity.category || "").toUpperCase();
  const title = (opportunity.title || "").toLowerCase();
  const desc = (opportunity.description || "").toLowerCase();

  // 1. Core Topics (Top 5 based on category and skills)
  let coreTopics: CoreTopic[] = [];

  if (category === "RESEARCH" || title.includes("fellowship") || title.includes("pmrf")) {
    coreTopics = [
      {
        title: "1. Research Methodology & Literature Review",
        category: "Domain Rigor",
        importance: "Critical for articulating theoretical foundations and positioning proposed work against current state-of-the-art benchmarks.",
        keyConcepts: ["Hypothesis Formulation", "Systematic Literature Review", "Baseline Comparative Metrics"],
      },
      {
        title: "2. Mathematical & Statistical Foundations",
        category: "Fundamentals",
        importance: "Evaluators verify ability to formulate mathematical proofs, model variance, and evaluate experimental significance.",
        keyConcepts: ["Probability Distributions", "Hypothesis Testing (p-values)", "Linear Algebra & Optimization"],
      },
      {
        title: "3. Proposal Defense & Milestone Execution",
        category: "Feasibility",
        importance: "Demonstrating that the proposed multi-year study has achievable deliverables, clear contingency plans, and computational resource planning.",
        keyConcepts: ["Deliverable Roadmaps", "Resource Allocation", "Risk Mitigation Strategies"],
      },
      {
        title: "4. Experimental Validation & Reproducibility",
        category: "Engineering",
        importance: "Ensuring algorithms and experimental setups can be independently reproduced with open-source code and public datasets.",
        keyConcepts: ["Open Datasets & Benchmarks", "Ablation Studies", "A/B Hypothesis Verification"],
      },
      {
        title: "5. Academic Ethics & Communication",
        category: "Communication",
        importance: "Clarity in conveying complex findings to cross-disciplinary review panels and peer reviewers.",
        keyConcepts: ["Citation Integrity", "Publication Ethics", "Technical Presentation Skills"],
      },
    ];
  } else if (category === "SCHOLARSHIP" || category === "TRAINING") {
    coreTopics = [
      {
        title: "1. Academic Trajectory & STAR Project Defense",
        category: "Accomplishment",
        importance: "Explaining key coursework accomplishments, capstone projects, and quantitative metrics.",
        keyConcepts: ["Situation-Task-Action-Result (STAR)", "Project Architecture", "Academic Transcripts Walkthrough"],
      },
      {
        title: "2. Problem Solving & Core Technical Concepts",
        category: "Fundamentals",
        importance: "Demonstrating solid conceptual understanding of programming logic, debugging, and system flow.",
        keyConcepts: ["Algorithmic Logic", "Data Manipulation", "Code Readability"],
      },
      {
        title: "3. Leadership, Initiative & Community Impact",
        category: "Soft Skills",
        importance: "Scholarship committees prioritize candidates who actively support student communities and open knowledge.",
        keyConcepts: ["Peer Mentorship", "Student Club Leadership", "Open-Source Contributions"],
      },
      {
        title: "4. Future Vision & Career Alignment",
        category: "Vision",
        importance: "Articulating why this scholarship directly accelerates your goals and how you plan to contribute back.",
        keyConcepts: ["1-3 Year Career Roadmap", "Domain Specialization", "Impact Multiplier"],
      },
      {
        title: "5. Financial Stewardship & Need Articulation",
        category: "Preparedness",
        importance: "Clear, transparent explanation of how funding enables research, tuition, or hardware access without distraction.",
        keyConcepts: ["Budget Utilization", "Research Hardware Needs", "Transparent Narrative"],
      },
    ];
  } else {
    // Standard Engineering / Tech Internships / Hackathons / Competitions
    coreTopics = [
      {
        title: "1. Data Structures & Algorithmic Problem Solving",
        category: "Technical",
        importance: "Screening rounds evaluate time and space complexity analysis and standard data structure operations.",
        keyConcepts: ["Hash Maps & Hash Sets", "Trees & Graph Traversals (BFS/DFS)", "Two Pointers & Sliding Window", "Big-O Analysis"],
      },
      {
        title: "2. Core Language & Runtime Fundamentals",
        category: "Coding",
        importance: "In-depth understanding of memory models, asynchronous event loops, scope, and type systems in modern stacks.",
        keyConcepts: ["Async/Await & Promises", "Memory Allocation & Garbage Collection", "Type Safety & Interfaces", "OOP vs Functional"],
      },
      {
        title: "3. Web Architecture & RESTful API Design",
        category: "Architecture",
        importance: "Understanding how clients communicate with servers, error handling, status codes, and state persistence.",
        keyConcepts: ["HTTP Verbs & Idempotency", "Stateless Authentication (JWT/Cookies)", "CORS & Security Headers", "Middleware Pipelines"],
      },
      {
        title: "4. Database Modeling & Query Optimization",
        category: "Backend",
        importance: "Designing clean relational schemas, indexing strategies for read-heavy workloads, and ensuring atomic updates.",
        keyConcepts: ["Primary & Foreign Keys", "B-Tree Indexing", "Transactions (ACID)", "Query Plan Inspection"],
      },
      {
        title: "5. Behavioral STAR & Engineering Collaboration",
        category: "Culture",
        importance: "Showcasing git hygiene, resolving merge conflicts, giving code reviews, and structured debugging under pressure.",
        keyConcepts: ["STAR Method", "Cross-Functional Collaboration", "Root Cause Analysis (Post-mortems)"],
      },
    ];
  }

  // 2. Common Screening Questions with Concise Model Answers
  let screeningQuestions: ScreeningQuestion[] = [];

  if (category === "RESEARCH") {
    screeningQuestions = [
      {
        question: "How do you systematically validate that a research problem is novel and unresolved?",
        difficulty: "Intermediate",
        focusArea: "Research Rigor",
        modelAnswer:
          "I conduct a systematic literature survey across premier databases (IEEE, ACM, arXiv) spanning the last 3-5 years, synthesize existing taxonomy in a comparative matrix, and identify unaddressed assumptions, prohibitive computational costs, or lack of generalization across real-world edge cases.",
      },
      {
        question: "If your experimental results contradict your initial hypothesis, what is your next course of action?",
        difficulty: "Intermediate",
        focusArea: "Scientific Integrity",
        modelAnswer:
          "I first audit data pipelines for leaks, label noise, or distribution shifts. If data integrity holds, I perform ablation experiments to isolate individual factors. Negative results with rigorous documentation are scientifically valuable and often reveal undocumented boundary conditions.",
      },
      {
        question: "How would you explain your proposed methodology to an evaluator outside your immediate sub-field?",
        difficulty: "Beginner",
        focusArea: "Communication",
        modelAnswer:
          "I structure the response around three milestones: the real-world limitation being solved, the high-level intuition of the approach via an analogy, and the empirical metric used to verify success, avoiding hyper-specialized acronyms.",
      },
    ];
  } else if (category === "SCHOLARSHIP") {
    screeningQuestions = [
      {
        question: "Can you describe a technical obstacle you encountered in a student project and how you solved it?",
        difficulty: "Beginner",
        focusArea: "Problem Solving",
        modelAnswer:
          "In our college bus tracking application, real-time geolocation updates bogged down the database with redundant writes. I refactored the pipeline to use Redis Pub/Sub with a 5-second debounce buffer, cutting database write IOPS by 75% while keeping client maps responsive.",
      },
      {
        question: "How do you plan to use this scholarship and what impact will it have on your education?",
        difficulty: "Beginner",
        focusArea: "Impact",
        modelAnswer:
          "This scholarship will cover specialized cloud infrastructure costs and textbook fees, allowing me to focus 20 hours weekly on our assistive tech research and mentor junior students through our campus open-source initiative without financial pressure.",
      },
      {
        question: "How do you stay updated with rapid technological advancements outside your university curriculum?",
        difficulty: "Beginner",
        focusArea: "Curiosity",
        modelAnswer:
          "I read official release notes and RFCs directly, complete hands-on open-source proof-of-concepts, and participate in technical communities like GitHub and specialized Discord channels to review real production architectures.",
      },
    ];
  } else {
    // Engineering / Internship screening questions
    screeningQuestions = [
      {
        question: "How do you diagnose and resolve a severe latency spike in a web application or database query?",
        difficulty: "Intermediate",
        focusArea: "System Performance",
        modelAnswer:
          "I start by inspecting database execution plans (`EXPLAIN ANALYZE`) to look for sequential table scans and missing indexes. On the backend, I review APM flame graphs to identify blocking synchronous I/O, implement query pagination, and introduce an in-memory Redis cache with appropriate TTLs for read-heavy endpoints.",
      },
      {
        question: "Explain the difference between synchronous and asynchronous execution, and how Node/browser handles it.",
        difficulty: "Beginner",
        focusArea: "JavaScript / Systems",
        modelAnswer:
          "Synchronous code executes sequentially on the main call stack, blocking further execution until completion. Asynchronous operations offload I/O tasks to the OS or thread pool (libuv in Node.js) and push their callbacks onto the task or microtask queue once resolved, letting the single-threaded event loop remain responsive.",
      },
      {
        question: "What are the core considerations when designing a secure RESTful API endpoint for student data?",
        difficulty: "Intermediate",
        focusArea: "Security & Architecture",
        modelAnswer:
          "I enforce strict input validation using schema libraries like Zod, authenticate via secure httpOnly cookies containing signed JWTs, implement role-based access control (RBAC), enforce HTTPS with TLS 1.3, and apply rate-limiting per IP/user to prevent brute-force attacks.",
      },
      {
        question: "Tell me about a time you had a technical disagreement with a team member. How did you resolve it?",
        difficulty: "Beginner",
        focusArea: "Collaboration (STAR)",
        modelAnswer:
          "During a hackathon, a teammate preferred NoSQL while I recommended PostgreSQL for relational consistency. Instead of debating abstractly, we wrote down the data access patterns and benchmarked a 500-record query. The clear relational joins in SQL convinced both of us, and we delivered the project on time.",
      },
    ];
  }

  // 3. Skill Gap & Free Resources Helper
  const oppSkills = opportunity.skills || [];
  const freeResources: CuratedResource[] = [];
  const addedKeys = new Set<string>();

  // Add resources for opportunity skills
  for (const s of oppSkills) {
    const sName = (s.skill?.name || "").toLowerCase();
    for (const [key, res] of Object.entries(RESOURCE_DATABASE)) {
      if (sName.includes(key) && !addedKeys.has(key)) {
        freeResources.push(res);
        addedKeys.add(key);
      }
    }
  }

  // Default high-value resources if few or none matched
  if (freeResources.length < 3) {
    const fallbacks = [
      RESOURCE_DATABASE["data structures"],
      RESOURCE_DATABASE["git"],
      RESOURCE_DATABASE["python"],
      RESOURCE_DATABASE["system design"],
      RESOURCE_DATABASE["sql"],
    ];
    for (const f of fallbacks) {
      if (!addedKeys.has(f.skill.toLowerCase())) {
        freeResources.push(f);
        addedKeys.add(f.skill.toLowerCase());
        if (freeResources.length >= 4) break;
      }
    }
  }

  // 4. Google Calendar URL
  let googleCalendarUrl: string | null = null;
  if (opportunity.applicationDeadline) {
    try {
      const d = new Date(opportunity.applicationDeadline);
      // Format as YYYYMMDDTHHmmssZ
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      const dateStart = `${year}${month}${day}T090000Z`;
      const dateEnd = `${year}${month}${day}T180000Z`;

      const titleParam = encodeURIComponent(`[Deadline] ${opportunity.title}`);
      const detailsParam = encodeURIComponent(
        `Application Deadline for ${opportunity.title} by ${opportunity.provider}.\n\nOfficial Portal: ${opportunity.sourceUrl}\n\nTracked via Opportunity AI: https://something-roan.vercel.app/opportunity/${opportunity.slug || opportunity.id}`
      );
      const locationParam = encodeURIComponent(
        opportunity.isRemote ? "Remote / Online" : opportunity.location || "Online"
      );

      googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titleParam}&dates=${dateStart}/${dateEnd}&details=${detailsParam}&location=${locationParam}`;
    } catch {
      googleCalendarUrl = null;
    }
  }

  return {
    coreTopics,
    screeningQuestions,
    freeResources,
    googleCalendarUrl,
  };
}
