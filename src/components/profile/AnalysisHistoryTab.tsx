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
  analysis_type?: string;
  n8n_html_url?: string;
  n8n_pdf_url?: string;
  pdf_file_data?: string;
  html_file_data?: string;
}

interface AnalysisHistoryTabProps {
  credits: number;
  memberSince: string;
}

const AnalysisHistoryTab: React.FC<AnalysisHistoryTabProps> = ({ credits, memberSince }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingDocument, setEditingDocument] = useState<{id: string, title: string, type: 'analysis'} | null>(null);

  useEffect(() => {
    if (user) {
      loadAnalysisHistory();
    }
  }, [user]);

  const loadAnalysisHistory = async () => {
    try {
      // Load analysis results with cover letter check
      const { data: analysisData, error: analysisError } = await supabase
        .from('analysis_results')
        .select(`
          *,
          cover_letters(id)
        `)
        .eq('user_id', user?.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (analysisError) throw analysisError;

      // Transform data
      const analysisDocuments: DocumentItem[] = (analysisData || []).map(analysis => ({
        id: analysis.id,
        type: 'analysis' as const,
        title: analysis.job_title || 'Untitled Analysis',
        company_name: analysis.company_name,
        created_at: analysis.created_at,
        compatibility_score: analysis.compatibility_score,
        job_title: analysis.job_title,
        has_cover_letter: Array.isArray(analysis.cover_letters) && analysis.cover_letters.length > 0,
        executive_summary: analysis.executive_summary,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendations: analysis.recommendations,
        analysis_type: analysis.analysis_type,
        n8n_html_url: analysis.n8n_html_url,
        n8n_pdf_url: analysis.n8n_pdf_url,
        pdf_file_data: analysis.pdf_file_data,
        html_file_data: analysis.html_file_data
      }));

      setDocuments(analysisDocuments);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load analysis history', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTitle = async (documentId: string, newTitle: string, type: 'analysis') => {
    try {
      const { error } = await supabase
        .from('analysis_results')
        .update({ job_title: newTitle })
        .eq('id', documentId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Update local state
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, title: newTitle, job_title: newTitle }
          : doc
      ));

      toast({ title: 'Success', description: 'Title updated successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update title', variant: 'destructive' });
    }
  };

  const handleDelete = async (document: DocumentItem) => {
    if (!window.confirm(`Are you sure you want to delete this analysis?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('analysis_results')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', document.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => doc.id !== document.id));
      toast({ title: 'Success', description: 'Analysis deleted successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete analysis', variant: 'destructive' });
    }
  };

  const handleView = (document: DocumentItem) => {
    // For n8n analysis with PDF data, navigate to view-analysis tab
    // For other analyses, also go to view-analysis tab
    navigate('/analyze', { 
      state: { 
        analysis: document,
        targetTab: 'view-analysis',
        // Pass PDF preference for n8n analyses
        preferPdfView: document.analysis_type === 'n8n' && document.pdf_file_data
      } 
    });
  };

  const handleDocumentClick = (document: DocumentItem) => {
    handleView(document);
  };

  // Pagination
  const totalPages = Math.ceil(documents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = documents.slice(startIndex, endIndex);

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

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
          // Handle download logic here - prioritize n8n content
          const docItem = doc as DocumentItem;
          let content = '';
          let fileName = '';
          
          if (docItem.analysis_type === 'n8n' && (docItem.pdf_file_data || docItem.html_file_data || docItem.n8n_pdf_url)) {
            // For n8n analysis, try to download PDF first
            if (docItem.pdf_file_data) {
              // Download stored PDF data
              const binaryString = atob(docItem.pdf_file_data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const blob = new Blob([bytes], { type: 'application/pdf' });
              const url = URL.createObjectURL(blob);
              const link = window.document.createElement('a');
              link.href = url;
              link.download = `CV_Analysis_${doc.job_title || 'Untitled'}_${doc.company_name || 'Company'}.pdf`;
              window.document.body.appendChild(link);
              link.click();
              window.document.body.removeChild(link);
              URL.revokeObjectURL(url);
              return;
            } else if (docItem.n8n_pdf_url) {
              // Download from n8n URL
              window.open(docItem.n8n_pdf_url, '_blank');
              return;
            } else if (docItem.html_file_data) {
              // Download HTML content
              content = docItem.html_file_data;
              fileName = `CV_Analysis_${doc.job_title || 'Untitled'}_${doc.company_name || 'Company'}.html`;
              const blob = new Blob([content], { type: 'text/html' });
              const url = URL.createObjectURL(blob);
              const link = window.document.createElement('a');
              link.href = url;
              link.download = fileName;
              window.document.body.appendChild(link);
              link.click();
              window.document.body.removeChild(link);
              URL.revokeObjectURL(url);
              return;
            }
          }
          
          // Fallback to text format
          content = `CV ANALYSIS REPORT
==================

Job Title: ${doc.job_title || 'Untitled Position'}
Company: ${doc.company_name || 'Company not specified'}
Compatibility Score: ${doc.compatibility_score}%
Date: ${new Date(doc.created_at).toLocaleDateString()}
Analysis Type: ${docItem.analysis_type || 'Standard'}

EXECUTIVE SUMMARY
================
${docItem.executive_summary || 'No executive summary available'}

STRENGTHS
=========
${docItem.strengths?.map((strength, index) => `${index + 1}. ${strength}`).join('\n') || 'No strengths listed'}

AREAS FOR IMPROVEMENT
====================
${docItem.weaknesses?.map((weakness, index) => `${index + 1}. ${weakness}`).join('\n') || 'No weaknesses listed'}

RECOMMENDATIONS
===============
${docItem.recommendations?.map((rec, index) => `${index + 1}. ${rec}`).join('\n') || 'No recommendations available'}

---
Generated by TuneMyCV - Your AI-Powered Career Assistant`;
          
          fileName = `CV_Analysis_${doc.job_title || 'Untitled'}_${doc.company_name || 'Company'}.txt`;
          
          // Create and trigger download
          const blob = new Blob([content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = window.document.createElement('a');
          link.href = url;
          link.download = fileName;
          window.document.body.appendChild(link);
          link.click();
          window.document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      },
      {
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
      },
      {
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
      },
      {
        label: 'Delete',
        icon: <Trash2 className="h-4 w-4 mr-2" />,
        onClick: (doc) => handleDelete(doc),
        variant: 'destructive'
      }
    ];

    return actions;
  };

  return (
    <DocumentHistory
      header={{
        title: "CV Analysis History",
        totalCount: documents.length,
        filterType: 'analysis',
        onFilterChange: () => {}, // No filter change needed for single type
        itemsPerPage: itemsPerPage,
        onItemsPerPageChange: (count) => setItemsPerPage(count),
        showPagination: documents.length > 0
      }}
      documents={paginatedDocuments}
      loading={loading}
      onDocumentClick={handleDocumentClick}
      onEditTitle={handleEditTitle}
      actions={getDocumentActions}
      emptyState={{
        title: "No analyses found",
        description: "You haven't created any CV analyses yet. Start by analyzing your CV against a job description.",
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
      titleType="analysis"
    />
  );
};

export default AnalysisHistoryTab;
