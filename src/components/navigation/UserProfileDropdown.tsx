
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserProfileDropdownProps {
  userDisplayName: string;
  isActive: (path: string) => boolean;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ userDisplayName, isActive }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-blueberry dark:text-apple-core">
        Welcome, {userDisplayName}
      </span>
      <div className="relative">
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`flex items-center px-3 py-2 text-sm font-medium transition-colors relative ${
            isActive('/profile')
              ? 'text-apricot'
              : 'text-blueberry dark:text-apple-core hover:text-apricot'
          }`}
        >
          <User className="h-4 w-4 mr-2" />
          Profile
          {isActive('/profile') && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-apricot"></div>
          )}
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
  );
};

export default UserProfileDropdown;
