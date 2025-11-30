import { useState, useEffect } from 'react';
import { getSocket, initSocket } from '../utils/socket';
import type { CreatePollData, PollResults as PollResultsType } from '../types';
import TeacherCreatePoll from './TeacherCreatePoll';
import PollResults from './PollResults';

const TeacherDashboard = () => {
	const [results, setResults] = useState<PollResultsType | null>(null);
	const [participants, setParticipants] = useState<any[]>([]);
	const [showHistory, setShowHistory] = useState(false);
	const [pollHistory, setPollHistory] = useState<any[]>([]);

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
							<h1 className="text-2xl font-bold text-gray-900">View Poll History</h1>
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
			<PollResults
				results={results}
				role="teacher"
				participants={participants}
				onAskNewQuestion={handleAskNewQuestion}
				onStopPoll={handleStopPoll}
				onViewHistory={handleViewHistory}
			/>
		);
	}

	return <TeacherCreatePoll onCreatePoll={handleCreatePoll} />;
};

export default TeacherDashboard;