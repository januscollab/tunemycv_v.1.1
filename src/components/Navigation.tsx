import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, FileText, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import ThemeToggle from './ThemeToggle';

const Navigation = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-blueberry shadow-sm border-b border-apple-core/20 dark:border-citrus/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-apricot to-citrus rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold text-blueberry dark:text-citrus">TuneMyCV</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Link 
                  to="/auth" 
                  className="text-blueberry/70 dark:text-apple-core hover:text-apricot dark:hover:text-citrus transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/auth?mode=signup" 
                  className="bg-apricot text-white px-4 py-2 rounded-md hover:bg-apricot/90 transition-colors"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/analyze" 
                  className="text-blueberry/70 dark:text-apple-core hover:text-apricot dark:hover:text-citrus transition-colors"
                >
                  Analyze CV
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="text-blueberry/70 dark:text-apple-core hover:text-apricot dark:hover:text-citrus transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 text-blueberry/70 dark:text-apple-core hover:text-apricot dark:hover:text-citrus transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </button>
                  
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-blueberry rounded-md shadow-lg py-1 z-50 border border-apple-core/20 dark:border-citrus/20">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-blueberry dark:text-apple-core hover:bg-apple-core/10 dark:hover:bg-citrus/10"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        My Profile
                      </Link>
                      <Link
                        to="/profile?tab=settings"
                        className="flex items-center px-4 py-2 text-sm text-blueberry dark:text-apple-core hover:bg-apple-core/10 dark:hover:bg-citrus/10"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      <Link
                        to="/profile?tab=cvs"
                        className="flex items-center px-4 py-2 text-sm text-blueberry dark:text-apple-core hover:bg-apple-core/10 dark:hover:bg-citrus/10"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        My CVs
                      </Link>
                      <Link
                        to="/profile?tab=history"
                        className="flex items-center px-4 py-2 text-sm text-blueberry dark:text-apple-core hover:bg-apple-core/10 dark:hover:bg-citrus/10"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analysis History
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsProfileOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
