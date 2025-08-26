import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { showError } from '../../utils/toast';
import DashboardStats from './DashboardStats';
import SubmissionList from './SubmissionList';
import RecentActivity from './RecentActivity';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/user/dashboard/');
      setDashboardData(response.data);
    } catch (error) {
      showError('Failed to load dashboard data');
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Failed to load dashboard</div>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header Container */}
      <div className="sticky top-0 z-10">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
                <p className="text-gray-600">Welcome back, {dashboardData.user.name}!</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Member since {new Date(dashboardData.user.date_joined).toLocaleDateString()}
                </span>
                <button
                  onClick={() => navigate('/')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  ← Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {['overview', 'submissions', 'activity'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab === 'overview' && 'Overview'}
                  {tab === 'submissions' && 'My Submissions'}
                  {tab === 'activity' && 'Recent Activity'}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <DashboardStats stats={dashboardData.stats} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RecentActivity
                submissions={dashboardData.recent_submissions}
                factChecks={dashboardData.recent_fact_checks}
              />
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/#submit')}
                    className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Submit New Claim
                  </button>
                  <button
                    onClick={() => setActiveTab('submissions')}
                    className="block w-full text-center bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                  >
                    View All Submissions
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <SubmissionList />
        )}

        {activeTab === 'activity' && (
          <RecentActivity
            submissions={dashboardData.recent_submissions}
            factChecks={dashboardData.recent_fact_checks}
            showAll={true}
          />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;