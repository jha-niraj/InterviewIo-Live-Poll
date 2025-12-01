import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setRole } from '../utils/sessionStorage';
import Badge from './Badge';

const RoleSelection = () => {
	const navigate = useNavigate();
	const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);

	const handleContinue = () => {
		if (selectedRole) {
			setRole(selectedRole);
			if (selectedRole === 'student') {
				navigate('/student/name');
			} else {
				navigate('/teacher/create');
			}
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-5 bg-[#F2F2F2]">
			<div className="w-full max-w-4xl rounded-xl p-16">
				<div className="flex flex-col items-center justify-center">
					<div className="mb-5">
						<Badge text="InterVue" />
					</div>
					<h1 className="text-3xl font-medium text-gray-900 mb-3">
						Welcome to the <span className='font-bold'>Live Polling System</span>
					</h1>
					<p className="text-sm text-gray-600 mb-10 max-w-2xl mx-auto">
						Please select the role that best describes you to begin using the live polling system.
					</p>
					<div className="grid grid-cols-2 gap-5 mb-10">
						<div
							className={`border-4 rounded-xl p-8 cursor-pointer transition-all text-left ${selectedRole === 'student'
								? 'border-[#1d68BD] bg-purple-50 shadow-[0_0_0_3px_rgba(124,58,237,0.1)]'
								: 'border-gray-200 hover:border-purple-600 hover:bg-purple-50/30'
								}`}
							onClick={() => setSelectedRole('student')}
						>
							<h3 className="text-lg font-semibold text-gray-900 mb-2">I'm a Student</h3>
							<p className="text-sm text-gray-600 leading-relaxed">
								Access lessons already shared out of the existing poll uploaded by teacher.
							</p>
						</div>
						<div
							className={`border-4 rounded-xl p-8 cursor-pointer transition-all text-left ${selectedRole === 'teacher'
								? 'border-[#1d68BD] bg-purple-50 shadow-[0_0_0_3px_rgba(124,58,237,0.1)]'
								: 'border-gray-200 hover:border-purple-600 hover:bg-purple-50/30'
								}`}
							onClick={() => setSelectedRole('teacher')}
						>
							<h3 className="text-lg font-semibold text-gray-900 mb-2">I'm a Teacher</h3>
							<p className="text-sm text-gray-600 leading-relaxed">
								Submit answers and view live poll results in real-time.
							</p>
						</div>
					</div>
					<button
						className="bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white px-8 py-3 rounded-3xl text-base font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
						onClick={handleContinue}
						disabled={!selectedRole}
					>
						Continue
					</button>
				</div>
			</div>
		</div>
	);
};

export default RoleSelection;