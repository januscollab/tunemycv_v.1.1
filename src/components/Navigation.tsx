
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, FileText, Target, BookOpen, User, Shield, TrendingUp, Edit } from 'lucide-react';
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

  const baseNavItems = [
    { path: '/', label: 'Home', icon: Target },
    { path: '/analyze', label: 'Analyze CV', icon: FileText },
  ];

  // Add conditional navigation items based on auth state
  const conditionalNavItems = user 
    ? [{ path: '/next-steps', label: 'Next Steps', icon: TrendingUp }]
    : [{ path: '/cover-letter', label: 'Create Cover Letter', icon: Edit }];

  const navItems = [
    ...baseNavItems,
    ...conditionalNavItems,
    { path: '/resources', label: 'Resources', icon: BookOpen },
  ];

  return (
    <nav className="bg-white dark:bg-blueberry shadow-sm border-b border-apple-core/30 dark:border-citrus/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <NavigationLogo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 text-sm font-medium transition-colors relative ${
                    isActive(item.path)
                      ? 'text-apricot'
                      : 'text-blueberry dark:text-apple-core hover:text-apricot'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                  {isActive(item.path) && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-apricot"></div>
                  )}
                </Link>
              );
            })}
            
            {user ? (
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`flex items-center px-3 py-2 text-sm font-medium transition-colors relative ${
                      isActive('/admin')
                        ? 'text-apricot'
                        : 'text-blueberry dark:text-apple-core hover:text-apricot'
                    }`}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                    {isActive('/admin') && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-apricot"></div>
                    )}
                  </Link>
                )}
                <UserProfileDropdown 
                  userDisplayName={getUserDisplayName()}
                  isActive={isActive}
                />
              </div>
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
              className="text-blueberry dark:text-apple-core hover:text-apricot focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-apple-core/30 dark:border-citrus/20">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(item.path)
                        ? 'text-apricot bg-citrus/20'
                        : 'text-blueberry dark:text-apple-core hover:text-apricot hover:bg-apple-core/30 dark:hover:bg-citrus/20'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
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
                      className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive('/admin')
                          ? 'text-apricot bg-citrus/20'
                          : 'text-blueberry dark:text-apple-core hover:text-apricot hover:bg-apple-core/30 dark:hover:bg-citrus/20'
                      }`}
                    >
                      <Shield className="h-5 w-5 mr-3" />
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive('/profile')
                        ? 'text-apricot bg-citrus/20'
                        : 'text-blueberry dark:text-apple-core hover:text-apricot hover:bg-apple-core/30 dark:hover:bg-citrus/20'
                    }`}
                  >
                    <User className="h-5 w-5 mr-3" />
                    Profile
                  </Link>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 bg-apricot text-white rounded-md text-base font-medium hover:bg-apricot/90 transition-colors"
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
