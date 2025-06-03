import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Calendar, Building, Eye, Edit2, Trash2, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import DownloadOptions from '@/components/cover-letter/DownloadOptions';
import EditTitleDialog from '@/components/ui/edit-title-dialog';

interface DocumentItem {
  id: string;
  type: 'analysis' | 'cover_letter';
  title: string;
  company_name?: string;
  created_at: string;
  compatibility_score?: number;
  regeneration_count?: number;
  content?: string;
  job_title?: string;
  analysis_result_id?: string;
}

interface DocumentHistoryTabProps {
  credits: number;
  memberSince: string;
}

const DocumentHistoryTab: React.FC<DocumentHistoryTabProps> = ({ credits, memberSince }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterType, setFilterType] = useState<'all' | 'analysis' | 'cover_letter'>('all');
  const [editingDocument, setEditingDocument] = useState<{id: string, title: string, type: 'analysis' | 'cover_letter'} | null>(null);

  useEffect(() => {
    if (user) {
      loadDocumentHistory();
    }
  }, [user]);

  const loadDocumentHistory = async () => {
    try {
      // Load analysis results
      const { data: analysisData, error: analysisError } = await supabase
        .from('analysis_results')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (analysisError) throw analysisError;

      // Load cover letters
      const { data: coverLetterData, error: coverLetterError } = await supabase
        .from('cover_letters')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (coverLetterError) throw coverLetterError;

      // Transform and combine data
      const analysisDocuments: DocumentItem[] = (analysisData || []).map(analysis => ({
        id: analysis.id,
        type: 'analysis' as const,
        title: analysis.job_title || 'Untitled Analysis',
        company_name: analysis.company_name,
        created_at: analysis.created_at,
        compatibility_score: analysis.compatibility_score,
        job_title: analysis.job_title
      }));

      const coverLetterDocuments: DocumentItem[] = (coverLetterData || []).map(letter => ({
        id: letter.id,
        type: 'cover_letter' as const,
        title: `${letter.job_title} at ${letter.company_name}`,
        company_name: letter.company_name,
        created_at: letter.created_at,
        regeneration_count: letter.regeneration_count,
        content: letter.content,
        job_title: letter.job_title,
        analysis_result_id: letter.analysis_result_id
      }));

      // Combine and sort by date
      const allDocuments = [...analysisDocuments, ...coverLetterDocuments]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setDocuments(allDocuments);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load document history', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTitle = async (documentId: string, newTitle: string, type: 'analysis' | 'cover_letter') => {
    try {
      if (type === 'analysis') {
        const { error } = await supabase
          .from('analysis_results')
          .update({ job_title: newTitle })
          .eq('id', documentId)
          .eq('user_id', user?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cover_letters')
          .update({ job_title: newTitle })
          .eq('id', documentId)
          .eq('user_id', user?.id);

        if (error) throw error;
      }

      // Update local state
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, title: type === 'analysis' ? newTitle : `${newTitle} at ${doc.company_name}`, job_title: newTitle }
          : doc
      ));

      toast({ title: 'Success', description: 'Title updated successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update title', variant: 'destructive' });
    }
  };

  const handleDelete = async (documentId: string, type: 'analysis' | 'cover_letter') => {
    if (!window.confirm(`Are you sure you want to delete this ${type === 'analysis' ? 'analysis' : 'cover letter'}?`)) {
      return;
    }

    try {
      const tableName = type === 'analysis' ? 'analysis_results' : 'cover_letters';
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', documentId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast({ title: 'Success', description: `${type === 'analysis' ? 'Analysis' : 'Cover letter'} deleted successfully` });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete document', variant: 'destructive' });
    }
  };

  const handleView = (document: DocumentItem) => {
    if (document.type === 'analysis') {
      navigate('/analyze', { 
        state: { 
          analysisId: document.id,
          activeTab: 'results'
        } 
      });
    } else {
      navigate('/cover-letter', {
        state: {
          coverLetterId: document.id,
          viewMode: true,
          activeTab: 'result'
        }
      });
    }
  };

  const handleViewCVAnalysis = async (analysisId: string) => {
    navigate('/analyze', { 
      state: { 
        analysisId: analysisId,
        activeTab: 'results',
        viewMode: true
      } 
    });
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => 
    filterType === 'all' || doc.type === filterType
  );

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

  // Reset to first page when filter or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, itemsPerPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Document History</h2>
          <p className="text-gray-600 mt-1">
            {filteredDocuments.length} total
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Filter:</span>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                <SelectItem value="analysis">CV Analysis</SelectItem>
                <SelectItem value="cover_letter">Cover Letters</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {filteredDocuments.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Show:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          )}
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">
            {filterType === 'all' 
              ? "You haven't created any analyses or cover letters yet."
              : `No ${filterType === 'analysis' ? 'CV analyses' : 'cover letters'} found.`
            }
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedDocuments.map((document) => (
              <div key={`${document.type}-${document.id}`} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow hover:border-zapier-orange/50 relative">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {document.job_title || 'Untitled'}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingDocument({
                            id: document.id,
                            title: document.job_title || '',
                            type: document.type
                          });
                        }}
                        className="text-gray-400 hover:text-zapier-orange transition-colors"
                        title="Edit title"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      
                      {document.type === 'analysis' && document.compatibility_score && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {document.compatibility_score}% match
                        </span>
                      )}
                      
                      {document.type === 'cover_letter' && document.regeneration_count > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          v{document.regeneration_count + 1}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Building className="h-4 w-4 mr-1" />
                      <span>{document.company_name || 'Company not specified'}</span>
                      <span className="mx-2">•</span>
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(document.created_at).toLocaleDateString()} at {new Date(document.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  
                  {/* Document type identifier on the right */}
                  <div className="text-xs uppercase font-medium text-gray-500 flex items-center">
                    {document.type === 'analysis' ? (
                      <span className="flex items-center">
                        <FileText className="h-3 w-3 mr-1 text-blue-600" />
                        CV Analysis
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <FileText className="h-3 w-3 mr-1 text-green-600" />
                        Cover Letter
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Action buttons row at bottom */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(document);
                      }}
                      className="flex items-center px-2 py-1 text-xs text-black hover:text-zapier-orange transition-colors"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </button>
                    
                    {document.type === 'cover_letter' && document.analysis_result_id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewCVAnalysis(document.analysis_result_id!);
                        }}
                        className="flex items-center px-2 py-1 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        View CV Analysis
                      </button>
                    )}
                    
                    <DownloadOptions
                      content={document.type === 'analysis' 
                        ? `CV Analysis Report for ${document.job_title}` 
                        : document.content || `Cover Letter for ${document.job_title}`
                      }
                      fileName={`${document.type === 'analysis' ? 'CV_Analysis' : 'Cover_Letter'}_${document.job_title?.replace(/[^a-zA-Z0-9]/g, '_') || 'Document'}_${new Date().toISOString().split('T')[0]}`}
                      triggerComponent={
                        <button className="flex items-center px-2 py-1 text-xs text-black hover:text-zapier-orange hover:bg-zapier-orange/10 rounded-md transition-colors">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </button>
                      }
                    />
                  </div>
                  
                  {/* Delete button in bottom right */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(document.id, document.type);
                    }}
                    className="p-1 text-xs text-red-600 hover:text-zapier-orange transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={`${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''} text-sm font-normal`}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        isActive={currentPage === page}
                        className="text-sm font-normal"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={`${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''} text-sm font-normal`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      <EditTitleDialog
        isOpen={!!editingDocument}
        onClose={() => setEditingDocument(null)}
        onSave={(newTitle) => {
          if (editingDocument) {
            handleEditTitle(editingDocument.id, newTitle, editingDocument.type);
          }
          setEditingDocument(null);
        }}
        currentTitle={editingDocument?.title || ''}
        titleType={editingDocument?.type === 'analysis' ? 'analysis' : 'cover-letter'}
      />
    </div>
  );
};

export default DocumentHistoryTab;