export interface CandidateProfile {
  id: string;
  name: string;
  track?: string;
  background?: string;
}

export interface FeedbackSchema {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
}

export interface InterviewRequest {
  sessionId: string;
  candidate?: CandidateProfile;
  message?: string;
}

export interface InterviewResponse {
  reply: string;
  done: boolean;
  feedback?: FeedbackSchema | null;
  questionsAsked?: number;
}

export interface ChatMessage {
  id: string;
  role: 'agent' | 'candidate';
  content: string;
  timestamp: string;
  questionNumber?: number;
}
