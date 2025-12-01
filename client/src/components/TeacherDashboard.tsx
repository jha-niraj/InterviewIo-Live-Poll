import { useState, useEffect } from 'react';
import { getSocket, initSocket } from '../utils/socket';
import type { CreatePollData, PollResults as PollResultsType } from '../types';
import TeacherCreatePoll from './TeacherCreatePoll';
import PollResults from './PollResults';
import ChatPopup from './ChatPopup';

const TeacherDashboard = () => {
	const [results, setResults] = useState<PollResultsType | null>(null);
	const [participants, setParticipants] = useState<any[]>([]);
	const [showHistory, setShowHistory] = useState(false);
	const [pollHistory, setPollHistory] = useState<any[]>([]);
	const [activePoll, setActivePoll] = useState<any | null>(null);

	useEffect(() => {
		const socket = initSocket();

		// Connect as teacher
		socket.emit('teacher:connect');

		// Listen for participants update
		socket.on('participants:update', (data: any[]) => {
			setParticipants(data);
		});

		// Listen for poll updates
		socket.on('poll:update', (data: PollResultsType) => {
			setResults(data);
		});

		// Listen for poll ended
		socket.on('poll:ended', (data: PollResultsType) => {
			setResults(data);
		});

		// Listen for errors
		socket.on('error', (data: any) => {
			alert(data.message);
		});

		return () => {
			socket.off('participants:update');
			socket.off('poll:update');
			socket.off('poll:ended');
			socket.off('error');
		};
	}, []);

	const handleCreatePoll = (data: CreatePollData) => {
		const socket = getSocket();
		socket?.emit('teacher:create-poll', data);

		// Set active poll immediately to show poll view
		setActivePoll({
			question: data.question,
			options: data.options.map((opt, idx) => ({ id: idx.toString(), text: opt })),
			timeRemaining: data.timeLimit
		});
		setResults(null);
	};

	const handleStopPoll = () => {
		const socket = getSocket();
		if (results) {
			socket?.emit('teacher:stop-poll', { pollId: results.pollId });
		}
	};

	const handleAskNewQuestion = () => {
		setResults(null);
		setActivePoll(null);
	};

	const handleViewHistory = () => {
		const socket = getSocket();
		socket?.emit('teacher:get-history');

		socket?.once('poll:history', (data: any) => {
			setPollHistory(data.polls);
			setShowHistory(true);
		});
	};

	if (showHistory) {
		return (
			<div className="min-h-screen p-5 bg-gray-50">
				<div className="max-w-5xl mx-auto">
					<div className="bg-white rounded-xl p-12 shadow-sm">
						<div className="flex items-center justify-between mb-8">
							<div className="bg-[#8F64E1] flex gap-3 item-center justify-center">
								<svg width="28" height="19" viewBox="0 0 28 19" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M13.75 0C7.5 0 2.1625 3.8875 0 9.375C2.1625 14.8625 7.5 18.75 13.75 18.75C20.0063 18.75 25.3375 14.8625 27.5 9.375C25.3375 3.8875 20.0063 0 13.75 0ZM13.75 15.625C10.3 15.625 7.5 12.825 7.5 9.375C7.5 5.925 10.3 3.125 13.75 3.125C17.2 3.125 20 5.925 20 9.375C20 12.825 17.2 15.625 13.75 15.625ZM13.75 5.625C11.6812 5.625 10 7.30625 10 9.375C10 11.4438 11.6812 13.125 13.75 13.125C15.8188 13.125 17.5 11.4438 17.5 9.375C17.5 7.30625 15.8188 5.625 13.75 5.625Z" fill="white" />
								</svg>
								<h1 className="text-2xl font-bold text-gray-900">View Poll History</h1>
							</div>
							<button
								onClick={() => setShowHistory(false)}
								className="text-purple-600 text-sm font-semibold hover:text-purple-700"
							>
								← Back to Dashboard
							</button>
						</div>
						<div className="space-y-8">
							{pollHistory.map((poll, index) => (
								<div key={poll.id} className="border-b border-gray-200 pb-8 last:border-0">
									<h3 className="text-sm font-semibold text-gray-900 mb-4">
										Question {index + 1}
									</h3>
									<div className="bg-gray-700 text-white p-4 rounded-lg mb-4">
										<p className="text-sm font-medium">{poll.question}</p>
									</div>
									<div className="space-y-3">
										{poll.options.map((option: any) => {
											const count = poll.responses.filter((r: any) => r.optionId === option.id).length;
											const percentage = poll.responses.length > 0
												? (count / poll.responses.length) * 100
												: 0;

											return (
												<div key={option.id} className="relative">
													<div className="flex items-center justify-between mb-1">
														<div className="flex items-center gap-2">
															<div className="w-5 h-5 rounded-full border-2 border-purple-600 flex items-center justify-center">
																<div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>
															</div>
															<span className="text-sm font-medium text-gray-900">{option.text}</span>
														</div>
														<span className="text-sm font-semibold text-gray-900">
															{percentage.toFixed(0)}%
														</span>
													</div>
													<div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
														<div
															className="h-full bg-purple-600 transition-all duration-500"
															style={{ width: `${percentage}%` }}
														></div>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (results) {
		return (
			<>
				<PollResults
					results={results}
					role="teacher"
					participants={participants}
					onAskNewQuestion={handleAskNewQuestion}
					onStopPoll={handleStopPoll}
					onViewHistory={handleViewHistory}
				/>
				<ChatPopup />
			</>
		);
	}

	if (activePoll) {
		return (
			<>
				<div className="min-h-screen flex items-center justify-center p-5 bg-gray-50">
					<div className="w-full max-w-3xl bg-white rounded-xl p-12 shadow-sm">
						<div className="mb-8">
							<div className="flex items-center justify-between mb-4">
								<span className="inline-block bg-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold">
									# InterVue
								</span>
								<div className="flex items-center gap-2">
									<span className="text-sm font-semibold text-gray-900">Live Poll</span>
									<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
								</div>
							</div>

							<div className="bg-gray-700 text-white p-4 rounded-lg mb-6">
								<p className="text-sm font-medium">{activePoll.question}</p>
							</div>

							<div className="space-y-3 mb-8">
								{activePoll.options.map((option: any) => (
									<div key={option.id} className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg">
										<div className="w-5 h-5 rounded-full border-2 border-purple-600 flex items-center justify-center flex-shrink-0">
											<div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>
										</div>
										<span className="text-sm font-medium text-gray-900">{option.text}</span>
									</div>
								))}
							</div>

							<div className="text-center">
								<p className="text-sm text-gray-600 mb-4">
									Waiting for students to answer...
								</p>
								<p className="text-xs text-gray-500">
									{participants.filter(p => p.hasAnswered).length} / {participants.length} students answered
								</p>
							</div>
						</div>
					</div>
				</div>
				<ChatPopup />
			</>
		);
	}

	return (
		<>
			<TeacherCreatePoll onCreatePoll={handleCreatePoll} />
			<ChatPopup />
		</>
	);
};

export default TeacherDashboard;