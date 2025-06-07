
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Calendar } from 'lucide-react';

interface AnalysisSelectorProps {
  onAnalysisSelect: (analysisId: string) => void;
  selectedAnalysisId?: string;
  disabled?: boolean;
}

const AnalysisSelector: React.FC<AnalysisSelectorProps> = ({
  onAnalysisSelect,
  selectedAnalysisId,
  disabled = false
}) => {
  const { user } = useAuth();

  const { data: analyses, isLoading } = useQuery({
    queryKey: ['user-analyses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('analysis_results')
        .select('id, job_title, company_name, created_at, compatibility_score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="text-caption text-gray-600">Loading your analyses...</div>
      </div>
    );
  }

  if (!analyses || analyses.length === 0) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center space-x-2 text-caption text-gray-600">
          <FileText className="h-4 w-4" />
          <span>No previous analyses found. Analyze a CV first to generate cover letters from your analysis history.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Select onValueChange={onAnalysisSelect} value={selectedAnalysisId} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select from your previous analyses" />
        </SelectTrigger>
        <SelectContent>
          {analyses.map((analysis) => (
            <SelectItem key={analysis.id} value={analysis.id}>
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col items-start">
                  <span className="font-medium">
                    {analysis.job_title} at {analysis.company_name}
                  </span>
                  <div className="flex items-center space-x-2 text-micro text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(analysis.created_at!)}</span>
                    <span>•</span>
                    <span>{analysis.compatibility_score}% match</span>
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedAnalysisId && (
        <div className="text-caption text-green-600 bg-green-50 p-2 rounded">
          ✓ CV and job description will be used from your selected analysis
        </div>
      )}
    </div>
  );
};

export default AnalysisSelector;
