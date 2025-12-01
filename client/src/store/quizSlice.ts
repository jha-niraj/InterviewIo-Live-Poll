import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    order: number;
}

interface Quiz {
    id: string;
    title: string;
    topic: string;
    level: string;
    createdBy: string;
    creatorName: string;
    createdAt: string;
    questions: Question[];
}

interface QuizState {
    currentQuiz: Quiz | null;
}

const initialState: QuizState = {
    currentQuiz: null,
};

const quizSlice = createSlice({
    name: 'quiz',
    initialState,
    reducers: {
        setCurrentQuiz: (state, action: PayloadAction<Quiz>) => {
            state.currentQuiz = action.payload;
        },
        clearCurrentQuiz: (state) => {
            state.currentQuiz = null;
        },
    },
});

export const { setCurrentQuiz, clearCurrentQuiz } = quizSlice.actions;
export default quizSlice.reducer;