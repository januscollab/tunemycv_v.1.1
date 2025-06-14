
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
    { 
      path: user ? '/analyze?tab=analysis' : '/analyze', 
      label: 'Analyze CV' 
    },
    { path: '/cover-letter', label: 'Cover Letter' },
    { path: '/interview-toolkit', label: 'Interview Toolkit' },
    ...(user ? [{ path: '/pricing-scale', label: 'Pricing' }] : []),
    { path: '/resources', label: 'Resources' },
  ];

  const isActive = (path: string) => {
    if (path === '/analyze?tab=analysis') {
      return location.pathname === '/analyze' && (location.search.includes('tab=analysis') || location.search === '');
    }
    return location.pathname === path;
  };

  return (
    <>
      {/* Sticky placeholder to prevent layout jump */}
      {isSticky && <div className="h-16" />}
      <nav className={`bg-background/95 border-b border-border backdrop-blur-md transition-all duration-300 ease-in-out ${
        isSticky 
          ? 'fixed top-0 left-0 right-0 z-50 shadow-lg bg-background/98 transform translate-y-0' 
          : 'relative transform translate-y-0'
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
                className={`text-foreground hover:text-primary transition-all duration-normal font-medium relative group ${
                  isActive(item.path) ? 'text-primary' : ''
                }`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-normal group-hover:w-full ${
                  isActive(item.path) ? 'w-full' : ''
                }`} />
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
              className="text-foreground hover:text-primary transition-all duration-normal p-2 rounded-md hover:bg-accent active:scale-95"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden animate-fade-in">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-t border-border">
              {navItems.map((item, index) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-3 text-foreground hover:text-primary transition-all duration-normal font-medium rounded-md ${
                    isActive(item.path) ? 'text-primary bg-primary/10 border-l-4 border-primary' : 'hover:bg-accent'
                  }`}
                  onClick={() => setIsOpen(false)}
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
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
    </>
  );
};

export default Navigation;
