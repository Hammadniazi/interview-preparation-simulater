export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type InterviewType = 'technical' | 'behavioral' | 'system-design' | 'mixed' | 'hr';

export const DIFFICULTIES: readonly Difficulty[] = ['beginner', 'intermediate', 'advanced', 'expert'];
export const INTERVIEW_TYPES: readonly InterviewType[] = ['technical', 'behavioral', 'system-design', 'mixed', 'hr'];

export const TOTAL_QUESTIONS = 10;

/** Multiple-choice payload (beginner sessions only). */
export interface McqQuestion {
  options: string[];
  correctIndex: number;
}

export interface GeneratedQuestion {
  question: string;
  mcq?: McqQuestion;
}

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string; // ISO — keeps sessions JSON-serialisable
}

export interface ScoreBreakdown {
  technicalKnowledge: number;
  communication: number;
  relevance: number;
  confidence: number;
}

export const SCORE_DIMENSIONS: { key: keyof ScoreBreakdown; label: string; short: string }[] = [
  { key: 'technicalKnowledge', label: 'Technical knowledge', short: 'Technical' },
  { key: 'communication', label: 'Communication', short: 'Communication' },
  { key: 'relevance', label: 'Relevance', short: 'Relevance' },
  { key: 'confidence', label: 'Confidence', short: 'Confidence' },
];

export interface AnswerEvaluation {
  questionIndex: number;
  question: string;
  answer: string;
  score: ScoreBreakdown;
  feedback: string;
  overallScore: number;
}

export interface InterviewConfig {
  sessionId: string;
  candidateName: string;
  jobRole: string;
  difficulty: Difficulty;
  interviewType: InterviewType;
}

export interface LearningWeek {
  week: number;
  title: string;
  topics: string[];
  resources: string[];
  goal: string;
}

export interface InterviewReport {
  sessionId: string;
  candidateName: string;
  jobRole: string;
  difficulty: Difficulty;
  interviewType: InterviewType;
  overallScore: number;
  scoreBreakdown: ScoreBreakdown;
  strengths: string[];
  weaknesses: string[];
  skillGaps: string[];
  recommendations: string[];
  learningRoadmap: LearningWeek[];
  evaluations: AnswerEvaluation[];
  completedAt: string;
}

export interface ResumeAnalysis {
  skills: string[];
  experience: string[];
  education: string[];
  suggestedQuestions: string[];
  strengths: string[];
  improvements: string[];
}

/** Compact row used by the dashboard / history list. */
export interface SessionSummary {
  id: string;
  candidateName: string;
  jobRole: string;
  difficulty: Difficulty;
  interviewType: InterviewType;
  overallScore: number;
  scoreBreakdown: ScoreBreakdown | null;
  completedAt: string;
}

export const JOB_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Software Engineer',
  'Senior Software Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'DevOps Engineer',
  'Cloud Architect',
  'Product Manager',
  'UI/UX Designer',
  'Mobile Developer (iOS)',
  'Mobile Developer (Android)',
  'React Native Developer',
  'Data Engineer',
  'Security Engineer',
  'QA Engineer',
  'Technical Lead',
  'Engineering Manager',
  'Solutions Architect',
] as const;

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

export const DIFFICULTY_HINTS: Record<Difficulty, string> = {
  beginner: 'Multiple choice, fundamentals',
  intermediate: 'Open answers, practical',
  advanced: 'Senior depth, trade-offs',
  expert: 'Architecture & leadership',
};

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  technical: 'Technical',
  behavioral: 'Behavioral',
  'system-design': 'System design',
  mixed: 'Mixed',
  hr: 'HR / culture fit',
};

export const INTERVIEW_TYPE_HINTS: Record<InterviewType, string> = {
  technical: 'Problem solving, debugging, tooling',
  behavioral: 'Past situations, STAR answers',
  'system-design': 'Architecture and scaling',
  mixed: 'Alternates technical and behavioral',
  hr: 'Motivation, values, soft skills',
};

export function isDifficulty(v: unknown): v is Difficulty {
  return typeof v === 'string' && (DIFFICULTIES as readonly string[]).includes(v);
}

export function isInterviewType(v: unknown): v is InterviewType {
  return typeof v === 'string' && (INTERVIEW_TYPES as readonly string[]).includes(v);
}
