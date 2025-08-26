import { useState } from 'react';
import { scrollToSection } from '../utils/scrollUtils';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './auth/AuthModal';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Sticky Navbar - Add fixed, top-0, w-full, and z-50 classes */}
      <nav className="fixed top-0 w-full bg-white shadow-sm border-b border-gray-200 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-[var(--color-av-blue-600)]">Ayiti Vérité</span>
            </div>

            {/* Desktop Navigation Links - centered */}
            <div className="hidden md:flex flex-1 justify-center">
              <div className="flex space-x-8">
                 {isAuthenticated && user?.is_staff && (
                  <a
                    href="/admin"
                    className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-200 transition-colors"
                  >
                    Admin Dashboard
                  </a>
                )}
                {isAuthenticated && !user?.is_staff &&(
                  <a
                    href="/dashboard"
                    className="text-gray-700 hover:text-[var(--color-av-blue-600)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    My Dashboard
                  </a>
                )}

                <button onClick={() => scrollToSection('fact-checks')} className="text-gray-700 hover:text-[var(--color-av-blue-600)] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Fact-Checks
                </button>
                <button onClick={() => scrollToSection('haiti-unveiled')} className="text-gray-700 hover:text-[var(--color-av-blue-600)] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Haiti Unveiled
                </button>
                <button onClick={() => scrollToSection('submit')} className="text-gray-700 hover:text-[var(--color-av-blue-600)] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Submit a Claim
                </button>
              </div>
            </div>

            {/* Auth Links */}
            <div className="hidden md:block">
              <div className="ml-4 flex items-center space-x-4">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-700">Welcome, {user.username}</span>
                    <button
                      onClick={handleLogout}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-[var(--color-av-blue-600)] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[var(--color-av-blue-700)] transition-colors"
                  >
                    Login / Register
                  </button>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[var(--color-av-blue-600)] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-av-blue-500)]"
              >
                <span className="sr-only">Open main menu</span>
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {isAuthenticated && !user?.is_staff &&(
                  <a
                    href="/dashboard"
                    className="text-gray-700 hover:text-[var(--color-av-blue-600)] block px-3 py-2 rounded-md text-base font-medium"
                  >
                    My Dashboard
                  </a>
                )}

                {isAuthenticated && user?.is_staff && (
                  <a
                    href="/admin"
                    className="bg-yellow-100 text-yellow-800 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    Admin Dashboard
                  </a>
                )}

                <button onClick={() => { scrollToSection('fact-checks'); setIsMenuOpen(false); }} className="text-gray-700 hover:text-[var(--color-av-blue-600)] block px-3 py-2 rounded-md text-base font-medium w-full text-left">
                  Fact-Checks
                </button>
                <button onClick={() => { scrollToSection('haiti-unveiled'); setIsMenuOpen(false); }} className="text-gray-700 hover:text-[var(--color-av-blue-600)] block px-3 py-2 rounded-md text-base font-medium w-full text-left">
                  Haiti Unveiled
                </button>
                <button onClick={() => { scrollToSection('submit'); setIsMenuOpen(false); }} className="text-gray-700 hover:text-[var(--color-av-blue-600)] block px-3 py-2 rounded-md text-base font-medium w-full text-left">
                  Submit a Claim
                </button>
                
                {isAuthenticated ? (
                  <>
                    <div className="border-t border-gray-200 pt-2">
                      <p className="px-3 py-2 text-sm text-gray-500">Logged in as {user.username}</p>
                      <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-gray-700 hover:text-[var(--color-av-blue-600)] block px-3 py-2 rounded-md text-base font-medium w-full text-left">
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }}
                    className="bg-[var(--color-av-blue-600)] text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    Login / Register
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
};
export default Navbar;