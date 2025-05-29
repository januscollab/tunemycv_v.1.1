
import React, { useState, useEffect } from 'react';
import { X, CreditCard, FileText, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserDetailModalProps {
  user: {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    created_at: string;
    credits: number;
    total_analyses: number;
    last_analysis: string;
  };
  onClose: () => void;
  onUpdate: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose, onUpdate }) => {
  const [creditsToAdd, setCreditsToAdd] = useState('');
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalysisHistory();
  }, [user.user_id]);

  const loadAnalysisHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('analysis_results')
        .select(`
          *,
          job_description_upload:uploads!job_description_upload_id(file_name, job_title)
        `)
        .eq('user_id', user.user_id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAnalysisHistory(data || []);
    } catch (error) {
      console.error('Error loading analysis history:', error);
    }
  };

  const handleAddCredits = async () => {
    if (!creditsToAdd || isNaN(Number(creditsToAdd))) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_credits')
        .update({ 
          credits: user.credits + Number(creditsToAdd),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.user_id);

      if (error) throw error;

      toast({ title: 'Success', description: `Added ${creditsToAdd} credits to user account` });
      setCreditsToAdd('');
      onUpdate();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add credits', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.first_name || 'N/A'} {user.last_name || ''}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Member Since</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-700">
                    {user.credits} credits remaining
                  </span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">
                    {user.total_analyses} total analyses
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="text-sm text-gray-700">
                    Last activity: {user.last_analysis 
                      ? new Date(user.last_analysis).toLocaleDateString()
                      : 'Never'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Credit Management</h3>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                value={creditsToAdd}
                onChange={(e) => setCreditsToAdd(e.target.value)}
                placeholder="Credits to add"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddCredits}
                disabled={loading || !creditsToAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add Credits'}
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Analysis History</h3>
            <div className="space-y-3">
              {analysisHistory.length > 0 ? (
                analysisHistory.map((analysis) => (
                  <div key={analysis.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {analysis.job_title || 'Untitled Position'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Company: {analysis.company_name || 'Not specified'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(analysis.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {analysis.compatibility_score}% match
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No analysis history found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
