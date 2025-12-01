import Badge from './Badge';

const KickedUser = () => {
    const handleTryAgain = () => {
        // Clear session storage and redirect to home
        sessionStorage.clear();
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-5 bg-[#F2F2F2]">
            <div className="w-full max-w-2xl bg-white rounded-xl p-16 shadow-sm text-center">
                <div className="mb-8">
                    <Badge text="InterVue" />
                </div>

                {/* Kicked Icon */}
                <div className="mb-8">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-10 h-10 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-red-600 mb-4">
                    You've been Kicked out!
                </h1>

                <p className="text-gray-600 text-base mb-8 leading-relaxed max-w-md mx-auto">
                    Looks like the teacher has removed you from the poll system. This might be due to inappropriate behavior or other reasons.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={handleTryAgain}
                        className="bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white px-8 py-3 rounded-3xl text-base font-semibold hover:shadow-lg transition-all"
                    >
                        Try Again
                    </button>

                    <p className="text-sm text-gray-500">
                        Please contact your teacher if you believe this was a mistake.
                    </p>
                </div>

                {/* Additional Info */}
                <div className="mt-12 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">What can you do?</h3>
                    <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Contact your teacher for clarification</li>
                        <li>• Wait for the next session</li>
                        <li>• Review the class guidelines</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default KickedUser;
