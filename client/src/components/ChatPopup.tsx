import { useState, useEffect, useRef } from 'react';
import { getSocket } from '../utils/socket';
import { getStudentName, getRole } from '../utils/sessionStorage';

interface Message {
    id: string;
    sender: string;
    text: string;
    timestamp: Date;
    role: 'teacher' | 'student';
}

interface Participant {
    id: string;
    name: string;
    sessionId: string;
    hasAnswered: boolean;
    socketId: string;
}

const ChatPopup = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat');
    const [messages, setMessages] = useState<Message[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const role = getRole();
    const currentUserName = role === 'teacher' ? 'Teacher' : getStudentName() || 'Student';

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        socket.on('chat:message', (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.on('participants:update', (data: Participant[]) => {
            setParticipants(data);
        });

        return () => {
            socket.off('chat:message');
            socket.off('participants:update');
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!newMessage.trim()) return;

        const socket = getSocket();

        const message: Message = {
            id: Date.now().toString(),
            sender: currentUserName,
            text: newMessage.trim(),
            timestamp: new Date(),
            role: role || 'student',
        };

        socket?.emit('chat:message', message);
        setNewMessage('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isMyMessage = (message: Message) => {
        return message.sender === currentUserName;
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-20 h-20 bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50"
            >
                <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M27.625 0H4.875C3.58207 0 2.34209 0.513615 1.42785 1.42785C0.513615 2.34209 0 3.58207 0 4.875V21.125C0 22.4179 0.513615 23.6579 1.42785 24.5721C2.34209 25.4864 3.58207 26 4.875 26H23.7087L29.7213 32.0288C29.8731 32.1794 30.0532 32.2985 30.2512 32.3794C30.4491 32.4603 30.6611 32.5012 30.875 32.5C31.0882 32.5055 31.2996 32.461 31.4925 32.37C31.7893 32.2481 32.0433 32.0411 32.2226 31.775C32.4019 31.509 32.4984 31.1958 32.5 30.875V4.875C32.5 3.58207 31.9864 2.34209 31.0721 1.42785C30.1579 0.513615 28.9179 0 27.625 0ZM29.25 26.9588L25.5287 23.2213C25.3769 23.0706 25.1968 22.9515 24.9988 22.8706C24.8009 22.7898 24.5889 22.7488 24.375 22.75H4.875C4.44402 22.75 4.0307 22.5788 3.72595 22.274C3.42121 21.9693 3.25 21.556 3.25 21.125V4.875C3.25 4.44402 3.42121 4.0307 3.72595 3.72595C4.0307 3.42121 4.44402 3.25 4.875 3.25H27.625C28.056 3.25 28.4693 3.42121 28.774 3.72595C29.0788 4.0307 29.25 4.44402 29.25 4.875V26.9588Z" fill="white" />
                </svg>
            </button>

            {
                isOpen && (
                    <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200">
                        <div className="bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white rounded-t-xl">
                            <div className="flex items-center justify-between p-4 pb-0">
                                <h3 className="font-semibold">Communication</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-white hover:text-gray-200 text-lg"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="flex border-b border-white/20">
                                <button
                                    onClick={() => setActiveTab('chat')}
                                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'chat'
                                        ? 'text-white border-b-2 border-white'
                                        : 'text-white/70 hover:text-white'
                                        }`}
                                >
                                    Chat
                                </button>
                                <button
                                    onClick={() => setActiveTab('participants')}
                                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'participants'
                                        ? 'text-white border-b-2 border-white'
                                        : 'text-white/70 hover:text-white'
                                        }`}
                                >
                                    Participants ({participants.length})
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            {
                                activeTab === 'chat' ? (
                                    <>
                                        <div className="flex-1 overflow-y-auto p-4 space-y-3 h-[340px]">
                                            {
                                                messages.length === 0 ? (
                                                    <div className="text-center text-gray-500 text-sm mt-8">
                                                        No messages yet. Start the conversation!
                                                    </div>
                                                ) : (
                                                    messages.map((message) => (
                                                        <div
                                                            key={message.id}
                                                            className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'
                                                                }`}
                                                        >
                                                            <div
                                                                className={`max-w-[75%] rounded-lg p-3 ${isMyMessage(message)
                                                                    ? 'bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white'
                                                                    : message.role === 'teacher'
                                                                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                                                        : 'bg-gray-100 text-gray-900'
                                                                    }`}
                                                            >
                                                                <p className="text-xs font-semibold mb-1 opacity-80">
                                                                    {message.sender}
                                                                    {message.role === 'teacher' && ' 👨‍🏫'}
                                                                </p>
                                                                <p className="text-sm leading-relaxed">{message.text}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )
                                            }
                                            <div ref={messagesEndRef} />
                                        </div>
                                        <div className="p-4 border-t border-gray-200">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    placeholder="Type a message..."
                                                    className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-600 focus:outline-none"
                                                />
                                                <button
                                                    onClick={handleSend}
                                                    disabled={!newMessage.trim()}
                                                    className="bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-md transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                                                >
                                                    Send
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-4 h-[420px] overflow-y-auto">
                                        <div className="space-y-3">
                                            {
                                                participants.length === 0 ? (
                                                    <div className="text-center text-gray-500 text-sm mt-8">
                                                        No participants yet
                                                    </div>
                                                ) : (
                                                    participants.map((participant) => (
                                                        <div
                                                            key={participant.sessionId}
                                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                                                    {participant.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {participant.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {participant.hasAnswered ? 'Answered' : 'Waiting'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {
                                                                    participant.hasAnswered && (
                                                                        <span className="text-green-500 text-sm">✓</span>
                                                                    )
                                                                }
                                                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )
                                            }
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default ChatPopup;