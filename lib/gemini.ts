import Groq from "groq-sdk";
import {
  Difficulty,
  InterviewType,
  AnswerEvaluation,
  InterviewReport,
  LearningWeek,
  ResumeAnalysis,
  GeneratedQuestion,
} from "./types";

let _groq: Groq | null = null;
function getGroq(): Groq {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}

const MODEL = "llama-3.3-70b-versatile";

async function generate(prompt: string): Promise<string> {
  const res = await getGroq().chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1024,
  });
  return res.choices[0].message.content?.trim() ?? "";
}

export async function generateInterviewQuestion(
  jobRole: string,
  difficulty: Difficulty,
  interviewType: InterviewType,
  questionIndex: number,
  previousQuestions: string[],
): Promise<GeneratedQuestion> {
  const prev =
    previousQuestions.length > 0
      ? `Previous questions asked: ${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("; ")}. Do NOT repeat these.`
      : "";

  // Beginner: generate MCQ
  if (difficulty === "beginner") {
    const prompt = `You are a friendly interviewer testing foundational knowledge for a ${jobRole} beginner.
Generate multiple-choice question #${questionIndex + 1} of 10.
${prev}

Rules:
- Question should test basic, foundational knowledge relevant to ${jobRole}
- All 4 options must be plausible (not obviously wrong)
- Only one option is correct
- Return ONLY valid JSON, no markdown, no explanation:
{
  "question": "<the question text>",
  "options": ["<option A text>", "<option B text>", "<option C text>", "<option D text>"],
  "correct": "<A or B or C or D>"
}`;

    const text = await generate(prompt);
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      question: parsed.question,
      mcqOptions: parsed.options as string[],
    };
  }

  // Intermediate / Advanced / Expert: open-ended
  const difficultyMap = {
    beginner: "entry-level, foundational concepts",
    intermediate: "mid-level, practical application",
    advanced: "senior-level, deep expertise",
    expert: "expert-level, architectural and leadership aspects",
  };

  const typeMap = {
    technical: "technical coding/problem-solving",
    behavioral: "behavioral (STAR method)",
    "system-design": "system design and architecture",
    mixed: "mixed (alternating technical and behavioral)",
    hr: "HR/culture fit and soft skills",
  };

  const practicalGuide =
    interviewType === "technical" || interviewType === "mixed"
      ? `Question style guide (rotate through these):
- Scenario-based: "You have a production system where X is happening, how do you..."
- Coding/implementation: "How would you implement/design/build X?"
- Debugging: "A user reports Y, walk me through how you'd debug this"
- Trade-off: "Compare approach A vs B for solving X, which would you choose and why?"
- Real-world: "At your last job, how did you handle X situation?"
Avoid pure theory questions like "What is X?" or "Define X". Make them practical and applied.`
      : `Make questions scenario-based and specific, not generic definitions.`;

  const prompt = `You are a senior engineering interviewer at a top tech company (Google/Meta/Amazon level).
Generate question #${questionIndex + 1} of 10 for a ${jobRole} position.
Difficulty: ${difficultyMap[difficulty]}
Interview type: ${typeMap[interviewType]}
${prev}

${practicalGuide}

Rules:
- Return ONLY the question text, nothing else — no preamble, no labels, no numbering
- Be specific to ${jobRole} responsibilities, not generic
- Question #${questionIndex + 1}: ${questionIndex < 3 ? "warm-up level" : questionIndex < 7 ? "core competency level" : "advanced/challenging level"}
- For behavioral: use STAR-prompting ("Tell me about a time when...")
- For technical: reference real tools, frameworks, or systems relevant to ${jobRole}

Question:`;

  return { question: await generate(prompt) };
}

