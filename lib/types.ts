export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface GeneratedQuestion {
  question: string;
  mcqOptions?: string[]; // only for beginner difficulty
}

export type InterviewType =
  | 'technical'
  | 'behavioral'
  | 'system-design'
  | 'mixed'
  | 'hr';

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface ScoreBreakdown {
  technicalKnowledge: number;
  communication: number;
  relevance: number;
  confidence: number;
}

export interface AnswerEvaluation {
  questionIndex: number;
  question: string;
  answer: string;
  score: ScoreBreakdown;
  feedback: string;
  overallScore: number;
}

export interface InterviewSession {
  id: string;
  candidateName: string;
  jobRole: string;
  difficulty: Difficulty;
  interviewType: InterviewType;
  status: 'active' | 'completed' | 'abandoned';
  currentQuestionIndex: number;
  questions: string[];
  messages: Message[];
  evaluations: AnswerEvaluation[];
  startedAt: Date;
  completedAt?: Date;
  overallScore?: number;
  createdAt: Date;
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
  completedAt: Date;
}

export interface LearningWeek {
  week: number;
  title: string;
  topics: string[];
  resources: string[];
  goal: string;
}

export interface ResumeAnalysis {
  skills: string[];
  experience: string[];
  education: string[];
  suggestedQuestions: string[];
  strengths: string[];
  improvements: string[];
}

export interface SupabaseSession {
  id: string;
  job_role: string;
  difficulty: string;
  interview_type: string;
  overall_score: number;
  completed_at: string;
  candidate_name: string;
  status: string;
}

export interface DashboardStats {
  totalInterviews: number;
  averageScore: number;
  bestScore: number;
  improvementRate: number;
  recentSessions: SupabaseSession[];
  scoreHistory: { date: string; score: number; role: string }[];
  weakAreas: { area: string; score: number }[];
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

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  technical: 'Technical',
  behavioral: 'Behavioral',
  'system-design': 'System Design',
  mixed: 'Mixed',
  hr: 'HR / Culture Fit',
};
