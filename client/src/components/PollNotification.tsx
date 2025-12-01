import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../utils/socket';

const PollNotification = () => {
    const navigate = useNavigate();
    const [showNotification, setShowNotification] = useState(false);
    const [pollQuestion, setPollQuestion] = useState('');

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        // Listen for new polls
        socket.on('poll:new', (data: any) => {
            console.log('📢 New poll received:', data);
            setPollQuestion(data.question);
            setShowNotification(true);
        });

        // Listen for poll ended
        socket.on('poll:ended', () => {
            setShowNotification(false);
        });

        return () => {
            socket.off('poll:new');
            socket.off('poll:ended');
        };
    }, []);

    const handleJoinPoll = () => {
        setShowNotification(false);
        navigate('/student/poll');
    };

    const handleDismiss = () => {
        setShowNotification(false);
    };

    if (!showNotification) return null;

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className="bg-white rounded-xl shadow-2xl border-2 border-purple-600 p-4 max-w-sm">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] rounded-full flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm">New Poll!</h3>
                            <p className="text-xs text-gray-500">Teacher posted a question</p>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-gray-400 hover:text-gray-600 text-lg"
                    >
                        ✕
                    </button>
                </div>
                <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-700 line-clamp-2">
                        {pollQuestion}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleJoinPoll}
                        className="flex-1 bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                    >
                        Join Poll
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-semibold"
                    >
                        Later
                    </button>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </div>
            </div>
        </div>
    );
};

export default PollNotification;