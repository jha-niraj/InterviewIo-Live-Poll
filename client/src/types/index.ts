export interface Poll {
  id: string;
  question: string;
  options: Option[];
  timeLimit: number;
  timeRemaining: number;
}

export interface Option {
  id: string;
  text: string;
  count?: number;
  percentage?: number;
  isCorrect?: boolean;
}

export interface PollResults {
  pollId: string;
  question: string;
  options: OptionResult[];
  totalResponses: number;
  totalStudents: number;
  timeRemaining: number;
  status: string;
}

export interface OptionResult {
  id: string;
  text: string;
  count: number;
  percentage: number;
  isCorrect: boolean;
}

export interface Student {
  id: string;
  name: string;
  sessionId: string;
  hasAnswered: boolean;
  socketId: string;
}

export interface CreatePollData {
  question: string;
  options: string[];
  correctAnswer: string;
  timeLimit?: number;
}
