import { useState } from 'react';
import type { CreatePollData } from '../types';
import Badge from './Badge';

interface Props {
	onCreatePoll: (data: CreatePollData) => void;
}

const TeacherCreatePoll = ({ onCreatePoll }: Props) => {
	const [question, setQuestion] = useState('');
	const [options, setOptions] = useState(['', '']);
	const [correctAnswer, setCorrectAnswer] = useState('');
	const [timeLimit, setTimeLimit] = useState(60);

	const timeOptions = [
		{ value: 30, label: '30 seconds' },
		{ value: 45, label: '45 seconds' },
		{ value: 60, label: '1 minute' },
		{ value: 90, label: '1.5 minutes' },
		{ value: 120, label: '2 minutes' },
		{ value: 180, label: '3 minutes' },
		{ value: 300, label: '5 minutes' },
	];

	const handleAddOption = () => {
		if (options.length < 6) {
			setOptions([...options, '']);
		}
	};

	const handleRemoveOption = (index: number) => {
		if (options.length > 2) {
			const newOptions = options.filter((_, i) => i !== index);
			setOptions(newOptions);
			// Clear correct answer if it was the removed option
			if (correctAnswer === options[index]) {
				setCorrectAnswer('');
			}
		}
	};

	const handleOptionChange = (index: number, value: string) => {
		const newOptions = [...options];
		newOptions[index] = value;
		setOptions(newOptions);
	};

	const handleSubmit = () => {
		const filledOptions = options.filter((opt) => opt.trim());

		if (!question.trim()) {
			alert('Please enter a question');
			return;
		}

		if (filledOptions.length < 2) {
			alert('Please provide at least 2 options');
			return;
		}

		if (!correctAnswer) {
			alert('Please select the correct answer');
			return;
		}

		onCreatePoll({
			question: question.trim(),
			options: filledOptions,
			correctAnswer,
			timeLimit,
		});

		// Reset form
		setQuestion('');
		setOptions(['', '']);
		setCorrectAnswer('');
		setTimeLimit(60);
	};

	const filledOptions = options.filter((opt) => opt.trim());
	const canSubmit = question.trim() && filledOptions.length >= 2 && correctAnswer;
	const questionLength = question.length;

	return (
		<div className="min-h-screen flex items-center justify-center p-5 bg-[#F2F2F2]">
			<div className="w-full max-w-3xl bg-white rounded-xl p-12 shadow-sm">
				<div className="mb-8 text-center">
					<div className="mb-5">
						<Badge text="InterVue" />
					</div>
					<h1 className="text-3xl font-bold text-gray-900 mb-3">Let's Get Started</h1>
					<p className="text-sm text-gray-600 leading-relaxed max-w-2xl mx-auto">
						You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real time.
					</p>
				</div>

				<div className="space-y-6">
					{/* Question Input */}
					<div>
						<div className="flex items-center justify-between mb-2">
							<label className="block text-sm font-semibold text-gray-900">
								Enter your question
							</label>
							<div className="flex items-center gap-2">
								<select
									value={timeLimit}
									onChange={(e) => setTimeLimit(Number(e.target.value))}
									className="text-xs border border-gray-300 rounded px-2 py-1 focus:border-purple-600 focus:outline-none"
								>
									{timeOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
								<span className="text-red-500">⏱️</span>
							</div>
						</div>
						<input
							type="text"
							placeholder="Which planet is known as the Red Planet?"
							value={question}
							onChange={(e) => setQuestion(e.target.value)}
							maxLength={140}
							className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-600 focus:outline-none transition-colors"
						/>
						<div className="mt-2 flex justify-between items-center">
							<span className="text-xs text-gray-500">
								{questionLength}/140 characters
							</span>
							{questionLength > 120 && (
								<span className="text-xs text-orange-500">
									{140 - questionLength} characters remaining
								</span>
							)}
						</div>
					</div>

					{/* Options */}
					<div>
						<div className="flex items-center justify-between mb-4">
							<label className="block text-sm font-semibold text-gray-900">
								Answer Options
							</label>
							<label className="block text-sm font-semibold text-gray-900">
								Correct Answer?
							</label>
						</div>

						<div className="space-y-3">
							{options.map((option, index) => (
								<div key={index} className="flex items-center gap-3">
									<div className="w-5 h-5 rounded-full border-2 border-purple-600 flex items-center justify-center flex-shrink-0">
										<div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>
									</div>
									<input
										type="text"
										placeholder={`Option ${index + 1}`}
										value={option}
										onChange={(e) => handleOptionChange(index, e.target.value)}
										className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-600 focus:outline-none transition-colors"
									/>
									<div className="flex items-center gap-2">
										<label className="flex items-center gap-1 cursor-pointer">
											<input
												type="radio"
												name="correctAnswer"
												value={option}
												checked={correctAnswer === option}
												onChange={(e) => setCorrectAnswer(e.target.value)}
												disabled={!option.trim()}
												className="w-4 h-4 text-purple-600"
											/>
											<span className="text-xs text-gray-600">Yes</span>
										</label>
										<label className="flex items-center gap-1 cursor-pointer">
											<input
												type="radio"
												name={`not-correct-${index}`}
												checked={correctAnswer !== option}
												onChange={() => {}}
												disabled={!option.trim()}
												className="w-4 h-4 text-gray-400"
											/>
											<span className="text-xs text-gray-600">No</span>
										</label>
										{options.length > 2 && (
											<button
												onClick={() => handleRemoveOption(index)}
												className="text-red-500 hover:text-red-700 text-sm ml-2"
												title="Remove option"
											>
												✕
											</button>
										)}
									</div>
								</div>
							))}
						</div>

						<div className="mt-4 flex items-center justify-between">
							{options.length < 6 && (
								<button
									onClick={handleAddOption}
									className="text-purple-600 text-sm font-semibold hover:text-purple-700 transition-colors"
								>
									+ Add More Option
								</button>
							)}
							<span className="text-xs text-gray-500">
								{options.filter(opt => opt.trim()).length} of {options.length} options filled
							</span>
						</div>
					</div>

					{/* Submit Button */}
					<div className="pt-4">
						<button
							onClick={handleSubmit}
							disabled={!canSubmit}
							className="w-full bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white px-8 py-3 rounded-3xl text-base font-semibold hover:shadow-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
						>
							Ask Question
						</button>

						{!canSubmit && (
							<div className="mt-2 text-center">
								<span className="text-xs text-gray-500">
									{!question.trim() && 'Enter a question • '}
									{filledOptions.length < 2 && 'Add at least 2 options • '}
									{!correctAnswer && 'Select correct answer'}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default TeacherCreatePoll;