
import React, { useState } from 'react';
import { Users, CreditCard } from 'lucide-react';
import UserManagement from '@/components/admin/UserManagement';
import CreditManagement from '@/components/admin/CreditManagement';
import AdminNavigation from '@/components/admin/AdminNavigation';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'credits':
        return <CreditManagement />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-apple-core/10">
      <AdminNavigation />
      <div className="flex">
        <div className="w-64 bg-white shadow-sm border-r min-h-screen border-apple-core/30">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-blueberry mb-6">Admin Dashboard</h2>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                  activeTab === 'users'
                    ? 'bg-citrus/20 text-blueberry border border-citrus/30'
                    : 'text-blueberry/70 hover:bg-apple-core/20'
                }`}
              >
                <Users className="h-5 w-5 mr-3 text-apricot" />
                User Management
              </button>
              <button
                onClick={() => setActiveTab('credits')}
                className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                  activeTab === 'credits'
                    ? 'bg-citrus/20 text-blueberry border border-citrus/30'
                    : 'text-blueberry/70 hover:bg-apple-core/20'
                }`}
              >
                <CreditCard className="h-5 w-5 mr-3 text-apricot" />
                Credit Management
              </button>
            </nav>
          </div>
        </div>
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
