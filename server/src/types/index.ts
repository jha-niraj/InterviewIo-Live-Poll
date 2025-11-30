export interface CreatePollData {
    question: string;
    options: string[];
    correctAnswer: string;
    timeLimit?: number;
}

export interface SubmitAnswerData {
    studentId: string;
    pollId: string;
    optionId: string;
}

export interface StudentJoinData {
    name: string;
    sessionId: string;
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

export interface ConnectedStudent {
    id: string;
    name: string;
    sessionId: string;
    hasAnswered: boolean;
    socketId: string;
}
