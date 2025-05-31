import React, { useState, useEffect } from 'react';
import { Search, Eye, FileText, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AnalysisLogDetailModal from './AnalysisLogDetailModal';

interface AnalysisLog {
  id: string;
  user_email: string;
  first_name: string;
  last_name: string;
  job_title: string;
  company_name: string;
  compatibility_score: number;
  cv_file_name: string;
  job_description_file_name: string;
  openai_model: string;
  processing_time_ms: number;
  tokens_used: number;
  status: string;
  created_at: string;
  prompt_text: string;
  response_text: string;
  error_message: string;
}

const AnalysisLogsManagement = () => {
  const [logs, setLogs] = useState<AnalysisLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AnalysisLog | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      // Ensure user is authenticated before making admin queries
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Error', description: 'Authentication required', variant: 'destructive' });
        return;
      }

      const { data, error } = await supabase
        .from('analysis_logs_with_details')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading analysis logs:', error);
      toast({ title: 'Error', description: 'Failed to load analysis logs', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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
        <h1 className="text-2xl font-bold text-gray-900">Analysis Logs</h1>
        <div className="text-sm text-gray-500">
          Total Logs: {logs.length} | Filtered: {filteredLogs.length}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user, job title, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Job Details</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900">
                      {log.first_name || 'N/A'} {log.last_name || ''}
                    </div>
                    <div className="text-sm text-gray-500">{log.user_email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900">{log.job_title || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{log.company_name || 'N/A'}</div>
                    {log.compatibility_score && (
                      <div className="text-xs text-blue-600">Score: {log.compatibility_score}%</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {log.openai_model}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{log.processing_time_ms}ms</div>
                    {log.tokens_used && (
                      <div className="text-gray-500">{log.tokens_used} tokens</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(log.status)}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">
                  {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="View Prompt & Response"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedLog && (
        <AnalysisLogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
};

export default AnalysisLogsManagement;
