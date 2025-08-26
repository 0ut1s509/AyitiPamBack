import { useState, useEffect } from 'react';
import axios from 'axios';
import { showError } from '../../utils/toast';
import { Link } from 'react-router-dom';

const SubmissionList = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/user/submissions/');
            setSubmissions(response.data);
        } catch (error) {
            showError('Failed to load submissions');
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return '✅';
            case 'in_review': return '⏳';
            case 'new': return '📋';
            default: return '📄';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100';
            case 'in_review': return 'text-yellow-600 bg-yellow-100';
            case 'new': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    // Function to scroll to a specific fact-check
    const scrollToFactCheck = (factCheckId) => {
        const element = document.getElementById(`fact-check-${factCheckId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            // Add highlight effect
            element.classList.add('bg-yellow-50', 'border-l-4', 'border-yellow-400');
            setTimeout(() => {
                element.classList.remove('bg-yellow-50', 'border-l-4', 'border-yellow-400');
            }, 3000);
        } else {
            // If element not found, scroll to fact-checks section
            const section = document.getElementById('fact-checks');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">My Submissions</h2>
                <p className="text-sm text-gray-600">All your fact-check requests and their status</p>
            </div>

            <div className="divide-y divide-gray-200">
                {submissions.map((submission) => (
                    <div key={submission.id} className="px-6 py-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                    <span className="text-lg">{getStatusIcon(submission.status)}</span>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">
                                            {submission.claim_text || submission.url_submitted}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Submitted {submission.days_since_submission} days ago
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                                    {submission.status_display}
                                </span>

                                {submission.has_related_factcheck && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        📰 Published
                                    </span>
                                )}

                                {submission.user_notified && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        ✉️ Notified
                                    </span>
                                )}
                            </div>
                        </div>

                        {submission.status === 'completed' && submission.has_related_factcheck && (
                            <div className="mt-2 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                                <p className="text-sm text-blue-700">
                                    ✅ Your submission has been processed. The fact-check has been published.
                                </p>
                                <button
                                    onClick={() => scrollToFactCheck(submission.related_factcheck_id)}
                                    className="text-sm text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
                                >
                                    <Link
                                        to={`/fact-check/${submission.related_factcheck_id}`}
                                        className="text-sm text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
                                    >
                                        View published fact-check: {submission.related_factcheck_title}
                                    </Link>                </button>
                            </div>
                        )}

                        {submission.status === 'in_review' && (
                            <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                                <p className="text-sm text-yellow-700">
                                    ⏳ Our team is currently reviewing your submission. This usually takes 3-5 business days.
                                </p>
                            </div>
                        )}

                        {submission.status === 'new' && (
                            <div className="mt-2 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                                <p className="text-sm text-blue-700">
                                    📋 We've received your submission and it's in our queue for review.
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {submissions.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📋</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                    <p className="text-gray-600 mb-4">Submit your first claim to get started!</p>
                    <a
                        href="#submit"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Submit Your First Claim
                    </a>
                </div>
            )}
        </div>
    );
};

export default SubmissionList;