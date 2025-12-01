import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../config/urls';
import { getSessionId, getStudentName } from '../utils/sessionStorage';
import { useAppDispatch } from '../store/hooks';
import { setCurrentQuiz } from '../store/quizSlice';
import Badge from './Badge';
import ChatPopup from './ChatPopup';
import PollNotification from './PollNotification';
import ErrorFallback from './ErrorFallback';

const QuizCreate = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [topic, setTopic] = useState('');
    const [level, setLevel] = useState('medium');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError('Please enter a topic');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const response = await axios.post(`${serverUrl}/quiz/generate`, {
                topic: topic.trim(),
                level,
                creatorSessionId: getSessionId(),
                creatorName: getStudentName(),
            });

            // Store quiz in Redux
            dispatch(setCurrentQuiz(response.data.quiz));

            // Navigate to quiz page
            navigate(`/quiz/${response.data.quiz.id}`);
        } catch (err) {
            let errorMessage = 'Failed to generate quiz. Please try again.';

            if (axios.isAxiosError(err)) {
                if (err.response) {
                    errorMessage = err.response.data?.message || err.response.data?.error || 'Server error occurred';
                } else if (err.request) {
                    errorMessage = 'Network error. Please check your connection.';
                }
            }

            setError(errorMessage);
            console.error('Error generating quiz:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRetry = () => {
        setError(null);
        handleGenerate();
    };

    if (error && !isGenerating) {
        return <ErrorFallback error={error} onRetry={handleRetry} />;
    }

    return (
        <>
            <div className="min-h-screen flex items-center justify-center p-5 bg-[#F2F2F2]">
                <div className="w-full max-w-2xl bg-white rounded-xl p-16 shadow-sm">
                    <div className="text-center mb-8">
                        <Badge text="InterVue" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">
                        Create Practice Quiz
                    </h1>
                    <p className="text-sm text-gray-600 mb-10 text-center">
                        Generate AI-powered MCQ questions to practice
                    </p>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Topic / Subject
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., JavaScript, Python, Data Structures"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:border-purple-600 focus:outline-none transition-colors"
                                disabled={isGenerating}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Difficulty Level
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {
                                    ['easy', 'medium', 'hard'].map((lvl) => (
                                        <button
                                            key={lvl}
                                            onClick={() => setLevel(lvl)}
                                            disabled={isGenerating}
                                            className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all ${level === lvl
                                                    ? 'bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                                        </button>
                                    ))
                                }
                            </div>
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={!topic.trim() || isGenerating}
                            className="w-full bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white px-8 py-3 rounded-3xl text-base font-semibold hover:shadow-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {
                                isGenerating ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Generating Quiz...
                                    </span>
                                ) : (
                                    'Generate Quiz (10 Questions)'
                                )
                            }
                        </button>
                        <button
                            onClick={() => navigate('/quiz')}
                            className="w-full bg-gray-200 text-gray-700 px-8 py-3 rounded-3xl text-base font-semibold hover:bg-gray-300 transition-all"
                        >
                            Back to Quiz List
                        </button>
                    </div>
                </div>
            </div>
            <PollNotification />
            <ChatPopup />
        </>
    );
};

export default QuizCreate;