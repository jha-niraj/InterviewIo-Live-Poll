import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setStudentName, getSessionId } from '../utils/sessionStorage';

const StudentNameEntry = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');

  const handleContinue = () => {
    if (name.trim()) {
      setStudentName(name.trim());
      getSessionId(); // Ensure session ID is generated
      navigate('/student/poll');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleContinue();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-xl p-16 shadow-sm">
        <div className="text-center">
          <span className="inline-block bg-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold mb-5">
            # InterVue
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Let's Get Started</h1>
          <p className="text-sm text-gray-600 mb-10 leading-relaxed">
            If you're a student, you'll be able to submit your answers, participate in live polls, and view how your responses compare with your classmates.
          </p>

          <div className="mb-8 text-left">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
              Enter your Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Rahul Raju"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:border-purple-600 focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          <button
            className="bg-purple-600 text-white px-8 py-3 rounded-lg text-base font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed w-full"
            onClick={handleContinue}
            disabled={!name.trim()}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentNameEntry;
