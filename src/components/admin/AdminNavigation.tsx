
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
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-space-1 sm:px-space-1.5 lg:px-space-2">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/admin" className="text-heading font-bold text-foreground">
              TuneMyCV Admin
            </Link>
          </div>
          <div className="flex items-center space-x-space-1">
            <Link
              to="/"
              className="flex items-center px-space-0.75 py-space-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4 mr-2" />
              Main Site
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center px-space-0.75 py-space-0.5 text-muted-foreground hover:text-foreground transition-colors"
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
