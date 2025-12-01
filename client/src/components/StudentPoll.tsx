import { useState, useEffect } from 'react';
import { getSocket, initSocket } from '../utils/socket';
import { 
	getStudentName, getSessionId, getStudentId, setStudentId 
} from '../utils/sessionStorage';
import type { Poll, PollResults as PollResultsType } from '../types';
import StudentWaiting from './StudentWaiting';
import PollResults from './PollResults';

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
		return (
			<div className="min-h-screen flex items-center justify-center p-5 bg-gray-50">
				<div className="w-full max-w-2xl bg-white rounded-xl p-16 shadow-sm text-center">
					<div className="flex gap-2">
						<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12.1296 8.5898C12.1308 8.79582 12.0682 8.99715 11.9503 9.1661C11.8324 9.33504 11.665 9.46328 11.4712 9.53317L8.20912 10.7332L7.00907 13.9933C6.9381 14.1865 6.80954 14.3533 6.64074 14.4711C6.47194 14.589 6.27105 14.6522 6.0652 14.6522C5.85935 14.6522 5.65846 14.589 5.48966 14.4711C5.32087 14.3533 5.1923 14.1865 5.12133 13.9933L3.91876 10.7373L0.658172 9.53721C0.465109 9.46614 0.298491 9.33757 0.180797 9.16883C0.0631039 9.0001 0 8.79932 0 8.59359C0 8.38787 0.0631039 8.18709 0.180797 8.01835C0.298491 7.84962 0.465109 7.72104 0.658172 7.64998L3.92028 6.44993L5.12032 3.19035C5.19139 2.99729 5.31996 2.83067 5.4887 2.71298C5.65743 2.59529 5.85821 2.53218 6.06394 2.53218C6.26966 2.53218 6.47044 2.59529 6.63918 2.71298C6.80791 2.83067 6.93649 2.99729 7.00755 3.19035L8.2076 6.45246L11.4672 7.6525C11.6608 7.72138 11.8283 7.84841 11.9469 8.0162C12.0655 8.18399 12.1293 8.38434 12.1296 8.5898ZM8.59262 2.52641H9.60319V3.53698C9.60319 3.67099 9.65642 3.79951 9.75118 3.89427C9.84594 3.98903 9.97446 4.04226 10.1085 4.04226C10.2425 4.04226 10.371 3.98903 10.4658 3.89427C10.5605 3.79951 10.6138 3.67099 10.6138 3.53698V2.52641H11.6243C11.7583 2.52641 11.8868 2.47318 11.9816 2.37842C12.0764 2.28366 12.1296 2.15514 12.1296 2.02113C12.1296 1.88712 12.0764 1.7586 11.9816 1.66384C11.8868 1.56908 11.7583 1.51585 11.6243 1.51585H10.6138V0.505283C10.6138 0.371273 10.5605 0.242753 10.4658 0.147994C10.371 0.053235 10.2425 0 10.1085 0C9.97446 0 9.84594 0.053235 9.75118 0.147994C9.65642 0.242753 9.60319 0.371273 9.60319 0.505283V1.51585H8.59262C8.45862 1.51585 8.33009 1.56908 8.23533 1.66384C8.14058 1.7586 8.08734 1.88712 8.08734 2.02113C8.08734 2.15514 8.14058 2.28366 8.23533 2.37842C8.33009 2.47318 8.45862 2.52641 8.59262 2.52641ZM14.1507 4.54754H13.6454V4.04226C13.6454 3.90825 13.5922 3.77973 13.4975 3.68497C13.4027 3.59021 13.2742 3.53698 13.1402 3.53698C13.0062 3.53698 12.8776 3.59021 12.7829 3.68497C12.6881 3.77973 12.6349 3.90825 12.6349 4.04226V4.54754H12.1296C11.9956 4.54754 11.8671 4.60078 11.7723 4.69554C11.6776 4.7903 11.6243 4.91882 11.6243 5.05283C11.6243 5.18683 11.6776 5.31536 11.7723 5.41011C11.8671 5.50487 11.9956 5.55811 12.1296 5.55811H12.6349V6.06339C12.6349 6.1974 12.6881 6.32592 12.7829 6.42068C12.8776 6.51544 13.0062 6.56867 13.1402 6.56867C13.2742 6.56867 13.4027 6.51544 13.4975 6.42068C13.5922 6.32592 13.6454 6.1974 13.6454 6.06339V5.55811H14.1507C14.2847 5.55811 14.4133 5.50487 14.508 5.41011C14.6028 5.31536 14.656 5.18683 14.656 5.05283C14.656 4.91882 14.6028 4.7903 14.508 4.69554C14.4133 4.60078 14.2847 4.54754 14.1507 4.54754Z" fill="white" />
						</svg>
						<span className="inline-block bg-gradient-to-br from-[#7765DA] to-[#4F0DCE] text-white px-4 py-1.5 rounded-full text-xs font-semibold mb-5">
							InterVue
						</span>
					</div>
					<h1 className="text-3xl font-bold text-gray-900 mb-3">You've been Kicked out !</h1>
					<p className="text-sm text-gray-600">
						Looks like the teacher had removed you from the poll system. Please try again sometime
					</p>
				</div>
			</div>
		);
	}

	if (results) {
		return <PollResults results={results} role="student" />;
	}

	if (!poll) {
		return <StudentWaiting />;
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-5 bg-gray-50">
			<div className="w-full max-w-3xl bg-white rounded-xl p-12 shadow-sm">
				<div className="mb-8">
					<div className="flex items-center justify-between mb-4">
						<span className="inline-block bg-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold">
							# InterVue
						</span>
						<div className="flex items-center gap-2">
							<span className="text-sm font-semibold text-gray-900">Question 1</span>
							<span className="text-red-500 text-sm font-semibold">{formatTime(timeRemaining)}</span>
						</div>
					</div>

					<div className="bg-gray-700 text-white p-4 rounded-lg mb-6">
						<p className="text-sm font-medium">{poll.question}</p>
					</div>

					<div className="space-y-3 mb-8">
						{poll.options.map((option) => (
							<label
								key={option.id}
								className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedOption === option.id
										? 'border-purple-600 bg-purple-50'
										: 'border-gray-200 hover:border-purple-300'
									}`}
							>
								<input
									type="radio"
									name="option"
									value={option.id}
									checked={selectedOption === option.id}
									onChange={() => setSelectedOption(option.id)}
									className="w-5 h-5 text-purple-600"
									disabled={hasAnswered}
								/>
								<span className="text-sm font-medium text-gray-900">{option.text}</span>
							</label>
						))}
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
	);
};

export default StudentPoll;