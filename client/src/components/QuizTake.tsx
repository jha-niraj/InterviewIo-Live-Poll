import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../config/urls';
import { getSessionId, getStudentName } from '../utils/sessionStorage';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setCurrentQuiz, clearCurrentQuiz } from '../store/quizSlice';
import Badge from './Badge';
import ChatPopup from './ChatPopup';
import PollNotification from './PollNotification';
import ErrorFallback from './ErrorFallback';

interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    order: number;
}

interface Attempt {
    id: string;
    studentName: string;
    score: number;
    totalQuestions: number;
    completedAt: Date;
}

interface Quiz {
    id: string;
    title: string;
    topic: string;
    level: string;
    createdBy?: string;
    creatorName?: string;
    createdAt?: string;
    questions: Question[];
    attempts?: Attempt[];
}

const QuizTake = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Get quiz from Redux store
    const quizFromStore = useAppSelector((state) => state.quiz.currentQuiz);

    const [quiz, setQuiz] = useState<Quiz | null>(quizFromStore);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(!quizFromStore);
    const [error, setError] = useState<string | null>(null);

    const studentName = getStudentName();
    const sessionId = getSessionId();

    const fetchQuiz = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(`${serverUrl}/quiz/${quizId}`);

            setQuiz(response.data.quiz);
            dispatch(setCurrentQuiz(response.data.quiz));
        } catch (err) {
            let errorMessage = 'Failed to load quiz. Please try again.';

            if (axios.isAxiosError(err)) {
                if (err.response) {
                    errorMessage = err.response.data?.message || err.response.data?.error || 'Server error occurred';
                } else if (err.request) {
                    errorMessage = 'Network error. Please check your connection.';
                }
            }

            setError(errorMessage);
            console.error('Error fetching quiz:', err);
        } finally {
            setLoading(false);
        }
    }, [quizId]);

    useEffect(() => {
        if (!studentName) {
            navigate('/student/name');
            return;
        }

        // Only fetch if quiz not in Redux store
        if (!quizFromStore || quizFromStore.id !== quizId) {
            fetchQuiz();
        } else {
            setQuiz(quizFromStore);
            setLoading(false);
        }

        // Cleanup: Clear quiz from store when leaving
        return () => {
            dispatch(clearCurrentQuiz());
        };
    }, [fetchQuiz]);

    const handleAnswerSelect = (answer: string) => {
        if (!quiz) return;

        const currentQuestion = quiz.questions[currentQuestionIndex];
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: answer
        }));
    };

    const handleNext = () => {
        if (!quiz) return;

        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!quiz) return;

        setIsSubmitting(true);
        setError(null);

        try {
            // Calculate score
            let correctCount = 0;
            quiz.questions.forEach(question => {
                if (answers[question.id] === question.correctAnswer) {
                    correctCount++;
                }
            });

            const finalScore = (correctCount / quiz.questions.length) * 100;
            setScore(finalScore);

            // Submit to backend
            await axios.post(`${serverUrl}/quiz/submit`, {
                quizId: quiz.id,
                sessionId,
                studentName,
                answers,
                score: finalScore,
            });

            setShowResults(true);
        } catch (err) {
            let errorMessage = 'Failed to submit quiz. Please try again.';

            if (axios.isAxiosError(err)) {
                if (err.response) {
                    errorMessage = err.response.data?.message || err.response.data?.error || 'Server error occurred';
                } else if (err.request) {
                    errorMessage = 'Network error. Please check your connection.';
                }
            }

            setError(errorMessage);
            console.error('Error submitting quiz:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetry = () => {
        setAnswers({});
        setCurrentQuestionIndex(0);
        setShowResults(false);
        setScore(0);
    };

    const handleBackToHome = () => {
        navigate('/student/poll');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-5 bg-[#F2F2F2]">
                <div className="w-full max-w-2xl bg-white rounded-xl p-16 shadow-sm">
                    <div className="text-center">
                        <div className="mb-8">
                            <Badge text="InterVue" />
                        </div>
                        <div className="mb-8">
                            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Loading niraj...
                        </h2>
                    </div>
                </div>
            </div>
        );
    }

    if (error || (!loading && !quiz)) {
        return (
            <ErrorFallback
                error={error || 'Quiz not found'}
                onRetry={fetchQuiz}
            />
        );
    }

    if (showResults && quiz) {
        const correctCount = quiz.questions.filter(
            q => answers[q.id] === q.correctAnswer
        ).length;

        return (
            <>
                <div className="min-h-screen flex items-center justify-center p-5 bg-[#F2F2F2]">
                    <div className="w-full max-w-3xl bg-white rounded-xl p-12 shadow-sm">
                        <div className="text-center mb-8">
                            <Badge text="InterVue" />
                        </div>

                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                Quiz Completed! 🎉
                            </h1>
                            <div className="mb-6">
                                <div className="text-6xl font-bold text-purple-600 mb-2">
                                    {score.toFixed(0)}%
                                </div>
                                <p className="text-gray-600">
                                    You got {correctCount} out of {quiz.questions.length} questions correct
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4 mb-8">
                            {
                                quiz.questions.map((question, index) => {
                                    const userAnswer = answers[question.id];
                                    const isCorrect = userAnswer === question.correctAnswer;

                                    return (
                                        <div
                                            key={question.id}
                                            className={`p-4 rounded-lg border-2 ${isCorrect
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-red-500 bg-red-50'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className={`text-2xl ${isCorrect ? '✅' : '❌'}`}>
                                                    {isCorrect ? '✅' : '❌'}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900 mb-2">
                                                        {index + 1}. {question.question}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Your answer: <span className="font-medium">{userAnswer || 'Not answered'}</span>
                                                    </p>
                                                    {
                                                        !isCorrect && (
                                                            <p className="text-sm text-green-600">
                                                                Correct answer: <span className="font-medium">{question.correctAnswer}</span>
                                                            </p>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={handleRetry}
                                className="flex-1 bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white px-8 py-3 rounded-3xl text-base font-semibold hover:shadow-lg transition-all"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={handleBackToHome}
                                className="flex-1 bg-gray-200 text-gray-900 px-8 py-3 rounded-3xl text-base font-semibold hover:bg-gray-300 transition-all"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
                <ChatPopup />
            </>
        );
    }

    if (!quiz) return null;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const selectedAnswer = answers[currentQuestion.id];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    // Sort attempts by score (descending)
    const sortedAttempts = quiz.attempts 
        ? [...quiz.attempts].sort((a, b) => b.score - a.score).slice(0, 5)
        : [];

    return (
        <>
            <div className="min-h-screen flex items-center justify-center p-5 bg-[#F2F2F2]">
                <div className="w-full max-w-6xl flex gap-6">
                    {/* Main Quiz Area */}
                    <div className="flex-1 bg-white rounded-xl p-12 shadow-sm">
                    <div className="mb-8 text-center">
                        <Badge text="InterVue" />
                        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
                            {quiz.title}
                        </h1>
                        <p className="text-sm text-gray-600">
                            {quiz.topic} • {quiz.level}
                        </p>
                    </div>
                    <div className="mb-8">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                            <span>{progress.toFixed(0)}% Complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            {currentQuestion.question}
                        </h2>
                        <div className="space-y-3">
                            {
                                currentQuestion.options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswerSelect(option)}
                                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedAnswer === option
                                            ? 'border-purple-600 bg-purple-50'
                                            : 'border-gray-200 hover:border-purple-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAnswer === option
                                                    ? 'border-purple-600 bg-purple-600'
                                                    : 'border-gray-300'
                                                    }`}
                                            >
                                                {
                                                    selectedAnswer === option && (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                                    )
                                                }
                                            </div>
                                            <span className="text-gray-900">{option}</span>
                                        </div>
                                    </button>
                                ))
                            }
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                            className="px-6 py-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            ← Previous
                        </button>
                        <div className="text-sm text-gray-500">
                            {Object.keys(answers).length} / {quiz.questions.length} answered
                        </div>
                        {
                            currentQuestionIndex === quiz.questions.length - 1 ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || Object.keys(answers).length !== quiz.questions.length}
                                    className="bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white px-8 py-3 rounded-3xl text-base font-semibold hover:shadow-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    disabled={!selectedAnswer}
                                    className="px-6 py-2 text-purple-600 hover:text-purple-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
                                >
                                    Next →
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Leaderboard Sidebar */}
                    <div className="w-80 bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <h3 className="text-lg font-bold text-gray-900">Leaderboard</h3>
                        </div>

                        {sortedAttempts.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-500 mb-2">No attempts yet</p>
                                <p className="text-xs text-gray-400">Be the first to complete this quiz!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {sortedAttempts.map((attempt, index) => (
                                    <div
                                        key={attempt.id}
                                        className={`p-4 rounded-lg border-2 transition-all ${
                                            index === 0
                                                ? 'border-yellow-400 bg-yellow-50'
                                                : index === 1
                                                ? 'border-gray-300 bg-gray-50'
                                                : index === 2
                                                ? 'border-orange-300 bg-orange-50'
                                                : 'border-gray-200 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                                index === 0
                                                    ? 'bg-yellow-400 text-white'
                                                    : index === 1
                                                    ? 'bg-gray-400 text-white'
                                                    : index === 2
                                                    ? 'bg-orange-400 text-white'
                                                    : 'bg-gray-200 text-gray-600'
                                            }`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {attempt.studentName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {attempt.score.toFixed(0)}% • {Math.round((attempt.score / 100) * attempt.totalQuestions)}/{attempt.totalQuestions}
                                                </p>
                                            </div>
                                            {index === 0 && (
                                                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {sortedAttempts.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <p className="text-xs text-gray-500 text-center">
                                    Top {sortedAttempts.length} of {quiz.attempts?.length || 0} attempts
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <PollNotification />
            <ChatPopup />
        </>
    );
};

export default QuizTake;