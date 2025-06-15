import React, { useState, useEffect } from 'react';
import { Search, Eye, Clock, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Calendar, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
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
  operation_type: string;
  entry_status: string;
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
  const [operationFilter, setOperationFilter] = useState('all');
  const [entryStatusFilter, setEntryStatusFilter] = useState('all');
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
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
        .order('created_at', { ascending: false });

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
    const matchesOperation = operationFilter === 'all' || log.operation_type === operationFilter;
    const matchesEntryStatus = entryStatusFilter === 'all' || log.entry_status === entryStatusFilter;
    
    return matchesSearch && matchesStatus && matchesOperation && matchesEntryStatus;
  });

  // Pagination logic
  const totalPages = pageSize === 999999 ? 1 : Math.ceil(filteredLogs.length / pageSize);
  const startIndex = pageSize === 999999 ? 0 : (currentPage - 1) * pageSize;
  const endIndex = pageSize === 999999 ? filteredLogs.length : startIndex + pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-success-50 text-success';
      case 'error':
        return 'bg-destructive-50 text-destructive';
      default:
        return 'bg-warning-50 text-warning';
    }
  };

  const getOperationTypeIcon = (operationType: string) => {
    switch (operationType) {
      case 'cv_analysis':
        return '📄';
      case 'cover_letter':
        return '✉️';
      default:
        return '📊';
    }
  };

  const getEntryStatusBadge = (entryStatus: string) => {
    const variant = entryStatus === 'active' ? 'default' : 'secondary';
    const color = entryStatus === 'active' ? 'bg-success-50 text-success' : 'bg-muted text-muted-foreground';
    
    return (
      <Badge variant={variant} className={`${color} flex items-center gap-1`}>
        <Tag className="h-3 w-3" />
        {entryStatus}
      </Badge>
    );
  };

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
        <h1 className="text-title font-bold text-foreground">Analysis Logs</h1>
        <div className="text-caption text-muted-foreground">
          Total Logs: {logs.length} | Filtered: {filteredLogs.length} | Page: {currentPage} of {totalPages}
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-card p-4 rounded-lg border border-border space-y-4">
        <div className="flex items-center space-x-4 flex-wrap gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by user, job title, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>

          <Select value={operationFilter} onValueChange={setOperationFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="cv_analysis">CV Analysis</SelectItem>
              <SelectItem value="cover_letter_generation">Cover Letter</SelectItem>
            </SelectContent>
          </Select>

          <Select value={entryStatusFilter} onValueChange={setEntryStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Entry Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entries</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
            </SelectContent>
          </Select>

          <Select value={pageSize.toString()} onValueChange={(value) => {
            setPageSize(value === 'all' ? 999999 : parseInt(value));
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Page Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Job Details</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Entry Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900">
                      {log.first_name || 'N/A'} {log.last_name || ''}
                    </div>
                    <div className="text-caption text-gray-500">{log.user_email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900">{log.job_title || 'N/A'}</div>
                    <div className="text-caption text-gray-500">{log.company_name || 'N/A'}</div>
                    {log.compatibility_score && (
                      <div className="text-micro text-blue-600">Score: {log.compatibility_score}%</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="text-subheading">{getOperationTypeIcon(log.operation_type)}</span>
                    <span className="text-caption font-medium capitalize">
                      {log.operation_type === 'cover_letter_generation' ? 'Cover Letter' : log.operation_type === 'cv_analysis' ? 'CV Analysis' : (log.operation_type?.replace('_', ' ') || 'Analysis')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-micro font-medium bg-blue-100 text-blue-800">
                    {log.openai_model}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-caption">
                    <div>{log.processing_time_ms}ms</div>
                    {log.tokens_used && (
                      <div className="text-gray-500">{log.tokens_used} tokens</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(log.status)}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-micro font-medium ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {getEntryStatusBadge(log.entry_status)}
                </TableCell>
                <TableCell className="text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span className="text-caption">
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-micro text-gray-500">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </div>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => setSelectedLog(log)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pageSize !== 999999 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-caption text-gray-500">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10 h-8"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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