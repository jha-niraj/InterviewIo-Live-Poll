import { useState, useEffect } from 'react';
import { getSocket, initSocket } from '../utils/socket';
import {
	getStudentName, getSessionId, getStudentId, setStudentId
} from '../utils/sessionStorage';
import type { Poll, PollResults as PollResultsType } from '../types';
import StudentWaiting from './StudentWaiting';
import PollResults from './PollResults';
import KickedUser from './KickedUser';
import ChatPopup from './ChatPopup';
import Badge from './Badge';

const StudentPoll = () => {
	const [poll, setPoll] = useState<Poll | null>(null);
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [hasAnswered, setHasAnswered] = useState(false);
	const [results, setResults] = useState<PollResultsType | null>(null);
	const [timeRemaining, setTimeRemaining] = useState<number>(0);
	const [isKicked, setIsKicked] = useState(false);

	useEffect(() => {
		const socket = initSocket();
		const studentName = getStudentName();
		const sessionId = getSessionId();

		// Join as student
		socket.emit('student:join', { name: studentName, sessionId });

		// Listen for successful join
		socket.on('student:joined', (data: any) => {
			setStudentId(data.student.id);
		});

		// Listen for new poll
		socket.on('poll:new', (data: any) => {
			setPoll(data.poll);
			setTimeRemaining(data.poll.timeRemaining);
			setHasAnswered(false);
			setSelectedOption(null);
			setResults(null);
		});

		// Listen for poll updates
		socket.on('poll:update', (data: PollResultsType) => {
			setResults(data);
			setTimeRemaining(data.timeRemaining);
		});

		// Listen for poll ended
		socket.on('poll:ended', (data: PollResultsType) => {
			setResults(data);
			setPoll(null);
			setTimeRemaining(0);
		});

		// Listen for kicked
		socket.on('student:kicked', () => {
			setIsKicked(true);
		});

		return () => {
			socket.off('student:joined');
			socket.off('poll:new');
			socket.off('poll:update');
			socket.off('poll:ended');
			socket.off('student:kicked');
		};
	}, []);

	// Timer countdown
	useEffect(() => {
		if (timeRemaining > 0 && poll && !hasAnswered) {
			const timer = setInterval(() => {
				setTimeRemaining((prev) => Math.max(0, prev - 1));
			}, 1000);
			return () => clearInterval(timer);
		}
	}, [timeRemaining, poll, hasAnswered]);

	const handleSubmit = () => {
		if (!selectedOption || !poll) return;

		const socket = getSocket();
		const studentId = getStudentId();

		socket?.emit('student:submit-answer', {
			studentId,
			pollId: poll.id,
			optionId: selectedOption,
		});

		setHasAnswered(true);
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	if (isKicked) {
		return <KickedUser />;
	}

	if (results) {
		return <PollResults results={results} role="student" />;
	}

	if (!poll) {
		return <StudentWaiting />;
	}

	return (
		<>
			<div className="min-h-screen flex items-center justify-center p-5 bg-gray-50">
				<div className="w-full max-w-3xl bg-white rounded-xl p-12 shadow-sm">
					<div className="mb-8">
						<div className="flex items-center justify-between mb-4">
							<div className="mb-8">
								<Badge text="InterVue" />
							</div>
							<div className="flex items-center gap-2">
								<span className="text-sm font-semibold text-gray-900">Question 1</span>
								<span className="text-red-500 text-sm font-semibold">{formatTime(timeRemaining)}</span>
							</div>
						</div>
						<div className="bg-gray-700 text-white p-4 rounded-lg mb-6">
							<p className="text-sm font-medium">{poll.question}</p>
						</div>
						<div className="space-y-3 mb-8">
							{
								poll.options.map((option) => (
									<label
										key={option.id}
										className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedOption === option.id
											? 'border-purple-600 bg-purple-50'
											: 'border-gray-200 hover:border-purple-300'
											}`}
									>
										<div className="flex items-center gap-3 flex-1">
											<div className="w-5 h-5 rounded-full border-2 border-purple-600 flex items-center justify-center flex-shrink-0">
												{selectedOption === option.id && (
													<div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>
												)}
											</div>
											<input
												type="radio"
												name="option"
												value={option.id}
												checked={selectedOption === option.id}
												onChange={() => setSelectedOption(option.id)}
												className="sr-only"
												disabled={hasAnswered}
											/>
											<span className="text-sm font-medium text-gray-900">{option.text}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-xs text-gray-500">No</span>
										</div>
									</label>
								))
							}
						</div>
						<button
							onClick={handleSubmit}
							disabled={!selectedOption || hasAnswered}
							className="w-full bg-purple-600 text-white px-8 py-3 rounded-lg text-base font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
						>
							{hasAnswered ? 'Submitted' : 'Submit'}
						</button>
					</div>
				</div>
			</div>
			<ChatPopup />
		</>
	);
};

export default StudentPoll;