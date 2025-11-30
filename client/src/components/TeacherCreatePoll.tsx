import { useState } from 'react';
import type { CreatePollData } from '../types';

interface Props {
  onCreatePoll: (data: CreatePollData) => void;
}

const TeacherCreatePoll = ({ onCreatePoll }: Props) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [timeLimit, setTimeLimit] = useState(60);

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    const filledOptions = options.filter((opt) => opt.trim());
    
    if (!question.trim() || filledOptions.length < 2 || !correctAnswer) {
      alert('Please fill in all required fields');
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

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gray-50">
      <div className="w-full max-w-3xl bg-white rounded-xl p-12 shadow-sm">
        <div className="mb-8">
          <span className="inline-block bg-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold mb-5">
            # InterVue
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Let's Get Started</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real time.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-900">
                Enter your question
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">{timeLimit} seconds</span>
                <span className="text-red-500">❤️</span>
              </div>
            </div>
            <input
              type="text"
              placeholder="Rahul Raju"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-600 focus:outline-none transition-colors"
            />
            <div className="mt-2 text-right">
              <span className="text-xs text-gray-500">0/140</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-900">
                Edit Options
              </label>
              <label className="block text-sm font-semibold text-gray-900">
                Is it Correct?
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
                    placeholder="Rahul Raju"
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
                  </div>
                </div>
              ))}
            </div>

            {options.length < 6 && (
              <button
                onClick={handleAddOption}
                className="mt-3 text-purple-600 text-sm font-semibold hover:text-purple-700"
              >
                + Add More option
              </button>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full bg-purple-600 text-white px-8 py-3 rounded-lg text-base font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Ask Question
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherCreatePoll;