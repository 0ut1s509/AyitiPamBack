import { useState } from 'react';
import axios from 'axios';
import { showError, showSuccess } from '../../utils/toast';

const VerdictModal = ({ submission, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: submission.claim_text ? `Fact-Check: ${submission.claim_text.substring(0, 50)}...` : 'Fact-Check',
    verdict: 'True',
    summary: '',
    use_submission_data: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:8000/api/admin/submissions/${submission.id}/create-factcheck/`,
        formData
      );

      showSuccess('Fact-check created successfully!');
      onSuccess(response.data);
      onClose();
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to create fact-check');
      console.error('Error creating fact-check:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-gray-900">Create Verdict</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Submission Preview */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Original Submission</h4>
            {submission.claim_text && (
              <p className="text-sm text-gray-700 mb-2">{submission.claim_text}</p>
            )}
            {submission.url_submitted && (
              <p className="text-sm text-blue-600 break-all">
                <a href={submission.url_submitted} target="_blank" rel="noopener noreferrer">
                  {submission.url_submitted}
                </a>
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Submitted by: {submission.submitter_name || 'Anonymous'} ({submission.submitter_email || 'No email'})
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fact-Check Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Verdict *</label>
              <select
                name="verdict"
                value={formData.verdict}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="True">True</option>
                <option value="Mostly True">Mostly True</option>
                <option value="Mixture">Mixture</option>
                <option value="Mostly False">Mostly False</option>
                <option value="False">False</option>
                <option value="Unverifiable">Unverifiable</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Summary & Analysis *</label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                rows={8}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Provide detailed analysis, evidence, and sources for your verdict..."
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="use_submission_data"
                checked={formData.use_submission_data}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Use submission URL in fact-check
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Fact-Check'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerdictModal;