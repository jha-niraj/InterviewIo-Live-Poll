const StudentWaiting = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-xl p-16 shadow-sm">
        <div className="text-center">
          <span className="inline-block bg-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold mb-8">
            # InterVue
          </span>
          
          <div className="mb-8">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900">
            Wait for the teacher to ask questions..
          </h2>
        </div>
      </div>
    </div>
  );
};

export default StudentWaiting;
