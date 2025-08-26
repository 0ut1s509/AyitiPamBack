import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const PositiveContent = () => {
    const [positiveContent, setPositiveContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        const fetchPositiveContent = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/api/positive-content/`);
                setPositiveContent(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching positive content:", err);
                setError('Could not load positive content. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchPositiveContent();
    }, []);

    // Filter content by category
    const filteredContent = selectedCategory === 'all'
        ? positiveContent
        : positiveContent.filter(item => item.content_type === selectedCategory);

    const contentTypes = [
        { value: 'all', label: 'All Categories' },
        { value: 'culture', label: 'Culture & Arts' },
        { value: 'innovation', label: 'Innovation & Technology' },
        { value: 'community', label: 'Community Initiatives' },
        { value: 'nature', label: 'Nature & Tourism' },
        { value: 'achievement', label: 'Achievements & Success' },
    ];

    if (loading) {
        return (
            <div className="py-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[var(--color-av-blue-500)] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div>
                        <p className="text-lg font-medium text-gray-700 text-center">Discovering positive stories</p>
                        <p className="text-sm text-gray-500 text-center mt-1">Loading inspiring content about Haiti...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg mb-8">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <p className="text-yellow-700">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <section id="haiti-unveiled" className="mb-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    <span className="text-av-green-600">Haiti</span> Unveiled
                </h2>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                    Celebrating the beauty, innovation, and resilience of Haiti through positive stories and achievements.
                </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
                {contentTypes.map((type) => (
                    <button
                        key={type.value}
                        onClick={() => setSelectedCategory(type.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === type.value
                            ? 'bg-av-green-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            {/* Content Grid */}
            {filteredContent.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredContent.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
                            {item.image_url_full ? (
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={item.image_url_full}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                </div>
                            ) : (
                                <div className="h-48 bg-gradient-to-br from-av-blue-100 to-av-green-100 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            <div className="p-6">
                                <div className="mb-3">
                                    <span className="inline-block px-3 py-1 bg-av-green-100 text-av-green-700 text-xs font-semibold rounded-full">
                                        {item.content_type_display}
                                    </span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3">
                                    {item.description}
                                </p>
                                {item.source_url && (
                                    <a
                                        href={item.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-[var(--color-av-blue-600)] hover:text-[var(--color-av-blue-700)] font-medium text-sm"
                                    >
                                        Read more
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600">No content found in this category. Check back soon for new stories!</p>
                </div>
            )}
        </section>
    );
};

export default PositiveContent;