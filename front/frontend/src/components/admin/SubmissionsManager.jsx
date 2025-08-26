import { useState, useEffect } from 'react';
import axios from 'axios';
import { showError, showSuccess } from '../../utils/toast';
import VerdictModal from './VerdictModal';

const SubmissionsManager = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubmissions, setSelectedSubmissions] = useState(new Set());
    const [verdictModalOpen, setVerdictModalOpen] = useState(false);

    console.log('Selected Submissions:', selectedSubmissions);


    const handleVerdictSuccess = (result) => {
        showSuccess(`Verdict created and submission marked as completed!`);
        fetchSubmissions(); // Refresh the list
    };

    // Add bulk action functions
    const handleBulkStatusChange = async (newStatus) => {
        try {
            const promises = Array.from(selectedSubmissions).map(id =>
                axios.patch(`http://localhost:8000/api/admin/submissions/${id}/`, {
                    status: newStatus
                })
            );
            await Promise.all(promises);
            showSuccess(`Updated ${selectedSubmissions.size} submissions`);
            setSelectedSubmissions(new Set());
            fetchSubmissions();
        } catch (error) {
            showError('Failed to update submissions');
            console.error('Error updating submissions:', error);
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedSubmissions.size} submissions?`)) {
            return;
        }

        try {
            const promises = Array.from(selectedSubmissions).map(id =>
                axios.delete(`http://localhost:8000/api/admin/submissions/${id}/`)
            );
            await Promise.all(promises);
            showSuccess(`Deleted ${selectedSubmissions.size} submissions`);
            setSelectedSubmissions(new Set());
            fetchSubmissions();
        } catch (error) {
            showError('Failed to delete submissions');
            console.error('Error deleting submissions:', error);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/admin/submissions/');
            setSubmissions(response.data);
        } catch (error) {
            showError('Failed to load submissions');
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSubmissionStatus = async (id, newStatus) => {
        try {
            await axios.patch(`http://localhost:8000/api/admin/submissions/${id}/`, {
                status: newStatus
            });
            showSuccess('Submission status updated');
            fetchSubmissions(); // Refresh the list
        } catch (error) {
            showError('Failed to update submission status');
            console.error('Error updating submission:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this submission?')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:8000/api/admin/submissions/${id}/`);
            showSuccess('Submission deleted successfully');
            fetchSubmissions(); // Refresh the list
        } catch (error) {
            showError('Failed to delete submission');
            console.error('Error deleting submission:', error);
        }
    };

    // Filter submissions based on selected filters and search term
    const filteredSubmissions = submissions.filter(submission => {
        const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
        const matchesType = typeFilter === 'all' ||
            (typeFilter === 'url' && submission.has_url) ||
            (typeFilter === 'text' && submission.has_text);
        const matchesSearch = searchTerm === '' ||
            submission.claim_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            submission.url_submitted?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            submission.submitter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            submission.submitter_email?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesStatus && matchesType && matchesSearch;
    });

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'new':
                return 'bg-blue-100 text-blue-800';
            case 'in_review':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeBadge = (submission) => {
        if (submission.has_url && submission.has_text) return 'URL + Text';
        if (submission.has_url) return 'URL';
        if (submission.has_text) return 'Text';
        return 'Unknown';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">User Submissions Management</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Manage user-submitted claims and URLs for fact-checking
                </p>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="new">New</option>
                            <option value="in_review">In Review</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Types</option>
                            <option value="url">URL Submissions</option>
                            <option value="text">Text Claims</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Search submissions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                    <div className="text-2xl font-bold text-gray-900">{submissions.length}</div>
                    <div className="text-sm text-gray-600">Total Submissions</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {submissions.filter(s => s.status === 'new').length}
                    </div>
                    <div className="text-sm text-gray-600">New</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                        {submissions.filter(s => s.status === 'in_review').length}
                    </div>
                    <div className="text-sm text-gray-600">In Review</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {submissions.filter(s => s.status === 'completed').length}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                </div>
            </div>

            {selectedSubmissions.size > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between">
                        <span className="text-blue-800">
                            {selectedSubmissions.size} submission(s) selected
                        </span>
                        <div className="flex space-x-2">
                            <select
                                onChange={(e) => handleBulkStatusChange(e.target.value)}
                                className="border border-blue-300 rounded-md px-3 py-1 text-sm"
                            >
                                <option value="">Set Status...</option>
                                <option value="new">Mark as New</option>
                                <option value="in_review">Mark as In Review</option>
                                <option value="completed">Mark as Completed</option>
                            </select>
                            <button
                                onClick={handleBulkDelete}
                                className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                            >
                                Delete Selected
                            </button>
                            <button
                                onClick={() => setSelectedSubmissions(new Set())}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Submissions Table */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Submission
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Submitted By
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSubmissions.map((submission) => (
                            <tr key={submission.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                        {submission.claim_text || submission.url_submitted}
                                    </div>
                                    {submission.is_recent && (
                                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                            New
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {submission.submitter_name || 'Anonymous'}
                                    </div>
                                    {submission.submitter_email && (
                                        <div className="text-sm text-gray-500">{submission.submitter_email}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
                                        {getTypeBadge(submission)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={submission.status}
                                        onChange={(e) => updateSubmissionStatus(submission.id, e.target.value)}
                                        className={`text-xs font-semibold rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-blue-500 ${getStatusBadgeClass(submission.status)}`}
                                    >
                                        <option value="new">New</option>
                                        <option value="in_review">In Review</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(submission.date_submitted).toLocaleDateString()}
                                    <br />
                                    <span className="text-xs text-gray-400">
                                        {new Date(submission.date_submitted).toLocaleTimeString()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => {
                                            setSelectedSubmission(submission);
                                            setVerdictModalOpen(true);
                                        }}
                                        className="text-green-600 hover:text-green-900"
                                        title="Create verdict for this submission"
                                    >
                                        Add Verdict
                                    </button>
                                    <button
                                        onClick={() => setSelectedSubmission(submission)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleDelete(submission.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredSubmissions.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        {submissions.length === 0 ? 'No submissions found.' : 'No submissions match your filters.'}
                    </div>
                )}
            </div>

            {/* Submission Detail Modal */}
            {selectedSubmission && (
                <SubmissionDetailModal
                    submission={selectedSubmission}
                    onClose={() => setSelectedSubmission(null)}
                    onStatusChange={(newStatus) => {
                        updateSubmissionStatus(selectedSubmission.id, newStatus);
                        setSelectedSubmission(null);
                    }}
                />
            )}
              {verdictModalOpen && selectedSubmission && (
                <VerdictModal
                    submission={selectedSubmission}
                    onClose={() => {
                        setVerdictModalOpen(false);
                        setSelectedSubmission(null);
                    }}
                    onSuccess={handleVerdictSuccess}
                />
            )}
        </div>
    );
};

// Submission Detail Modal Component
const SubmissionDetailModal = ({ submission, onClose, onStatusChange }) => {
    const [currentStatus, setCurrentStatus] = useState(submission.status);

    const handleStatusChange = (e) => {
        setCurrentStatus(e.target.value);
    };

    const handleSaveStatus = () => {
        onStatusChange(currentStatus);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Submission Details</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Submission Information */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Submission Information</h4>
                            <dl className="space-y-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Submitted on</dt>
                                    <dd className="text-sm text-gray-900">
                                        {new Date(submission.date_submitted).toLocaleString()}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Current Status</dt>
                                    <dd className="text-sm">
                                        <select
                                            value={currentStatus}
                                            onChange={handleStatusChange}
                                            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                                        >
                                            <option value="new">New</option>
                                            <option value="in_review">In Review</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </dd>
                                </div>
                                {submission.is_recent && (
                                    <div>
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                            Submitted in last 24 hours
                                        </span>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Submitter Information */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Submitter Information</h4>
                            <dl className="space-y-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                                    <dd className="text-sm text-gray-900">
                                        {submission.submitter_name || 'Not provided'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                                    <dd className="text-sm text-gray-900">
                                        {submission.submitter_email || 'Not provided'}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Submission Content */}
                    <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Content</h4>
                        {submission.fact_checks && submission.fact_checks.length > 0 && (
                            <div className="mt-2 bg-green-50 border-l-4 border-green-400 p-3 rounded">
                                <p className="text-sm text-green-700">
                                    ✅ This submission has {submission.fact_checks.length} fact-check(s):
                                </p>
                                {submission.fact_checks.map(factCheck => (
                                    <a
                                        key={factCheck.id}
                                        href={`#fact-check-${factCheck.id}`}
                                        className="text-sm text-green-600 hover:text-green-800 underline mt-1 block"
                                    >
                                        {factCheck.title} - {factCheck.verdict}
                                    </a>
                                ))}
                            </div>
                        )}
                        {submission.url_submitted && (
                            <div className="mb-4">
                                <dt className="text-sm font-medium text-gray-500 mb-1">URL Submitted</dt>
                                <dd className="text-sm">
                                    <a
                                        href={submission.url_submitted}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 break-all"
                                    >
                                        {submission.url_submitted}
                                    </a>
                                </dd>
                            </div>
                        )}
                        {submission.claim_text && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500 mb-1">Claim Text</dt>
                                <dd className="text-sm text-gray-900 bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                                    {submission.claim_text}
                                </dd>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleSaveStatus}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            Save Status
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};








export default SubmissionsManager;