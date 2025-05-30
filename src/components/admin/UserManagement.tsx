
import React, { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import UserDetailModal from './UserDetailModal';

interface UserStats {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  credits: number;
  total_analyses: number;
  last_analysis: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserStats | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Get all users from auth.users via profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          created_at
        `);

      if (profilesError) throw profilesError;

      // Get credits for all users
      const { data: creditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('user_id, credits');

      if (creditsError) throw creditsError;

      // Get analysis counts and last analysis for all users
      const { data: analysesData, error: analysesError } = await supabase
        .from('analysis_results')
        .select('user_id, created_at');

      if (analysesError) throw analysesError;

      // Combine the data
      const usersWithStats = profilesData?.map(profile => {
        const userCredits = creditsData?.find(c => c.user_id === profile.id);
        const userAnalyses = analysesData?.filter(a => a.user_id === profile.id) || [];
        const lastAnalysis = userAnalyses.length > 0 
          ? Math.max(...userAnalyses.map(a => new Date(a.created_at).getTime()))
          : null;

        return {
          user_id: profile.id,
          email: profile.email || '',
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          created_at: profile.created_at || '',
          credits: userCredits?.credits || 0,
          total_analyses: userAnalyses.length,
          last_analysis: lastAnalysis ? new Date(lastAnalysis).toISOString() : ''
        };
      }) || [];

      console.log('Loaded users:', usersWithStats.length);
      setUsers(usersWithStats);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <div className="text-sm text-gray-500">
          Total Users: {users.length}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Analyses</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.user_id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900">
                      {user.first_name || 'N/A'} {user.last_name || ''}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">{user.email}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.credits} credits
                  </span>
                </TableCell>
                <TableCell className="text-gray-600">{user.total_analyses}</TableCell>
                <TableCell className="text-gray-600">
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-gray-600">
                  {user.last_analysis 
                    ? new Date(user.last_analysis).toLocaleDateString()
                    : 'Never'
                  }
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No users found matching your search.' : 'No users found.'}
          </div>
        )}
      </div>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={loadUsers}
        />
      )}
    </div>
  );
};

export default UserManagement;
