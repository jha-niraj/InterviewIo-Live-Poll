import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../config/urls';
import { getSessionId, getStudentName } from '../utils/sessionStorage';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setCurrentQuiz, clearCurrentQuiz } from '../store/quizSlice';
import Badge from './Badge';
import ChatPopup from './ChatPopup';
import ErrorFallback from './ErrorFallback';

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
    createdBy?: string;
    creatorName?: string;
    createdAt?: string;
    questions: Question[];
    attempts?: Array<{
        id: string;
        studentName: string;
        score: number;
        totalQuestions: number;
        completedAt: Date;
    }>;
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
    }, [quizId, studentName, navigate, quizFromStore, dispatch]);

    const fetchQuiz = async () => {
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
    };

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
                            Loading quiz...
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

                        {/* Results breakdown */}
                        <div className="space-y-4 mb-8">
                            {quiz.questions.map((question, index) => {
                                const userAnswer = answers[question.id];
                                const isCorrect = userAnswer === question.correctAnswer;

                                return (
                                    <div
                                        key={question.id}
                                        className={`p-4 rounded-lg border-2 ${
                                            isCorrect
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
                                                {!isCorrect && (
                                                    <p className="text-sm text-green-600">
                                                        Correct answer: <span className="font-medium">{question.correctAnswer}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
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

    return (
        <>
            <div className="min-h-screen flex items-center justify-center p-5 bg-[#F2F2F2]">
                <div className="w-full max-w-3xl bg-white rounded-xl p-12 shadow-sm">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <Badge text="InterVue" />
                        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
                            {quiz.title}
                        </h1>
                        <p className="text-sm text-gray-600">
                            {quiz.topic} • {quiz.level}
                        </p>
                    </div>

                    {/* Progress bar */}
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

                    {/* Question */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            {currentQuestion.question}
                        </h2>

                        {/* Options */}
                        <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(option)}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                        selectedAnswer === option
                                            ? 'border-purple-600 bg-purple-50'
                                            : 'border-gray-200 hover:border-purple-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                selectedAnswer === option
                                                    ? 'border-purple-600 bg-purple-600'
                                                    : 'border-gray-300'
                                            }`}
                                        >
                                            {selectedAnswer === option && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                            )}
                                        </div>
                                        <span className="text-gray-900">{option}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
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
                        )
                        }
                    </div>
                </div>
            </div>
            <ChatPopup />
        </>
    );
};

export default QuizTake;