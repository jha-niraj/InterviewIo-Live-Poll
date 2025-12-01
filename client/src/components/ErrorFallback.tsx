import { useNavigate } from 'react-router-dom';
import Badge from './Badge';

interface ErrorFallbackProps {
    error?: string;
    onRetry?: () => void;
    showBackButton?: boolean;
}

const ErrorFallback = ({
    error = 'Something went wrong. Please try again.',
    onRetry,
    showBackButton = true
}: ErrorFallbackProps) => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/student/poll');
    };

    const handleReload = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-5 bg-[#F2F2F2]">
            <div className="w-full max-w-2xl bg-white rounded-xl p-16 shadow-sm text-center">
                <div className="mb-8">
                    <Badge text="InterVue" />
                </div>
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
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Oops! Something Went Wrong
                </h1>
                <p className="text-gray-600 text-base mb-8 leading-relaxed max-w-md mx-auto">
                    {error}
                </p>
                <div className="space-y-3">
                    {
                        onRetry && (
                            <button
                                onClick={onRetry}
                                className="w-full bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white px-8 py-3 rounded-3xl text-base font-semibold hover:shadow-lg transition-all"
                            >
                                Try Again
                            </button>
                        )
                    }
                    <div className="flex gap-3">
                        <button
                            onClick={handleReload}
                            className="flex-1 bg-gray-200 text-gray-900 px-6 py-3 rounded-3xl text-base font-semibold hover:bg-gray-300 transition-all"
                        >
                            Reload Page
                        </button>
                        {
                            showBackButton && (
                                <button
                                    onClick={handleBack}
                                    className="flex-1 bg-gray-200 text-gray-900 px-6 py-3 rounded-3xl text-base font-semibold hover:bg-gray-300 transition-all"
                                >
                                    Go Home
                                </button>
                            )
                        }
                    </div>
                </div>
                <div className="mt-12 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Common Issues:</h3>
                    <ul className="text-xs text-gray-600 space-y-1 text-left max-w-md mx-auto">
                        <li>• Check your internet connection</li>
                        <li>• The server might be temporarily unavailable</li>
                        <li>• Try refreshing the page</li>
                        <li>• Clear your browser cache if the problem persists</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ErrorFallback;