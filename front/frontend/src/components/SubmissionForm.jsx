import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { showError, showSuccess } from '../utils/toast';
import AuthModal from './auth/AuthModal';

const API_BASE_URL = 'http://localhost:8000';

const SubmissionForm = () => {
  // State to manage the form fields
  const [formData, setFormData] = useState({
    claim_text: '',
    url_submitted: ''
  });
  
  // State for UI feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isError, setIsError] = useState(false);
  

  // Get auth context
  const { user, isAuthenticated, setIsAuthModalOpen, setAuthModalMode } = useAuth();

  // Handler to update form data as user types
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  }

    // Function to open auth modal
  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };


// Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the browser from refreshing the page
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setSubmitMessage('Please log in to submit a claim for fact-checking.');
      setIsError(true);
      openAuthModal('login');
      return;
    }

    // Basic validation - require either text or URL
    if (!formData.claim_text && !formData.url_submitted) {
      setSubmitMessage('Please provide either a claim description or a URL to verify.');
      setIsError(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');
    setIsError(false);

    try {
      // Make a POST request to your Django API endpoint
      const response = await axios.post(`${API_BASE_URL}/api/submit-claim/`, formData);
      
      // Handle success
      setSubmitMessage('Thank you! Your submission has been received and will be reviewed.');
      setIsError(false);
      // Reset the form fields
      setFormData({
        claim_text: '',
        url_submitted: ''
      });
    } catch (error) {
      // Handle errors
      console.error('Submission error:', error);
      setIsError(true);
      if (error.response && error.response.status === 401) {
        setSubmitMessage('Please log in to submit a claim.');
        openAuthModal('login');
      } else if (error.response && error.response.data) {
        // Display validation errors from the backend
        setSubmitMessage('There was a problem with your submission. Please check the information and try again.');
      } else {
        setSubmitMessage('Network error. Please ensure the backend server is running.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  
  return (
    <section id="submit" className="mb-12">
      <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-lg border border-blue-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Submit a Claim for Fact-Checking</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Help us fight misinformation by submitting claims or URLs you'd like us to verify.
          </p>
          {!isAuthenticated && (
            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <p className="text-yellow-700">
                🔐 You need to be logged in to submit claims. Please log in or register first.
              </p>
            </div>
          )}
        </div>

        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            {/* URL Field */}
            <div>
              <label htmlFor="url_submitted" className="block text-sm font-medium text-gray-700 mb-2">
                URL of the Claim (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <input
                  type="url"
                  id="url_submitted"
                  name="url_submitted"
                  value={formData.url_submitted}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="https://example.com/suspicious-claim"
                />
              </div>
            </div>

            {/* Claim Text Field */}
            <div>
              <label htmlFor="claim_text" className="block text-sm font-medium text-gray-700 mb-2">
                Describe the claim *
              </label>
              <textarea
                id="claim_text"
                name="claim_text"
                value={formData.claim_text}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="I heard/read that... [describe the claim in detail]"
                required={!formData.url_submitted}
              />
              <p className="text-xs text-gray-500 mt-1">
                {!formData.url_submitted 
                  ? "Please provide either a URL or a detailed description of the claim."
                  : "Optional: Add more context about the URL you submitted."
                }
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-0.5 ${isSubmitting ? 'opacity-80 cursor-not-allowed hover:transform-none' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Submit for Fact-Checking
                  </>
                )}
              </button>
            </div>

            {/* Submission Status Message */}
            {submitMessage && (
              <div className={`p-4 rounded-md ${isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                {submitMessage}
              </div>
            )}
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="bg-blue-50 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-blue-900 mb-4">Authentication Required</h3>
              <p className="text-blue-700 mb-4">
                Please log in or create an account to submit claims for fact-checking.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => document.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'login' } }))}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Log In
                </button>
                <button
                  onClick={() => document.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'register' } }))}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SubmissionForm;