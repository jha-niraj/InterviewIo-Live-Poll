import { useState, useEffect } from 'react';
import { getSocket, initSocket } from '../utils/socket';
import type { CreatePollData, PollResults as PollResultsType } from '../types';
import TeacherCreatePoll from './TeacherCreatePoll';
import PollResults from './PollResults';
import ChatPopup from './ChatPopup';
import Badge from './Badge';

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
			<div className="min-h-screen p-5 bg-[#F2F2F2]">
				<div className="max-w-5xl mx-auto">
					<div className="rounded-xl p-12">
						<div className="flex items-center justify-between mb-8">
							<h1 className="text-2xl font-medium text-gray-900">View <span className="font-bold">Poll History</span></h1>
							<button
								onClick={() => setShowHistory(false)}
								className="text-purple-600 text-sm font-semibold hover:text-purple-700"
							>
								← Back to Dashboard
							</button>
						</div>
						<div className="space-y-8">
							{
								pollHistory.map((poll, index) => (
									<div key={poll.id} className="border-b border-gray-200 pb-8 last:border-0">
										<div className="">
											<h3 className="text-sm font-semibold text-gray-900 mb-4">
												Question {index + 1}
											</h3>
										</div>
										<div className="border border-2 rounded-xl mb-4">
											<div className="bg-gradient-to-r from-[#343434] to-[#6E6E6E] text-white p-4 rounded-tl-lg rounded-tr-lg mb-4">
												<p className="text-sm font-medium">{poll.question}</p>
											</div>
											<div className="space-y-3 p-4">
												{
													poll.options.map((option: any, index: number) => {
														const count = poll.responses.filter((r: any) => r.optionId === option.id).length;
														const percentage = poll.responses.length > 0
															? (count / poll.responses.length) * 100
															: 0;

														return (
															<div key={option.id} className="relative bg-white border rounded-lg p-2 overflow-hidden">
																<div
																	className="absolute left-0 top-0 h-full bg-purple-500 rounded-lg transition-all duration-500"
																	style={{ width: `${percentage}%`, opacity: 0.3 }}
																></div>
																<div className="relative z-10 flex items-center justify-between px-1">
																	<div className="flex items-center gap-3">
																		<div className="
																		w-7 h-7 rounded-full 
																		bg-gradient-to-r from-[#8F64E1] to-[#4E377B]
																		flex items-center justify-center
																		text-white text-sm
																	">
																			{index + 1}
																		</div>
																		<span className="text-sm font-medium text-gray-900">
																			{option.text}
																		</span>
																	</div>
																	<span className="text-sm font-semibold text-gray-700">
																		{percentage.toFixed(0)}%
																	</span>
																</div>

															</div>
														);
													})
												}
											</div>
										</div>
									</div>
								))
							}
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
				<div className="min-h-screen flex items-center justify-center p-5">
					<div className="w-full max-w-3xl rounded-xl p-12">
						<div className="mb-8">
							<div className="flex items-center justify-between mb-4">
								<div className="">
									<Badge text="InterVue Poll" />
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm font-semibold text-gray-900">Live Poll</span>
									<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
								</div>
							</div>
							<div className='border border-2 rounded-xl mb-4'>
								<div className="rounded-tl-xl rounded-tr-xl bg-gradient-to-r from-[#343434] to-[#6E6E6E] text-white p-4 mb-2">
									<p className="text-sm font-medium">{activePoll.question}</p>
								</div>
								<div className="space-y-3 p-4">
									{
										activePoll.options.map((option: any, index: number) => (
											<div key={option.id} className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg">
												<div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#8F64E1] to-[#4E377B] flex items-center justify-center text-white text-sm flex-shrink-0">
													{index + 1}
												</div>
												<span className="text-sm font-medium text-gray-900">{option.text}</span>
											</div>
										))
									}
								</div>
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