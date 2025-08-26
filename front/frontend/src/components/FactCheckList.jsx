import { useState, useEffect } from 'react';
import axios from 'axios';

// Define the API base URL. We use a relative path because both servers are on localhost.
// In production, this would be the full domain of your Django API.
const API_BASE_URL = 'http://localhost:8000'; // Your Django server's address

const FactCheckList = () => {
    // State to hold the list of fact-checks from the API
    const [factChecks, setFactChecks] = useState([]);
    // State to handle loading and error status
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // useEffect hook to fetch data when the component mounts
    useEffect(() => {
        const fetchFactChecks = async () => {
            try {
                setLoading(true);
                // Make a GET request to your Django API endpoint
                const response = await axios.get(`${API_BASE_URL}/api/factchecks/`);
                // If successful, update the state with the fetched data
                setFactChecks(response.data);
                setError(null); // Clear any previous errors
            } catch (err) {
                // If there's an error (e.g., API not reachable), update the error state
                console.error("Error fetching fact-checks:", err);
                setError('Could not load fact-checks. Please ensure the Django server is running.');
            } finally {
                // This runs regardless of success or failure, turning off the loading indicator
                setLoading(false);
            }
        };

        fetchFactChecks();
    }, []); // The empty dependency array means this effect runs once on mount

    // Conditional rendering based on state
   if (loading) {
  return (
    <div className="py-12">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-av-blue-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-av-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div>
          <p className="text-lg font-medium text-gray-700 text-center">Gathering the latest fact-checks</p>
          <p className="text-sm text-gray-500 text-center mt-1">Checking sources and verifying information...</p>
        </div>
      </div>
    </div>
  );
}

 if (error) {
  return (
    <div className="py-8">
      <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg max-w-2xl mx-auto">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-red-800">Connection Issue</h3>
            <p className="text-red-700 mt-2">{error}</p>
            <div className="mt-4">
              <button 
                onClick={() => window.location.reload()} 
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Latest Fact-Checks</h2>
            <div className="space-y-6">
                {factChecks.length > 0 ? (
                    factChecks.map((factCheck) => (
                        <div key={factCheck.id} id={`fact-check-${factCheck.id}`} className="bg-white overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">{factCheck.title}</h3>

                                {factCheck.url_submitted && (
                                    <p className="text-sm text-av-blue-600 mb-3">
                                        <span className="font-medium">Claim Source:</span>{' '}
                                        <a href={factCheck.url_submitted} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">
                                            {factCheck.url_submitted}
                                        </a>
                                    </p>
                                )}

                                <div className="mb-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold 
        ${factCheck.verdict === 'True' ? 'bg-av-green-100 text-av-green-700' : ''}
        ${factCheck.verdict === 'Mostly True' ? 'bg-av-green-100 text-av-green-700' : ''}
        ${factCheck.verdict === 'Mixture' ? 'bg-yellow-100 text-yellow-800' : ''}
        ${factCheck.verdict === 'Mostly False' ? 'bg-orange-100 text-orange-800' : ''}
        ${factCheck.verdict === 'False' ? 'bg-red-100 text-red-800' : ''}
        ${factCheck.verdict === 'Unverifiable' ? 'bg-gray-100 text-gray-800' : ''}
      `}>
                                        Verdict: {factCheck.verdict}
                                    </span>
                                </div>

                                <p className="text-gray-700 leading-relaxed mb-4">{factCheck.summary}</p>

                                <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
                                    <span>Published on: {new Date(factCheck.date_created).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    <span>Updated: {new Date(factCheck.date_updated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-8">No fact-checks have been published yet.</p>
                )}
            </div>
        </div>
    );
};

export default FactCheckList;