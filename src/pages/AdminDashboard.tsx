
import React, { useState, useEffect } from 'react';
import { Users, CreditCard, FileText, Settings, ChevronLeft, ChevronRight, Mail, BrainCircuit } from 'lucide-react';
import UserManagement from '@/components/admin/UserManagement';
import CreditManagement from '@/components/admin/CreditManagement';
import AnalysisLogsManagement from '@/components/admin/AnalysisLogsManagement';
import AIPromptsManagement from '@/components/admin/AIPromptsManagement';
import SiteSettingsManagement from '@/components/admin/SiteSettingsManagement';

import AdminNavigation from '@/components/admin/AdminNavigation';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Error', description: 'Authentication required', variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Check if user has admin role
      const { data: hasRole, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (error) {
        console.error('Error checking admin role:', error);
        toast({ title: 'Error', description: 'Failed to verify admin access', variant: 'destructive' });
      } else {
        setHasAdminAccess(hasRole);
        if (!hasRole) {
          toast({ title: 'Access Denied', description: 'Admin privileges required', variant: 'destructive' });
        }
      }
    } catch (error) {
      console.error('Error in checkAdminAccess:', error);
      toast({ title: 'Error', description: 'Failed to verify access', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'credits':
        return <CreditManagement />;
      case 'logs':
        return <AnalysisLogsManagement />;
      case 'ai-prompts':
        return <AIPromptsManagement />;
      case 'site-settings':
        return <SiteSettingsManagement />;
      case 'email-templates':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-title font-semibold text-blueberry mb-4">Email Templates</h2>
            <p className="text-blueberry/70">Email template management will be added here.</p>
          </div>
        );
      default:
        return <UserManagement />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-apple-core/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-apple-core/10 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-display font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-apple-core/10">
      <AdminNavigation />
      <div className="flex">
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-sm border-r min-h-screen border-apple-core/30 transition-all duration-300 relative`}>
          {/* Collapse toggle button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-4 top-6 z-10 bg-white border border-gray-200 shadow-sm hover:shadow-md rounded-full w-8 h-8 p-0"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
          
          <div className="p-6 flex flex-col h-full">
            {!sidebarCollapsed && (
              <h2 className="text-heading font-semibold text-blueberry mb-6">Admin Dashboard</h2>
            )}
            <nav className="flex flex-col h-full">
              <div className="space-y-2 flex-1">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'px-2 justify-center' : 'px-3'} py-2 text-left rounded-md transition-colors ${
                    activeTab === 'users'
                      ? 'bg-citrus/20 text-blueberry border border-citrus/30'
                      : 'text-blueberry/70 hover:bg-apple-core/20'
                  }`}
                  title={sidebarCollapsed ? 'User Management' : undefined}
                >
                  <Users className={`h-5 w-5 text-apricot ${sidebarCollapsed ? '' : 'mr-3'}`} />
                  {!sidebarCollapsed && 'User Management'}
                </button>
                <button
                  onClick={() => setActiveTab('credits')}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'px-2 justify-center' : 'px-3'} py-2 text-left rounded-md transition-colors ${
                    activeTab === 'credits'
                      ? 'bg-citrus/20 text-blueberry border border-citrus/30'
                      : 'text-blueberry/70 hover:bg-apple-core/20'
                  }`}
                  title={sidebarCollapsed ? 'Credit Management' : undefined}
                >
                  <CreditCard className={`h-5 w-5 text-apricot ${sidebarCollapsed ? '' : 'mr-3'}`} />
                  {!sidebarCollapsed && 'Credit Management'}
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'px-2 justify-center' : 'px-3'} py-2 text-left rounded-md transition-colors ${
                    activeTab === 'logs'
                      ? 'bg-citrus/20 text-blueberry border border-citrus/30'
                      : 'text-blueberry/70 hover:bg-apple-core/20'
                  }`}
                  title={sidebarCollapsed ? 'Analysis Logs' : undefined}
                >
                  <FileText className={`h-5 w-5 text-apricot ${sidebarCollapsed ? '' : 'mr-3'}`} />
                  {!sidebarCollapsed && 'Analysis Logs'}
                </button>
                <button
                  onClick={() => setActiveTab('ai-prompts')}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'px-2 justify-center' : 'px-3'} py-2 text-left rounded-md transition-colors ${
                    activeTab === 'ai-prompts'
                      ? 'bg-citrus/20 text-blueberry border border-citrus/30'
                      : 'text-blueberry/70 hover:bg-apple-core/20'
                  }`}
                  title={sidebarCollapsed ? 'AI Prompts' : undefined}
                >
                  <BrainCircuit className={`h-5 w-5 text-apricot ${sidebarCollapsed ? '' : 'mr-3'}`} />
                  {!sidebarCollapsed && 'AI Prompts'}
                </button>
                <button
                  onClick={() => setActiveTab('email-templates')}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'px-2 justify-center' : 'px-3'} py-2 text-left rounded-md transition-colors ${
                    activeTab === 'email-templates'
                      ? 'bg-citrus/20 text-blueberry border border-citrus/30'
                      : 'text-blueberry/70 hover:bg-apple-core/20'
                  }`}
                  title={sidebarCollapsed ? 'Email Templates' : undefined}
                >
                  <Mail className={`h-5 w-5 text-apricot ${sidebarCollapsed ? '' : 'mr-3'}`} />
                  {!sidebarCollapsed && 'Email Templates'}
                </button>
              </div>
              
              {/* Site Settings anchored to bottom */}
              <div className="mt-auto pt-4 border-t border-apple-core/30">
                <button
                  onClick={() => setActiveTab('site-settings')}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'px-2 justify-center' : 'px-3'} py-2 text-left rounded-md transition-colors ${
                    activeTab === 'site-settings'
                      ? 'bg-citrus/20 text-blueberry border border-citrus/30'
                      : 'text-blueberry/70 hover:bg-apple-core/20'
                  }`}
                  title={sidebarCollapsed ? 'Site Settings' : undefined}
                >
                  <Settings className={`h-5 w-5 text-apricot ${sidebarCollapsed ? '' : 'mr-3'}`} />
                  {!sidebarCollapsed && 'Site Settings'}
                </button>
              </div>
            </nav>
          </div>
        </div>
        <div className="flex-1 p-8">
          <Breadcrumbs />
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
