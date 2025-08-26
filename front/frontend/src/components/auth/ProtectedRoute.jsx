import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showError } from '../../utils/toast';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        showError('Please log in to access this page');
        navigate('/');
      } else if (requireAdmin && !user?.is_staff) {
        showError('Admin access required');
        navigate('/');
      }
    }
  }, [loading, isAuthenticated, user, requireAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || (requireAdmin && !user?.is_staff)) {
    return null;
  }

  return children;
};

export default ProtectedRoute;