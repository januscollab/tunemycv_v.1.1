
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserProfileDropdownProps {
  userDisplayName: string;
  isActive: (path: string) => boolean;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ userDisplayName, isActive }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center px-3 py-2 text-sm font-medium transition-colors relative ${
          isActive('/profile')
            ? 'text-apricot'
            : 'text-blueberry dark:text-apple-core hover:text-apricot'
        }`}
      >
        <User className="h-4 w-4 mr-2" />
        Profile
        <ChevronDown className="h-4 w-4 ml-1" />
        {isActive('/profile') && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-apricot"></div>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-blueberry dark:text-apple-core hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <User className="h-4 w-4 mr-2 inline" />
              Profile Settings
            </Link>
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="w-full text-left px-4 py-2 text-sm text-blueberry dark:text-apple-core hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-t border-gray-200 dark:border-gray-700"
            >
              <LogOut className="h-4 w-4 mr-2 inline" />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfileDropdown;