export async function evaluateAnswer(
  question: string,
  answer: string,
  jobRole: string,
  difficulty: Difficulty,
  interviewType: InterviewType,
): Promise<AnswerEvaluation> {
  const prompt = `You are an expert interviewer evaluating a candidate's answer for a ${jobRole} position.

Question: "${question}"
Candidate's Answer: "${answer}"
Difficulty Level: ${difficulty}
Interview Type: ${interviewType}

Evaluate the answer and return ONLY a valid JSON object (no markdown, no explanation):
{
  "scores": {
    "technicalKnowledge": <0-100>,
    "communication": <0-100>,
    "relevance": <0-100>,
    "confidence": <0-100>
  },
  "overallScore": <0-100>,
  "feedback": "<2-3 sentences of constructive, specific feedback>"
}

Scoring guide:
- technicalKnowledge: accuracy and depth of technical content
- communication: clarity, structure, and articulation
- relevance: how well the answer addresses the question
- confidence: assertiveness and conviction in the response`;

  const text = await generate(prompt);
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  const parsed = JSON.parse(cleaned);

  return {
    questionIndex: 0,
    question,
    answer,
    score: parsed.scores,
    overallScore: parsed.overallScore,
    feedback: parsed.feedback,
  };
}

export async function generateFinalReport(
  candidateName: string,
  jobRole: string,
  difficulty: Difficulty,
  interviewType: InterviewType,
  evaluations: AnswerEvaluation[],
): Promise<Omit<InterviewReport, "sessionId" | "completedAt" | "evaluations">> {
  const evalSummary = evaluations
    .map(
      (e, i) =>
        `Q${i + 1}: "${e.question}" | Score: ${e.overallScore}/100 | Feedback: ${e.feedback}`,
    )
    .join("\n");

  const avgScores = {
    technicalKnowledge: Math.round(
      evaluations.reduce((s, e) => s + e.score.technicalKnowledge, 0) /
        evaluations.length,
    ),
    communication: Math.round(
      evaluations.reduce((s, e) => s + e.score.communication, 0) /
        evaluations.length,
    ),
    relevance: Math.round(
      evaluations.reduce((s, e) => s + e.score.relevance, 0) /
        evaluations.length,
    ),
    confidence: Math.round(
      evaluations.reduce((s, e) => s + e.score.confidence, 0) /
        evaluations.length,
    ),
  };
  const overallScore = Math.round(
    Object.values(avgScores).reduce((a, b) => a + b, 0) / 4,
  );

  const prompt = `You are a senior career coach analyzing interview performance for ${candidateName} applying for ${jobRole}.

Interview Difficulty: ${difficulty}
Interview Type: ${interviewType}
Overall Score: ${overallScore}/100

Score Breakdown:
- Technical Knowledge: ${avgScores.technicalKnowledge}/100
- Communication: ${avgScores.communication}/100
- Relevance: ${avgScores.relevance}/100
- Confidence: ${avgScores.confidence}/100

Interview Performance:
${evalSummary}

Return ONLY a valid JSON object (no markdown):
{
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "skillGaps": ["<skill gap 1>", "<skill gap 2>", "<skill gap 3>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>", "<recommendation 4>"],
  "learningRoadmap": [
    {
      "week": 1,
      "title": "<week title>",
      "topics": ["<topic 1>", "<topic 2>"],
      "resources": ["<resource 1>", "<resource 2>"],
      "goal": "<measurable goal for this week>"
    }
  ]
}

Make the learning roadmap 4 weeks long with specific, actionable items tailored to the gaps identified.`;

  const text = await generate(prompt);
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  const parsed = JSON.parse(cleaned);

  return {
    candidateName,
    jobRole,
    difficulty,
    interviewType,
    overallScore,
    scoreBreakdown: avgScores,
    strengths: parsed.strengths,
    weaknesses: parsed.weaknesses,
    skillGaps: parsed.skillGaps,
    recommendations: parsed.recommendations,
    learningRoadmap: parsed.learningRoadmap as LearningWeek[],
  };
}

export async function analyzeResume(
  resumeText: string,
): Promise<ResumeAnalysis> {
  const prompt = `You are an expert technical recruiter analyzing a resume.

Resume Content:
${resumeText}

Return ONLY a valid JSON object (no markdown):
{
  "skills": ["<skill 1>", "<skill 2>"],
  "experience": ["<experience highlight 1>", "<experience highlight 2>"],
  "education": ["<education 1>"],
  "suggestedQuestions": ["<interview question 1>", "<interview question 2>", "<interview question 3>", "<interview question 4>", "<interview question 5>"],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area to improve 1>", "<area to improve 2>", "<area to improve 3>"]
}

Generate personalized interview questions based on the candidate's specific background.`;

  const text = await generate(prompt);
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned);
}
