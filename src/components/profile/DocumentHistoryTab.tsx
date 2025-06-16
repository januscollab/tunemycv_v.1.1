import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Eye, Download, MessageSquare, Trash2 } from 'lucide-react';
import { DocumentHistory, DocumentItem as DesignSystemDocumentItem, DocumentAction } from '@/components/ui/profile-document-history';
import DownloadOptions from '@/components/cover-letter/DownloadOptions';
import EditTitleDialog from '@/components/ui/edit-title-dialog';
import { Button } from '@/components/ui/button';

// Local DocumentItem interface that extends the design system one
interface DocumentItem extends DesignSystemDocumentItem {
  executive_summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
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
      // Load analysis results with cover letter check
      const { data: analysisData, error: analysisError } = await supabase
        .from('analysis_results')
        .select(`
          *,
          cover_letters(id)
        `)
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
        job_title: analysis.job_title,
        has_cover_letter: analysis.cover_letters && analysis.cover_letters.length > 0,
        executive_summary: analysis.executive_summary,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendations: analysis.recommendations
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

  const handleDelete = async (document: DocumentItem) => {
    if (!window.confirm(`Are you sure you want to delete this ${document.type === 'analysis' ? 'analysis' : 'cover letter'}?`)) {
      return;
    }

    try {
      const tableName = document.type === 'analysis' ? 'analysis_results' : 'cover_letters';
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', document.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => doc.id !== document.id));
      toast({ title: 'Success', description: `${document.type === 'analysis' ? 'Analysis' : 'Cover letter'} deleted successfully` });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete document', variant: 'destructive' });
    }
  };

  const handleView = (document: DocumentItem) => {
    if (document.type === 'analysis') {
      navigate('/analyze', { 
        state: { 
          analysisId: document.id,
          activeTab: 'view-analysis'
        } 
      });
    } else {
      navigate('/cover-letter', {
        state: {
          coverLetterId: document.id,
          viewMode: true,
          activeTab: 'Current Result'
        }
      });
    }
  };

  const handleDocumentClick = (document: DocumentItem) => {
    if (document.type === 'cover_letter') {
      navigate('/cover-letter', {
        state: {
          coverLetterId: document.id,
          viewMode: false, // Edit mode
          activeTab: 'Current Result'
        }
      });
    } else {
      handleView(document);
    }
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

  // Define actions for each document
  const getDocumentActions = (document: DocumentItem): DocumentAction[] => {
    const actions: DocumentAction[] = [
      {
        label: 'View',
        icon: <Eye className="h-4 w-4 mr-2" />,
        onClick: (doc) => handleView(doc)
      },
      {
        label: 'Download',
        icon: <Download className="h-4 w-4 mr-2" />,
        onClick: (doc) => {
          // Create download content
          const content = doc.type === 'analysis' 
            ? `CV ANALYSIS REPORT
==================

Job Title: ${doc.job_title || 'Untitled Position'}
Company: ${doc.company_name || 'Company not specified'}
Compatibility Score: ${doc.compatibility_score}%
Date: ${new Date(doc.created_at).toLocaleDateString()}

EXECUTIVE SUMMARY
================
${(doc as DocumentItem).executive_summary || 'No executive summary available'}

STRENGTHS
=========
${(doc as DocumentItem).strengths?.map((strength, index) => `${index + 1}. ${strength}`).join('\n') || 'No strengths listed'}

AREAS FOR IMPROVEMENT
====================
${(doc as DocumentItem).weaknesses?.map((weakness, index) => `${index + 1}. ${weakness}`).join('\n') || 'No weaknesses listed'}

RECOMMENDATIONS
===============
${(doc as DocumentItem).recommendations?.map((rec, index) => `${index + 1}. ${rec}`).join('\n') || 'No recommendations available'}

---
Generated by TuneMyCV - Your AI-Powered Career Assistant`
            : doc.content || '';
          
          const fileName = doc.type === 'analysis' 
            ? `CV_Analysis_${doc.job_title || 'Untitled'}_${doc.company_name || 'Company'}`
            : `Cover_Letter_${doc.job_title || 'Untitled'}_${doc.company_name || 'Company'}`;
          
          // Create and trigger download
          const blob = new Blob([content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = window.document.createElement('a');
          link.href = url;
          link.download = `${fileName}.txt`;
          window.document.body.appendChild(link);
          link.click();
          window.document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      },
      {
        label: 'Delete',
        icon: <Trash2 className="h-4 w-4 mr-2" />,
        onClick: (doc) => handleDelete(doc),
        variant: 'destructive'
      }
    ];

    // Add analysis-specific actions
    if (document.type === 'analysis') {
      actions.splice(2, 0, {
        label: document.has_cover_letter ? 'View Cover Letter' : 'Generate Cover Letter',
        icon: <FileText className="h-4 w-4 mr-2" />,
        onClick: (doc) => {
          navigate('/cover-letter', {
            state: {
              analysisId: doc.id,
              activeTab: 'generate'
            }
          });
        },
        variant: document.has_cover_letter ? 'success' : 'default'
      });

      actions.splice(3, 0, {
        label: 'Create Interview Prep',
        icon: <MessageSquare className="h-4 w-4 mr-2" />,
        onClick: (doc) => {
          navigate('/interview-prep', {
            state: {
              analysisId: doc.id,
              jobTitle: doc.job_title,
              companyName: doc.company_name
            }
          });
        }
      });
    }

    // Cover letter specific actions removed as requested

    return actions;
  };

  return (
    <div className="space-y-6">
      <DocumentHistory
        header={{
          title: "Document History",
          totalCount: filteredDocuments.length,
          filterType: filterType,
          onFilterChange: (filter) => setFilterType(filter),
          itemsPerPage: itemsPerPage,
          onItemsPerPageChange: (count) => setItemsPerPage(count),
          showPagination: filteredDocuments.length > 0
        }}
        documents={paginatedDocuments}
        loading={loading}
        onDocumentClick={handleDocumentClick}
        onEditTitle={handleEditTitle}
        actions={getDocumentActions}
        emptyState={{
          title: "No documents found",
          description: filterType === 'all' 
            ? "You haven't created any analyses or cover letters yet."
            : `No ${filterType === 'analysis' ? 'CV analyses' : 'cover letters'} found.`,
          icon: <FileText className="h-12 w-12" />
        }}
        pagination={totalPages > 1 ? {
          currentPage: currentPage,
          totalPages: totalPages,
          onPageChange: (page) => setCurrentPage(page)
        } : undefined}
      />

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