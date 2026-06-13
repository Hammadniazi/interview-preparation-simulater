import { GoogleGenerativeAI } from '@google/generative-ai';
import { Difficulty, InterviewType, AnswerEvaluation, InterviewReport, LearningWeek, ResumeAnalysis } from './types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function getModel() {
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

export async function generateInterviewQuestion(
  jobRole: string,
  difficulty: Difficulty,
  interviewType: InterviewType,
  questionIndex: number,
  previousQuestions: string[]
): Promise<string> {
  const model = getModel();

  const difficultyMap = {
    beginner: 'entry-level, foundational concepts',
    intermediate: 'mid-level, practical application',
    advanced: 'senior-level, deep expertise',
    expert: 'expert-level, architectural and leadership aspects',
  };

  const typeMap = {
    technical: 'technical coding/problem-solving',
    behavioral: 'behavioral (STAR method)',
    'system-design': 'system design and architecture',
    mixed: 'mixed (alternating technical and behavioral)',
    hr: 'HR/culture fit and soft skills',
  };

  const prev = previousQuestions.length > 0
    ? `Previous questions asked: ${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('; ')}. Do NOT repeat these.`
    : '';

  const prompt = `You are an expert technical interviewer at a top tech company.
Generate question #${questionIndex + 1} of 10 for a ${jobRole} interview.
Difficulty: ${difficultyMap[difficulty]}
Type: ${typeMap[interviewType]}
${prev}

Rules:
- Return ONLY the question text, nothing else
- Make it specific and relevant to the role
- Progressively increase complexity across questions
- For behavioral questions, reference specific scenarios
- For technical questions, be precise about technologies

Question:`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

export async function evaluateAnswer(
  question: string,
  answer: string,
  jobRole: string,
  difficulty: Difficulty,
  interviewType: InterviewType
): Promise<AnswerEvaluation> {
  const model = getModel();

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

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Strip markdown code blocks if present
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
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
  evaluations: AnswerEvaluation[]
): Promise<Omit<InterviewReport, 'sessionId' | 'completedAt' | 'evaluations'>> {
  const model = getModel();

  const evalSummary = evaluations.map((e, i) =>
    `Q${i + 1}: "${e.question}" | Score: ${e.overallScore}/100 | Feedback: ${e.feedback}`
  ).join('\n');

  const avgScores = {
    technicalKnowledge: Math.round(evaluations.reduce((s, e) => s + e.score.technicalKnowledge, 0) / evaluations.length),
    communication: Math.round(evaluations.reduce((s, e) => s + e.score.communication, 0) / evaluations.length),
    relevance: Math.round(evaluations.reduce((s, e) => s + e.score.relevance, 0) / evaluations.length),
    confidence: Math.round(evaluations.reduce((s, e) => s + e.score.confidence, 0) / evaluations.length),
  };
  const overallScore = Math.round(Object.values(avgScores).reduce((a, b) => a + b, 0) / 4);

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

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
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

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
  const model = getModel();

  const prompt = `You are an expert technical recruiter analyzing a resume.

Resume Content:
${resumeText}

Return ONLY a valid JSON object (no markdown):
{
  "skills": ["<skill 1>", "<skill 2>", ...],
  "experience": ["<experience highlight 1>", "<experience highlight 2>", ...],
  "education": ["<education 1>", ...],
  "suggestedQuestions": ["<interview question 1>", "<interview question 2>", "<interview question 3>", "<interview question 4>", "<interview question 5>"],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area to improve 1>", "<area to improve 2>", "<area to improve 3>"]
}

Generate personalized interview questions based on the candidate's specific background.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}
