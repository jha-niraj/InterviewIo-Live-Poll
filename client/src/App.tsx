import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RoleSelection from './components/RoleSelection';
import StudentNameEntry from './components/StudentNameEntry';
import StudentPoll from './components/StudentPoll';
import TeacherDashboard from './components/TeacherDashboard';
import QuizList from './components/QuizList';
import QuizCreate from './components/QuizCreate';
import QuizTake from './components/QuizTake';
import ChatPopup from './components/ChatPopup';
import { getRole } from './utils/sessionStorage';

function App() {
	const role = getRole();

	return (
		<Router>
			<Routes>
				<Route path="/" element={<RoleSelection />} />
				
				<Route path="/student/name" element={<StudentNameEntry />} />
				<Route path="/student/poll" element={<StudentPoll />} />
				
				<Route path="/teacher/create" element={<TeacherDashboard />} />
				
				<Route path="/quiz" element={<QuizList />} />
				<Route path="/quiz/create" element={<QuizCreate />} />
				<Route path="/quiz/:quizId" element={<QuizTake />} />
				
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
			{role && <ChatPopup />}
		</Router>
	);
}

export default App;