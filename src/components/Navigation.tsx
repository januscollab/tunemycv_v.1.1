
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, FileText, Target, BookOpen, User, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useAdminAuth();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: Target },
    { path: '/analyze', label: 'Analyze CV', icon: FileText },
    { path: '/resources', label: 'Resources', icon: BookOpen },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Target className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">TuneMyCV</span>
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
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
            
            {user ? (
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/admin')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/profile')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(item.path)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
                  className="block px-3 py-2 bg-blue-600 text-white rounded-md text-base font-medium hover:bg-blue-700 transition-colors"
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
