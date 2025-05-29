
import React from 'react';
import { User, CreditCard, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileHeaderProps {
  credits: number;
  memberSince: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ credits, memberSince }) => {
  const { user } = useAuth();

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center space-x-4">
        <div className="bg-blue-100 rounded-full p-3">
          <User className="h-8 w-8 text-blue-600" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
          </h1>
          <p className="text-gray-600">{user?.email}</p>
        </div>
        <div className="flex space-x-6">
          <div className="text-center">
            <div className="flex items-center space-x-1">
              <CreditCard className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{credits}</span>
            </div>
            <p className="text-sm text-gray-500">Credits</p>
          </div>
          <div className="text-center">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{memberSince}</span>
            </div>
            <p className="text-sm text-gray-500">Member since</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
