
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, TrendingUp, Users, DollarSign } from 'lucide-react';

const CreditManagement = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCredits: 0,
    averageCredits: 0,
    totalAnalyses: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCreditStats();
  }, []);

  const loadCreditStats = async () => {
    try {
      // Get total users count
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Get total credits
      const { data: creditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('credits');

      if (creditsError) throw creditsError;

      // Get total analyses count
      const { count: totalAnalyses, error: analysesError } = await supabase
        .from('analysis_results')
        .select('*', { count: 'exact', head: true });

      if (analysesError) throw analysesError;

      const totalCredits = creditsData?.reduce((sum, user) => sum + (user.credits || 0), 0) || 0;
      const averageCredits = totalUsers && totalUsers > 0 ? Math.round(totalCredits / totalUsers * 100) / 100 : 0;

      setStats({
        totalUsers: totalUsers || 0,
        totalCredits,
        averageCredits,
        totalAnalyses: totalAnalyses || 0
      });
    } catch (error) {
      console.error('Error loading credit statistics:', error);
      toast({ title: 'Error', description: 'Failed to load credit statistics', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-title font-bold text-foreground">Credit Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-caption font-medium text-gray-600">Total Users</p>
              <p className="text-title font-bold text-foreground">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-caption font-medium text-gray-600">Total Credits</p>
              <p className="text-title font-bold text-foreground">{stats.totalCredits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-caption font-medium text-gray-600">Avg Credits/User</p>
              <p className="text-title font-bold text-foreground">{stats.averageCredits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-caption font-medium text-gray-600">Total Analyses</p>
              <p className="text-title font-bold text-foreground">{stats.totalAnalyses}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-subheading font-semibold text-foreground mb-4">Credit Management Tools</h2>
        <p className="text-gray-600">
          Use the User Management section to add credits to individual user accounts. 
          Credit statistics are updated in real-time as users consume credits for AI-powered analyses.
        </p>
      </div>
    </div>
  );
};

export default CreditManagement;
