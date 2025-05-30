
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, FileText, Target, BookOpen, User, Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ThemeToggle from './ThemeToggle';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useAdminAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/');
      setShowProfileMenu(false);
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Target },
    { path: '/analyze', label: 'Analyze CV', icon: FileText },
    { path: '/resources', label: 'Resources', icon: BookOpen },
  ];

  return (
    <nav className="bg-white dark:bg-blueberry shadow-sm border-b border-apple-core/30 dark:border-citrus/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/7aefb742-801d-4494-af3e-defd30462f1c.png" 
                alt="TuneMyCV Logo" 
                className="h-8 w-auto mr-2"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-apricot bg-citrus/20'
                      : 'text-blueberry dark:text-apple-core hover:text-apricot hover:bg-apple-core/30 dark:hover:bg-citrus/20'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
            
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/admin')
                        ? 'text-apricot bg-citrus/20'
                        : 'text-blueberry dark:text-apple-core hover:text-apricot hover:bg-apple-core/30 dark:hover:bg-citrus/20'
                    }`}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/profile')
                        ? 'text-apricot bg-citrus/20'
                        : 'text-blueberry dark:text-apple-core hover:text-apricot hover:bg-apple-core/30 dark:hover:bg-citrus/20'
                    }`}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </button>
                  
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-blueberry rounded-md shadow-lg py-1 border border-apple-core/30 dark:border-citrus/20">
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="block px-4 py-2 text-sm text-blueberry dark:text-apple-core hover:bg-apple-core/30 dark:hover:bg-citrus/20 hover:text-apricot"
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-blueberry dark:text-apple-core hover:bg-apple-core/30 dark:hover:bg-citrus/20 hover:text-apricot"
                      >
                        <LogOut className="h-4 w-4 inline mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-apricot text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-apricot/90 transition-colors"
              >
                Sign In
              </Link>
            )}
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
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-blueberry dark:text-apple-core hover:text-apricot hover:bg-apple-core/30 dark:hover:bg-citrus/20 transition-colors"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </button>
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
