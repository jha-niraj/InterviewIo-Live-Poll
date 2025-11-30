import type { PollResults as PollResultsType } from '../types';

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
    <div className="min-h-screen flex items-center justify-center p-5 bg-gray-50">
      <div className="w-full max-w-5xl bg-white rounded-xl p-12 shadow-sm">
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <span className="inline-block bg-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold">
                # InterVue
              </span>
              {role === 'teacher' && isActive && (
                <button
                  onClick={onStopPoll}
                  className="bg-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-purple-700 transition-colors"
                >
                  Stop Poll Manually
                </button>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-900">Question 1</span>
                {isActive && (
                  <span className="text-red-500 text-sm font-semibold">
                    {formatTime(results.timeRemaining)}
                  </span>
                )}
              </div>
              <div className="bg-gray-700 text-white p-4 rounded-lg">
                <p className="text-sm font-medium">{results.question}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {results.options.map((option) => (
                <div key={option.id} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border-2 border-purple-600 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{option.text}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{option.percentage.toFixed(0)}%</span>
                  </div>
                  <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-purple-600 transition-all duration-500 flex items-center justify-end pr-3"
                      style={{ width: `${option.percentage}%` }}
                    >
                      {option.percentage > 10 && (
                        <span className="text-xs font-semibold text-white">{option.count}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!isActive && (
              <>
                {role === 'student' && (
                  <p className="text-center text-sm text-gray-600 mb-4">
                    Wait for the teacher to ask a new question..
                  </p>
                )}
                {role === 'teacher' && onAskNewQuestion && (
                  <button
                    onClick={onAskNewQuestion}
                    className="w-full bg-purple-600 text-white px-8 py-3 rounded-lg text-base font-semibold hover:bg-purple-700 transition-colors"
                  >
                    + Ask a new question
                  </button>
                )}
              </>
            )}
          </div>

          {role === 'teacher' && participants && participants.length > 0 && (
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
                  {participants.map((participant) => (
                    <div key={participant.sessionId} className="text-sm text-gray-600">
                      {participant.name}
                      {participant.hasAnswered && (
                        <span className="ml-2 text-green-600">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {role === 'teacher' && onViewHistory && (
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={onViewHistory}
              className="text-purple-600 text-sm font-semibold hover:text-purple-700"
            >
              View Poll History →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PollResults;