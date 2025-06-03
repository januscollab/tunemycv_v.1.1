
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileData } from '@/hooks/useProfileData';
import NavigationLogo from './navigation/NavigationLogo';
import AuthButtons from './navigation/AuthButtons';
import UserProfileDropdown from './navigation/UserProfileDropdown';
import ThemeToggle from './ThemeToggle';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { user } = useAuth();
  const { getUserDisplayName } = useProfileData();
  const location = useLocation();

  // Handle scroll for sticky navigation
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsSticky(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/analyze', label: 'Analyze CV' },
    { path: '/cover-letter', label: 'Cover Letter' },
    { 
      path: user ? '/analyze?tab=interview-prep' : '/interview-prep', 
      label: 'Interview Prep' 
    },
    { path: '/resources', label: 'Resources' },
  ];

  const isActive = (path: string) => {
    if (path === '/analyze?tab=interview-prep' || path.includes('tab=interview-prep')) {
      return location.pathname === '/analyze' && location.search.includes('tab=interview-prep');
    }
    if (path === '/interview-prep') {
      return location.pathname === '/interview-prep';
    }
    return location.pathname === path;
  };

  return (
    <nav className={`bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      isSticky ? 'fixed top-0 left-0 right-0 z-50 shadow-lg' : 'relative'
    }`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <NavigationLogo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-earth dark:text-white hover:text-zapier-orange transition-colors font-medium ${
                  isActive(item.path) ? 'text-zapier-orange' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <UserProfileDropdown 
                userDisplayName={getUserDisplayName()} 
                isActive={isActive} 
              />
            ) : (
              <AuthButtons />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-earth dark:text-white hover:text-zapier-orange transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 text-earth dark:text-white hover:text-zapier-orange transition-colors font-medium ${
                    isActive(item.path) ? 'text-zapier-orange bg-zapier-orange/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-3 py-2">
                {user ? (
                  <UserProfileDropdown 
                    userDisplayName={getUserDisplayName()} 
                    isActive={isActive} 
                  />
                ) : (
                  <AuthButtons />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
