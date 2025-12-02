import type { PollResults as PollResultsType } from '../types';
import Badge from './Badge';

interface Props {
	results: PollResultsType;
	role: 'student' | 'teacher';
	participants?: any[];
	onAskNewQuestion?: () => void;
	onStopPoll?: () => void;
	onViewHistory?: () => void;
}

const PollResults = ({ results, role, participants = [], onAskNewQuestion, onStopPoll, onViewHistory }: Props) => {
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	const isActive = results.status === 'active';

	return (
		<div className="min-h-screen flex items-center justify-center p-5 bg-[#F2F2F2]">
			<div className="w-full max-w-5xl rounded-xl p-12">
				<div className="flex items-start justify-between mb-8">
					<div className="flex-1">
						<div className="w-full flex items-center gap-4">
							<div className='w-full flex items-center justify-between'>
								<div className="">
									<Badge text="InterVue Poll" />
								</div>
								<div>
									{
										role === 'teacher' && onViewHistory && (
											<div className="border-t border-gray-200 bg-[#8F64E1] rounded-3xl p-4">
												<button
													onClick={onViewHistory}
													className="flex gap-2 text-sm font-semibold hover:text-purple-700"
												>
													<svg width="28" height="19" viewBox="0 0 28 19" fill="none" xmlns="http://www.w3.org/2000/svg">
														<path d="M13.75 0C7.5 0 2.1625 3.8875 0 9.375C2.1625 14.8625 7.5 18.75 13.75 18.75C20.0063 18.75 25.3375 14.8625 27.5 9.375C25.3375 3.8875 20.0063 0 13.75 0ZM13.75 15.625C10.3 15.625 7.5 12.825 7.5 9.375C7.5 5.925 10.3 3.125 13.75 3.125C17.2 3.125 20 5.925 20 9.375C20 12.825 17.2 15.625 13.75 15.625ZM13.75 5.625C11.6812 5.625 10 7.30625 10 9.375C10 11.4438 11.6812 13.125 13.75 13.125C15.8188 13.125 17.5 11.4438 17.5 9.375C17.5 7.30625 15.8188 5.625 13.75 5.625Z" fill="white" />
													</svg>
													<p className='text-white'>View Poll History</p>
												</button>
											</div>
										)
									}
								</div>
							</div>
							{
								role === 'teacher' && isActive && (
									<button
										onClick={onStopPoll}
										className="bg-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-purple-700 transition-colors"
									>
										Stop Poll Manually
									</button>
								)
							}
						</div>
						<div className="mb-3">
							<div className="text-black py-2 rounded-t-lg">
								<span className="text-sm font-semibold">Question</span>
								{
									isActive && (
										<span className="ml-3 text-red-400 text-sm font-semibold">
											{formatTime(results.timeRemaining)}
										</span>
									)
								}
							</div>
						</div>
						<div className="border border-2 rounded-lg mb-4">
							<div className="p-4 rounded-tl-lg  rounded-tr-lg border bg-gradient-to-r from-[#343434] to-[#6E6E6E]">
								<p className="text-sm text-white font-medium">{results.question}</p>
							</div>
							<div className="space-y-3 p-4">
								{
									results.options.map((option, index) => {
										const percentage = option.percentage.toFixed(0);

										return (
											<div key={option.id} className="relative bg-white border rounded-lg p-2 flex items-center">
												<div
													className="absolute left-0 top-0 h-full bg-[#6766D5] rounded-lg transition-all duration-500"
													style={{ width: `${percentage}%`, opacity: 0.9 }}
												></div>
												<div className="relative z-10 flex items-center justify-between w-full px-2">
													<div className="flex items-center gap-3">
														<div className="
														w-7 h-7 rounded-full 
														bg-gradient-to-r from-[#A086E6] to-[#6D54B2]
														border border-white
														flex items-center justify-center 
														text-white text-sm
													">
															{index + 1}
														</div>
														<span className="text-sm font-medium text-gray-900">{option.text}</span>
													</div>
													<span className="text-sm font-semibold text-gray-700">
														{percentage}%
													</span>
												</div>
											</div>
										);
									})
								}
							</div>
						</div>
						{
							!isActive && (
								<>
									{
										role === 'student' && (
											<p className="text-center text-sm text-gray-600 mb-4">
												Wait for the teacher to ask a new question..
											</p>
										)
									}
									{
										role === 'teacher' && onAskNewQuestion && (
											<button
												onClick={onAskNewQuestion}
												className="w-full bg-gradient-to-r from-[#8F64E1] to-[#1868BD] text-white px-8 py-3 rounded-lg text-base font-semibold hover:bg-purple-700 transition-colors"
											>
												+ Ask a new question
											</button>
										)
									}
								</>
							)
						}
					</div>
					{
						role === 'teacher' && participants && participants.length > 0 && (
							<div className="ml-8 w-64">
								<div className="border-l-2 border-gray-200 pl-6">
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-sm font-semibold text-gray-900">Participants</h3>
										<div className="flex items-center gap-1">
											<div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-semibold">
												{participants.length}
											</div>
										</div>
									</div>
									<div className="space-y-2">
										{
											participants.map((participant) => (
												<div key={participant.sessionId} className="text-sm text-gray-600">
													{participant.name}
													{participant.hasAnswered && (
														<span className="ml-2 text-green-600">✓</span>
													)}
												</div>
											))
										}
									</div>
								</div>
							</div>
						)
					}
				</div>
			</div>
		</div >
	);
};

export default PollResults;