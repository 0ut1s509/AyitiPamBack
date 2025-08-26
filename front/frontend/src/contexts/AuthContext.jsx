import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState(null);
  // Add auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // Add this line

  const API_BASE_URL = 'http://localhost:8000';

  // Initialize axios interceptors for token refresh
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  // Check for existing tokens on app load
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (accessToken && refreshToken) {
        setTokens({ access: accessToken, refresh: refreshToken });
        try {
          const response = await axios.get(`${API_BASE_URL}/api/auth/profile/`);
          setUser(response.data.user);
        } catch (error) {
          console.error('Auto-login failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Handle custom events for opening auth modal
  useEffect(() => {
    const handleOpenAuthModal = (event) => {
      setIsAuthModalOpen(true);
      setAuthModalMode(event.detail.mode || 'login');
    };

    document.addEventListener('openAuthModal', handleOpenAuthModal);
    
    return () => {
      document.removeEventListener('openAuthModal', handleOpenAuthModal);
    };
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login/`, {
        username,
        password
      });

      const { user, tokens } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      
      setUser(user);
      setTokens(tokens);
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (username, email, password, password2) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register/`, {
        username,
        email,
        password,
        password2
      });

      const { user, tokens } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      
      setUser(user);
      setTokens(tokens);
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await axios.post(`${API_BASE_URL}/api/auth/logout/`, {
          refresh: refreshToken
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear everything regardless of API call success
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setTokens(null);
    }
  };

  const value = {
    user,
    tokens,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    // Expose modal state and functions
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};