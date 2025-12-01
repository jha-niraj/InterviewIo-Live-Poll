import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../config/urls';
import Badge from './Badge';
import ChatPopup from './ChatPopup';
import ErrorFallback from './ErrorFallback';

interface Quiz {
    id: string;
    title: string;
    topic: string;
    level: string;
    creatorName: string;
    createdAt: string;
    questions: any[];
    attempts: Array<{
        studentName: string;
        score: number;
        totalQuestions: number;
    }>;
}

const QuizList = () => {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await axios.get(`${serverUrl}/quiz/all`);
            setQuizzes(response.data.quizzes);
        } catch (err) {
            let errorMessage = 'Failed to load quizzes. Please try again.';
            
            if (axios.isAxiosError(err)) {
                if (err.response) {
                    errorMessage = err.response.data?.message || err.response.data?.error || 'Server error occurred';
                } else if (err.request) {
                    errorMessage = 'Network error. Please check your connection.';
                }
            }
            
            setError(errorMessage);
            console.error('Error fetching quizzes:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (error) {
        return <ErrorFallback error={error} onRetry={fetchQuizzes} />;
    }

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'easy':
                return 'bg-green-100 text-green-700';
            case 'medium':
                return 'bg-yellow-100 text-yellow-700';
            case 'hard':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <>
            <div className="min-h-screen p-5 bg-[#F2F2F2]">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white rounded-xl p-8 shadow-sm mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <Badge text="Intervue" />
                                <h1 className="text-2xl font-bold text-gray-900 mt-4">
                                    Practice Quizzes
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    Browse and practice quizzes created by your classmates
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate('/quiz/create')}
                                    className="bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white px-6 py-2 rounded-3xl text-sm font-semibold hover:shadow-lg transition-all"
                                >
                                    + Create Quiz
                                </button>
                                <button
                                    onClick={() => navigate('/student/poll')}
                                    className="text-purple-600 text-sm font-semibold hover:text-purple-700"
                                >
                                    ← Back
                                </button>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading quizzes...</p>
                            </div>
                        ) : quizzes.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600 mb-4">No quizzes available yet</p>
                                <button
                                    onClick={() => navigate('/quiz/create')}
                                    className="bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white px-6 py-2 rounded-3xl text-sm font-semibold hover:shadow-lg transition-all"
                                >
                                    Create First Quiz
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {quizzes.map((quiz) => (
                                    <div
                                        key={quiz.id}
                                        className="border-2 border-gray-200 rounded-lg p-6 hover:border-purple-600 transition-all cursor-pointer"
                                        onClick={() => navigate(`/quiz/${quiz.id}`)}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {quiz.topic}
                                            </h3>
                                            <span
                                                className={`text-xs font-semibold px-3 py-1 rounded-full ${getLevelColor(
                                                    quiz.level
                                                )}`}
                                            >
                                                {quiz.level}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-4">
                                            Created by {quiz.creatorName}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{quiz.questions.length} questions</span>
                                            <span>{quiz.attempts.length} attempts</span>
                                        </div>

                                        {quiz.attempts.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <p className="text-xs font-semibold text-gray-700 mb-2">
                                                    Top Score:
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-600">
                                                        {quiz.attempts[0].studentName}
                                                    </span>
                                                    <span className="text-xs font-semibold text-purple-600">
                                                        {quiz.attempts[0].score}/{quiz.attempts[0].totalQuestions}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ChatPopup />
        </>
    );
};

export default QuizList;
