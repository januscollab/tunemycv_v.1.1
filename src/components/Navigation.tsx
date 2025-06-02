
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, FileText, BookOpen, User, Shield, TrendingUp, Edit, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useProfileData } from '@/hooks/useProfileData';
import ThemeToggle from './ThemeToggle';
import NavigationLogo from './navigation/NavigationLogo';
import UserProfileDropdown from './navigation/UserProfileDropdown';
import AuthButtons from './navigation/AuthButtons';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useAdminAuth();
  const { getUserDisplayName } = useProfileData();

  const isActive = (path: string) => location.pathname === path;

  // Different navigation items based on auth state
  const loggedInNavItems = [
    { path: '/analyze', label: 'Analyze CV', icon: FileText },
    { path: '/cover-letter', label: 'Cover Letter', icon: Edit },
    { path: '/next-steps', label: 'Next Steps', icon: TrendingUp },
    { path: '/resources', label: 'Resources', icon: BookOpen },
  ];

  const loggedOutNavItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/analyze', label: 'Analyze CV', icon: FileText },
    { path: '/cover-letter', label: 'Cover Letter', icon: Edit },
    { path: '/resources', label: 'Resources', icon: BookOpen },
  ];

  const navItems = user ? loggedInNavItems : loggedOutNavItems;

  return (
    <nav className="bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Far Left */}
          <NavigationLogo />

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center space-x-8 max-w-4xl">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 text-sm font-semibold transition-colors relative ${
                      isActive(item.path)
                        ? 'text-zapier-orange'
                        : 'text-earth hover:text-zapier-orange'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2 text-zapier-orange" />
                    {item.label}
                    {isActive(item.path) && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zapier-orange"></div>
                    )}
                  </Link>
                );
              })}
              
              {user && isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center px-3 py-2 text-sm font-semibold transition-colors relative ${
                    isActive('/admin')
                      ? 'text-zapier-orange'
                      : 'text-earth hover:text-zapier-orange'
                  }`}
                >
                  <Shield className="h-4 w-4 mr-2 text-zapier-orange" />
                  Admin
                  {isActive('/admin') && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zapier-orange"></div>
                  )}
                </Link>
              )}
            </div>
          </div>

          {/* Right Side - Auth & Theme */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <UserProfileDropdown 
                userDisplayName={getUserDisplayName()}
                isActive={isActive}
              />
            ) : (
              <AuthButtons />
            )}
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-earth hover:text-zapier-orange focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive(item.path)
                        ? 'text-zapier-orange bg-cream/50'
                        : 'text-earth hover:text-zapier-orange hover:bg-cream/30'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3 text-zapier-orange" />
                    {item.label}
                  </Link>
                );
              })}
              
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        isActive('/admin')
                          ? 'text-zapier-orange bg-cream/50'
                          : 'text-earth hover:text-zapier-orange hover:bg-cream/30'
                      }`}
                    >
                      <Shield className="h-4 w-4 mr-3 text-zapier-orange" />
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive('/profile')
                        ? 'text-zapier-orange bg-cream/50'
                        : 'text-earth hover:text-zapier-orange hover:bg-cream/30'
                    }`}
                  >
                    <User className="h-4 w-4 mr-3 text-zapier-orange" />
                    Profile
                  </Link>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 bg-zapier-orange text-white rounded-lg text-sm font-semibold hover:bg-zapier-orange/90 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
