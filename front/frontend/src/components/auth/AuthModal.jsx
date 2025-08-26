import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { showSuccess } from '../../utils/toast';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleAuthSuccess = () => {
    const message = isLoginMode ? 'Login successful!' : 'Registration successful!';
    showSuccess(message);
    onClose(); // Close the modal on successful auth
    // The page will automatically update due to the AuthContext state change
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300"
        >
          ×
        </button>

        {isLoginMode ? (
          <LoginForm onToggleMode={() => setIsLoginMode(false)}
            onSuccess={handleAuthSuccess}
          />
        ) : (
          <RegisterForm onToggleMode={() => setIsLoginMode(true)}
            onSuccess={handleAuthSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;