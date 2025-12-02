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
			<div className="min-h-screen flex items-center justify-center p-5 bg-white">
				<div className="w-full max-w-3xl rounded-xl p-12">
					<div className="mb-8">
						<div className="mb-8">
							<Badge text="InterVue Poll" />
						</div>
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-start justify-start gap-6">
								<span className="text-sm font-semibold text-gray-900">Question 1</span>
								<span className="text-red-500 text-sm flex gap-2 font-semibold">
									<svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M14.3 6.09L15.21 5.19C15.3983 5.0017 15.5041 4.7463 15.5041 4.48C15.5041 4.2137 15.3983 3.9583 15.21 3.77C15.0217 3.5817 14.7663 3.47591 14.5 3.47591C14.2337 3.47591 13.9783 3.5817 13.79 3.77L12.89 4.68C11.4886 3.59585 9.76687 3.00764 7.99503 3.00764C6.22318 3.00764 4.50147 3.59585 3.10003 4.68L2.19003 3.76C2.0004 3.5717 1.74373 3.46644 1.47649 3.46737C1.20925 3.46831 0.95333 3.57537 0.765026 3.765C0.576722 3.95463 0.471462 4.2113 0.472399 4.47854C0.473337 4.74578 0.580396 5.0017 0.770026 5.19L1.69003 6.1C0.593042 7.49755 -0.00218316 9.22334 2.6229e-05 11C-0.00323946 12.2754 0.29849 13.5331 0.88005 14.6683C1.46161 15.8034 2.30614 16.783 3.34322 17.5254C4.38029 18.2679 5.57985 18.7516 6.84184 18.9362C8.10383 19.1208 9.39168 19.0011 10.598 18.5869C11.8043 18.1727 12.8941 17.4761 13.7764 16.5552C14.6588 15.6342 15.3082 14.5157 15.6705 13.2928C16.0328 12.0699 16.0974 10.7781 15.859 9.52514C15.6206 8.27219 15.0861 7.0944 14.3 6.09ZM8.00003 17C6.81334 17 5.6533 16.6481 4.6666 15.9888C3.67991 15.3295 2.91087 14.3925 2.45675 13.2961C2.00262 12.1997 1.8838 10.9933 2.11531 9.82946C2.34683 8.66557 2.91827 7.59647 3.75739 6.75736C4.5965 5.91824 5.6656 5.3468 6.82948 5.11529C7.99337 4.88378 9.19977 5.0026 10.2961 5.45672C11.3925 5.91085 12.3296 6.67988 12.9888 7.66658C13.6481 8.65327 14 9.81331 14 11C14 12.5913 13.3679 14.1174 12.2427 15.2426C11.1174 16.3679 9.59133 17 8.00003 17ZM6.00003 2H10C10.2652 2 10.5196 1.89464 10.7071 1.70711C10.8947 1.51957 11 1.26522 11 1C11 0.734784 10.8947 0.48043 10.7071 0.292893C10.5196 0.105357 10.2652 0 10 0H6.00003C5.73481 0 5.48046 0.105357 5.29292 0.292893C5.10538 0.48043 5.00003 0.734784 5.00003 1C5.00003 1.26522 5.10538 1.51957 5.29292 1.70711C5.48046 1.89464 5.73481 2 6.00003 2ZM9.00003 8C9.00003 7.73478 8.89467 7.48043 8.70713 7.29289C8.5196 7.10536 8.26524 7 8.00003 7C7.73481 7 7.48046 7.10536 7.29292 7.29289C7.10538 7.48043 7.00003 7.73478 7.00003 8V9.89C6.7736 10.0925 6.614 10.359 6.54235 10.6542C6.47069 10.9495 6.49037 11.2595 6.59877 11.5433C6.70717 11.8271 6.89918 12.0712 7.14939 12.2435C7.39961 12.4158 7.69624 12.508 8.00003 12.508C8.30381 12.508 8.60044 12.4158 8.85066 12.2435C9.10088 12.0712 9.29289 11.8271 9.40129 11.5433C9.50968 11.2595 9.52936 10.9495 9.45771 10.6542C9.38606 10.359 9.22646 10.0925 9.00003 9.89V8Z" fill="black" />
									</svg>
									{formatTime(timeRemaining)}
								</span>
							</div>
						</div>
						<div className="border border-2 rounded-xl mb-4">
							<div className="rounded-tl-xl rounded-tr-xl bg-gradient-to-r from-[#343434] to-[#6E6E6E] text-white p-4 mb-2">
								<p className="text-sm font-medium">{poll.question}</p>
							</div>
							<div className="space-y-3 p-4">
								{
									poll.options.map((option, index) => (
										<label
											key={option.id}
											className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedOption === option.id
												? 'border-purple-600 bg-purple-50'
												: 'border-gray-200 hover:border-purple-300'
												}`}
										>
											<div className="flex items-center gap-3 flex-1">
												<div className="w-5 h-5 rounded-full border-2 border-purple-600 flex items-center justify-center flex-shrink-0">
													<div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#8F64E1] to-[#4E377B] flex items-center justify-center text-white text-sm flex-shrink-0">
														{index + 1}
													</div>
												</div>
												<input
													type="radio"
													name="option"
													value={option.id}
													checked={selectedOption === option.id}
													onChange={() => setSelectedOption(option.id)}
													className="sr-only bg-[#F2F2F2]"
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
						</div>
						<button
							onClick={handleSubmit}
							disabled={!selectedOption || hasAnswered}
							className="w-fit flex items-end justify-end bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white px-8 py-3 rounded-3xl text-base font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
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