
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserProfileDropdownProps {
  userDisplayName: string;
  isActive: (path: string) => boolean;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ userDisplayName, isActive }) => {
  const navigate = useNavigate();

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
    <div className="flex items-center space-x-4">
      <Link
        to="/profile"
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
      </Link>
      <button
        onClick={handleLogout}
        className="flex items-center px-3 py-2 text-sm font-medium text-blueberry dark:text-apple-core hover:text-apricot transition-colors"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </button>
    </div>
  );
};

export default UserProfileDropdown;
