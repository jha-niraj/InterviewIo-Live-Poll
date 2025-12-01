import { useNavigate } from 'react-router-dom';
import Badge from "./Badge";
import ChatPopup from './ChatPopup';

const StudentWaiting = () => {
	const navigate = useNavigate();

	const handlePracticeQuiz = () => {
		navigate('/quiz');
	};

	return (
		<>
			<div className="min-h-screen flex items-center justify-center p-5 bg-[#F2F2F2]">
				<div className="w-full max-w-2xl bg-white rounded-xl p-16 shadow-sm">
					<div className="text-center">
						<div className="mb-8">
							<Badge text="InterVue" />
						</div>
						<div className="mb-8">
							<div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
						</div>
						<h2 className="text-xl font-semibold text-gray-900 mb-4">
							Wait for the teacher to ask questions..
						</h2>
						<p className="text-sm text-gray-600 mb-8">
							While you wait, you can practice with MCQ questions
						</p>
						<button
							onClick={handlePracticeQuiz}
							className="bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white px-8 py-3 rounded-3xl text-base font-semibold hover:shadow-lg transition-all"
						>
							Practice MCQs
						</button>
					</div>
				</div>
			</div>
			<ChatPopup />
		</>
	);
};

export default StudentWaiting;