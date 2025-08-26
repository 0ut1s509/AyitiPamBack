import { useState, useEffect } from 'react';
import axios from 'axios';
import { showError, showSuccess } from '../../utils/toast';

const PositiveContentManager = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  console.log("editing content", editingContent)

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/positive-content/');
      setContent(response.data);
    } catch (error) {
      showError('Failed to load positive content');
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/admin/positive-content/${id}/`);
      showSuccess('Content deleted successfully');
      fetchContent();
    } catch (error) {
      showError('Failed to delete content');
      console.error('Error deleting content:', error);
    }
  };

  const handleEdit = (contentItem) => {
    setEditingContent(contentItem);
  };

  const handleSaveEdit = async (formData) => {
    try {
      // For updates, we need to use FormData to handle file uploads
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key]);
        }
      });

      await axios.put(
        `http://localhost:8000/api/admin/positive-content/${editingContent.id}/`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      showSuccess('Content updated successfully');
      setEditingContent(null);
      fetchContent();
    } catch (error) {
      showError('Failed to update content');
      console.error('Error updating content:', error);
    }
  };

  const handleCreate = async (formData) => {
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key]);
        }
      });

      await axios.post(
        'http://localhost:8000/api/admin/positive-content/',
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      showSuccess('Content created successfully');
      setIsCreateModalOpen(false);
      fetchContent();
    } catch (error) {
      showError('Failed to create content');
      console.error('Error creating content:', error);
    }
  };

  const togglePublishStatus = async (id, currentStatus) => {
    try {
      await axios.patch(`http://localhost:8000/api/admin/positive-content/${id}/`, {
        is_published: !currentStatus
      });
      showSuccess(`Content ${currentStatus ? 'unpublished' : 'published'}`);
      fetchContent();
    } catch (error) {
      showError('Failed to update publication status');
      console.error('Error updating status:', error);
    }
  };

  // Filter content based on selected filters and search term
  const filteredContent = content.filter(item => {
    const matchesCategory = categoryFilter === 'all' || item.content_type === categoryFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'published' && item.is_published) ||
      (statusFilter === 'unpublished' && !item.is_published);
    const matchesSearch = searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getCategoryBadgeClass = (category) => {
    const categoryClasses = {
      culture: 'bg-purple-100 text-purple-800',
      innovation: 'bg-blue-100 text-blue-800',
      community: 'bg-green-100 text-green-800',
      nature: 'bg-teal-100 text-teal-800',
      achievement: 'bg-yellow-100 text-yellow-800'
    };
    return categoryClasses[category] || 'bg-gray-100 text-gray-800';
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Positive Content Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage "Haiti Unveiled" positive stories</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add New Content
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="culture">Culture & Arts</option>
              <option value="innovation">Innovation & Technology</option>
              <option value="community">Community Initiatives</option>
              <option value="nature">Nature & Tourism</option>
              <option value="achievement">Achievements & Success</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <div className="text-2xl font-bold text-gray-900">{content.length}</div>
          <div className="text-sm text-gray-600">Total Content</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <div className="text-2xl font-bold text-green-600">
            {content.filter(c => c.is_published).length}
          </div>
          <div className="text-sm text-gray-600">Published</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <div className="text-2xl font-bold text-blue-600">
            {content.filter(c => c.has_image).length}
          </div>
          <div className="text-sm text-gray-600">With Images</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {/* Image */}
            {item.image_url_full && (
              <div className="h-48 overflow-hidden">
                <img
                  src={item.image_url_full}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                      <div class="h-48 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
                        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    `;
                  }}
                />
              </div>
            )}

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadgeClass(item.content_type)}`}>
                  {item.content_type_display}
                </span>
                {item.is_recent && (
                  <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                    New
                  </span>
                )}
              </div>

              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.description}</p>

              {/* Meta Information */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>Created: {new Date(item.date_created).toLocaleDateString()}</span>
                <span className={`inline-flex items-center ${item.is_published ? 'text-green-600' : 'text-gray-400'}`}>
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {item.is_published ? 'Published' : 'Draft'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
                <button
                  onClick={() => togglePublishStatus(item.id, item.is_published)}
                  className={`px-3 py-1 text-xs font-medium rounded ${item.is_published
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                >
                  {item.is_published ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600">
            {content.length === 0 ? 'No positive content found.' : 'No content matches your filters.'}
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create First Content
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingContent && (
        <EditContentModal
          content={editingContent}
          onClose={() => setEditingContent(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <CreateContentModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
};

// Edit Modal Component
const EditContentModal = ({ content, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: content.title,
    content_type: content.content_type,
    description: content.description,
    image: null,
    image_url: content.image_url_full || '',
    source_url: content.source_url || '',
    is_published: content.is_published
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Positive Content</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {console.log("form data", formData)}
            {formData.image && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Selected file: {formData.image.name}</p>
              </div>
            )}

            {formData.image_url && !formData.image && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Image URL: {formData.image_url}</p>
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="mt-2 h-20 object-cover rounded"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
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
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <select
                name="content_type"
                value={formData.content_type}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="culture">Culture & Arts</option>
                <option value="innovation">Innovation & Technology</option>
                <option value="community">Community Initiatives</option>
                <option value="nature">Nature & Tourism</option>
                <option value="achievement">Achievements & Success</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload Image</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleChange}
                  accept="image/*"
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Or Image URL</label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Source URL</label>
              <input
                type="url"
                name="source_url"
                value={formData.source_url}
                onChange={handleChange}
                placeholder="https://example.com/source"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Published</label>
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

// Create Modal Component (similar structure but for creation)
const CreateContentModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    title: '',
    content_type: 'culture',
    description: '',
    image: null,
    image_url: '',
    source_url: '',
    is_published: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create Positive Content</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Same form fields as EditModal */}
            {formData.image && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Selected file: {formData.image.name}</p>
              </div>
            )}

            {formData.image_url && !formData.image && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Image URL: {formData.image_url}</p>
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="mt-2 h-20 object-cover rounded"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
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
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <select
                name="content_type"
                value={formData.content_type}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="culture">Culture & Arts</option>
                <option value="innovation">Innovation & Technology</option>
                <option value="community">Community Initiatives</option>
                <option value="nature">Nature & Tourism</option>
                <option value="achievement">Achievements & Success</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload Image</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleChange}
                  accept="image/*"
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Or Image URL</label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Source URL</label>
              <input
                type="url"
                name="source_url"
                value={formData.source_url}
                onChange={handleChange}
                placeholder="https://example.com/source"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Published</label>
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
                Create Content
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PositiveContentManager;