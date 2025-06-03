
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { toast } from 'sonner';

interface UserProfileDropdownProps {
  userDisplayName: string;
  isActive: (path: string) => boolean;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ userDisplayName, isActive }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { signOut } = useAuth();
  const { isAdmin } = useAdminAuth();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
      // Force navigate to home even if logout failed
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center px-3 py-2 text-sm font-semibold transition-colors relative ${
          isActive('/profile')
            ? 'text-zapier-orange'
            : 'text-earth hover:text-zapier-orange'
        }`}
      >
        <User className="h-4 w-4 mr-2" />
        Profile
        <ChevronDown className="h-4 w-4 ml-1" />
        {isActive('/profile') && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zapier-orange"></div>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
           <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border rounded-lg shadow-lg z-20">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-sm text-earth hover:bg-cream/50 transition-colors"
            >
              <User className="h-4 w-4 mr-2 inline" />
              Profile Settings
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-sm text-earth hover:bg-cream/50 transition-colors border-t border-border"
              >
                <Shield className="h-4 w-4 mr-2 inline" />
                Admin Dashboard
              </Link>
            )}
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              disabled={isLoggingOut}
              className="w-full text-left px-4 py-3 text-sm text-earth hover:bg-cream/50 transition-colors border-t border-border disabled:opacity-50"
            >
              <LogOut className="h-4 w-4 mr-2 inline" />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfileDropdown;
