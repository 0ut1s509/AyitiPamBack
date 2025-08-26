import { useState, useEffect } from 'react';
import axios from 'axios';
import { showError, showSuccess } from '../../utils/toast';

const FactChecksManager = () => {
    const [factChecks, setFactChecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingFactCheck, setEditingFactCheck] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [verdictFilter, setVerdictFilter] = useState('all');

    // Add filtered fact-checks calculation
    const filteredFactChecks = factChecks.filter(factCheck => {
        const matchesSearch = factCheck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            factCheck.summary.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesVerdict = verdictFilter === 'all' || factCheck.verdict === verdictFilter;
        return matchesSearch && matchesVerdict;
    });
    useEffect(() => {
        fetchFactChecks();
    }, []);

    const fetchFactChecks = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/admin/factchecks/');
            setFactChecks(response.data);
        } catch (error) {
            showError('Failed to load fact-checks');
            console.error('Error fetching fact-checks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this fact-check?')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:8000/api/admin/factchecks/${id}/`);
            showSuccess('Fact-check deleted successfully');
            fetchFactChecks(); // Refresh the list
        } catch (error) {
            showError('Failed to delete fact-check');
            console.error('Error deleting fact-check:', error);
        }
    };

    const handleEdit = (factCheck) => {
        setEditingFactCheck(factCheck);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `http://localhost:8000/api/admin/factchecks/${editingFactCheck.id}/`,
                editingFactCheck
            );
            showSuccess('Fact-check updated successfully');
            setEditingFactCheck(null);
            fetchFactChecks(); // Refresh the list
        } catch (error) {
            showError('Failed to update fact-check');
            console.error('Error updating fact-check:', error);
        }
    };

    const handleCreate = async (formData) => {
        try {
            await axios.post('http://localhost:8000/api/admin/factchecks/', formData);
            showSuccess('Fact-check created successfully');
            setIsCreateModalOpen(false);
            fetchFactChecks(); // Refresh the list
        } catch (error) {
            showError('Failed to create fact-check');
            console.error('Error creating fact-check:', error);
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
        <div>
            {/* Header and Create Button */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Fact-Checks Management</h2>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    Create New Fact-Check
                </button>
            </div>
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search fact-checks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <select
                        value={verdictFilter}
                        onChange={(e) => setVerdictFilter(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Verdicts</option>
                        <option value="True">True</option>
                        <option value="Mostly True">Mostly True</option>
                        <option value="Mixture">Mixture</option>
                        <option value="Mostly False">Mostly False</option>
                        <option value="False">False</option>
                        <option value="Unverifiable">Unverifiable</option>
                    </select>
                </div>
            </div>
            {/* Fact-Checks Table */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Verdict
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {factChecks.map((factCheck) => (
                            <tr key={factCheck.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{factCheck.title}</div>
                                    {factCheck.url_submitted && (
                                        <div className="text-sm text-gray-500 truncate max-w-xs">
                                            Source: {factCheck.url_submitted}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${factCheck.verdict === 'True' || factCheck.verdict === 'Mostly True'
                                            ? 'bg-green-100 text-green-800'
                                            : factCheck.verdict === 'Mixture'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                        {factCheck.verdict_display || factCheck.verdict}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(factCheck.date_created).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {factCheck.is_recent && (
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                            New
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(factCheck)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(factCheck.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {factChecks.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No fact-checks found. Create your first one!
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingFactCheck && (
                <EditFactCheckModal
                    factCheck={editingFactCheck}
                    onClose={() => setEditingFactCheck(null)}
                    onSave={handleSaveEdit}
                    onChange={(updates) => setEditingFactCheck({ ...editingFactCheck, ...updates })}
                />
            )}

            {/* Create Modal */}
            {isCreateModalOpen && (
                <CreateFactCheckModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreate={handleCreate}
                />
            )}
        </div>
    );
};

// Edit Modal Component
const EditFactCheckModal = ({ factCheck, onClose, onSave, onChange }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(e);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Fact-Check</h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                type="text"
                                value={factCheck.title}
                                onChange={(e) => onChange({ title: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">URL Submitted</label>
                            <input
                                type="url"
                                value={factCheck.url_submitted || ''}
                                onChange={(e) => onChange({ url_submitted: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Verdict</label>
                            <select
                                value={factCheck.verdict}
                                onChange={(e) => onChange({ verdict: e.target.value })}
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
                            <label className="block text-sm font-medium text-gray-700">Summary</label>
                            <textarea
                                value={factCheck.summary}
                                onChange={(e) => onChange({ summary: e.target.value })}
                                rows={6}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
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
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Create Modal Component
const CreateFactCheckModal = ({ onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        title: '',
        url_submitted: '',
        verdict: 'True',
        summary: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(formData);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Fact-Check</h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
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
                            <label className="block text-sm font-medium text-gray-700">URL Submitted</label>
                            <input
                                type="url"
                                name="url_submitted"
                                value={formData.url_submitted}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Verdict</label>
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
                            <label className="block text-sm font-medium text-gray-700">Summary</label>
                            <textarea
                                name="summary"
                                value={formData.summary}
                                onChange={handleChange}
                                rows={6}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
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
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                Create Fact-Check
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FactChecksManager;