
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, LogOut } from 'lucide-react';

const AdminNavigation = () => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/admin" className="text-xl font-bold text-gray-900">
              TuneMyCV Admin
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="h-4 w-4 mr-2" />
              Main Site
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavigation;
