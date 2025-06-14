import React, { useState, useEffect } from 'react';
import { Search, Eye, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import UserDetailModal from './UserDetailModal';
import DeleteUserDialog from './DeleteUserDialog';

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
  const [userToDelete, setUserToDelete] = useState<UserStats | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Get users with their profiles, credits, and analysis data
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

      setUsers(usersWithStats);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setDeleteLoading(true);
    try {
      const { error } = await supabase.rpc('delete_user_admin', {
        _user_id: userToDelete.user_id
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User has been deleted successfully',
      });

      // Refresh the users list
      await loadUsers();
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete user',
        variant: 'destructive'
      });
    } finally {
      setDeleteLoading(false);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-title font-bold text-foreground">User Management</h1>
        <div className="text-caption text-muted-foreground">
          Total Users: {users.length}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-background text-foreground"
          />
        </div>
      </div>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
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
                    <div className="font-medium text-foreground">
                      {user.first_name || 'N/A'} {user.last_name || ''}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-caption font-medium bg-primary-50 text-primary">
                    {user.credits} credits
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.total_analyses}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.last_analysis 
                    ? new Date(user.last_analysis).toLocaleDateString()
                    : 'Never'
                  }
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="p-1 text-muted-foreground hover:text-primary transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setUserToDelete(user)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={loadUsers}
        />
      )}

      <DeleteUserDialog
        user={userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
        loading={deleteLoading}
      />
    </div>
  );
};

export default UserManagement;