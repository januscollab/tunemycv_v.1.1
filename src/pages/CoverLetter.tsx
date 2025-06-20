import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Sparkles, Trash2, RefreshCw, Clock, FileUp, Search, AlertCircle, Eye, Edit, Download, History, RotateCcw, Edit2, Linkedin } from 'lucide-react';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import CoverLetterHistory from '@/components/cover-letter/CoverLetterHistory';
import { htmlToJson } from '@/utils/jsonHtmlConverters';
import DownloadOptions from '@/components/cover-letter/DownloadOptions';

import { useAuth } from '@/contexts/AuthContext';
import { useCoverLetter } from '@/hooks/useCoverLetter';
import { useUserData } from '@/hooks/useUserData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EditTitleDialog from '@/components/ui/edit-title-dialog';
import { Label } from '@/components/ui/label';
import { FloatingLabelInput } from '@/components/common/FloatingLabelInput';
import { CaptureInput } from '@/components/ui/capture-input';
import { CaptureTextarea } from '@/components/ui/capture-textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import EmbeddedAuth from '@/components/auth/EmbeddedAuth';
import ServiceExplanation from '@/components/common/ServiceExplanation';
import CreditsPanel from '@/components/analyze/CreditsPanel';
import AnalysisSelector from '@/components/cover-letter/AnalysisSelector';
import AdvancedGenerationOptions from '@/components/cover-letter/AdvancedGenerationOptions';

import NoAnalysisModal from '@/components/cover-letter/NoAnalysisModal';
import CoverLetterLoggedOut from '@/components/cover-letter/CoverLetterLoggedOut';
import { EngagingUploadModal } from '@/components/ui/file-upload-modals';


interface CoverLetterProps {
  viewMode?: boolean;
}

const CoverLetter: React.FC<CoverLetterProps> = ({ viewMode = false }) => {
  const { user } = useAuth();

  // If user is not authenticated, show the logged-out landing page
  if (!user) {
    return <CoverLetterLoggedOut />;
  }

  // If user is authenticated, show the full cover letter interface
  return <AuthenticatedCoverLetter />;
};

const AuthenticatedCoverLetter = () => {
  const { user } = useAuth();
  const { credits } = useUserData();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    generateCoverLetter, 
    generateFromAnalysis, 
    regenerateCoverLetter, 
    getCoverLetters, 
    deleteCoverLetter, 
    updateCoverLetter, 
    isGenerating, 
    isRegenerating,
    analyses,
    selectedAnalysisId,
    setSelectedAnalysisId,
    companyName,
    setCompanyName,
    jobTitle,
    setJobTitle,
    tone,
    setTone,
    length,
    setLength,
    coverLetter,
    hasGenerated,
    showNoAnalysisModal,
    setShowNoAnalysisModal,
    resetForm,
    generationProgress
  } = useCoverLetter();
  
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    jobDescription: '',
    tone: 'professional',
    length: 'concise'
  });

  const [advancedOptions, setAdvancedOptions] = useState({
    workExperienceHighlights: '',
    customHookOpener: '',
    personalValues: '',
    includeLinkedInUrl: false
  });
  
  const [coverLetters, setCoverLetters] = useState<any[]>([]);
  const [allCoverLetters, setAllCoverLetters] = useState<any[]>([]);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('create');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [generationMethod, setGenerationMethod] = useState<'input' | 'analysis'>('input');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'analysis' | 'cover_letter'>('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCoverLetter, setEditingCoverLetter] = useState<any>(null);
  
  // Note: editableCoverLetterRef removed since RTE is no longer used in View Letter tab
  
  // Save state management to prevent duplicate saves
  const [isSaving, setIsSaving] = useState(false);

  const lengthOptions = [
    { value: 'short', label: 'Short (150-200 words)', description: 'Brief and to the point' },
    { value: 'concise', label: 'Concise (250-300 words)', description: 'Balanced length' },
    { value: 'standard', label: 'Standard (350-400 words)', description: 'Comprehensive coverage' },
    { value: 'detailed', label: 'Detailed (450-500 words)', description: 'In-depth presentation' }
  ];

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'confident', label: 'Confident' },
    { value: 'enthusiastic', label: 'Enthusiastic' },
    { value: 'friendly', label: 'Friendly' }
  ];

  // Handle navigation state from analysis history
  useEffect(() => {
    const state = location.state as { 
      analysis?: any; 
      coverLetter?: any; 
      viewMode?: boolean; 
      activeTab?: string;
      fromAnalysis?: boolean;
      analysisData?: any;
    } | null;
    if (state?.coverLetter && state?.viewMode) {
      console.log('Navigation state detected for viewing cover letter:', state.coverLetter);
      setSelectedCoverLetter(state.coverLetter);
      if (state.activeTab) {
        setActiveTab(state.activeTab);
      }
      // Clear the navigation state to prevent re-triggering
      window.history.replaceState({}, document.title, location.pathname);
    } else if (state?.analysis) {
      console.log('Navigation state detected for creating cover letter:', state.analysis);
      setGenerationMethod('analysis');
      setSelectedAnalysisId(state.analysis.id);
      
      // Pre-populate form data from the analysis
      setFormData(prev => ({
        ...prev,
        jobTitle: state.analysis.job_title || '',
        companyName: state.analysis.company_name || ''
      }));
      
      // Clear the navigation state to prevent re-triggering
      window.history.replaceState({}, document.title, location.pathname);
    } else if (state?.fromAnalysis && state?.analysisData) {
      console.log('Navigation state detected for creating cover letter from analysis:', state.analysisData);
      setGenerationMethod('analysis');
      setSelectedAnalysisId(state.analysisData.id);
      
      // Pre-populate form data from the analysis
      setFormData(prev => ({
        ...prev,
        jobTitle: state.analysisData.job_title || '',
        companyName: state.analysisData.company_name || ''
      }));
      
      // Clear the navigation state to prevent re-triggering
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.state, setSelectedAnalysisId]);

  useEffect(() => {
    if (user && activeTab === 'history') {
      loadCoverLetterHistory();
    }
  }, [user, activeTab]);

  // Calculate pagination
  const totalPages = Math.ceil(allCoverLetters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCoverLetters = allCoverLetters.slice(startIndex, endIndex);

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const loadCoverLetterHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('cover_letters')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false }); // Latest first
      
      if (error) throw error;
      setAllCoverLetters(data || []);
      setCoverLetters(data || []); // For backward compatibility
    } catch (error) {
      console.error('Failed to load cover letter history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (generationMethod === 'input') {
      if (!formData.jobTitle.trim()) {
        errors.push('Job title is required');
      }
      if (!formData.companyName.trim()) {
        errors.push('Company name is required');
      }
      if (!formData.jobDescription.trim()) {
        errors.push('Job description is required');
      }
    } else {
      if (!selectedAnalysisId) {
        errors.push('Please select an analysis to generate from');
      }
    }

    if (credits < 1) {
      errors.push('Insufficient credits. You need at least 1 credit to generate a cover letter.');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleGenerationMethodChange = (method: 'input' | 'analysis') => {
    // Remove the incorrect check - let AnalysisSelector handle the empty state
    setGenerationMethod(method);
  };

  const handleUseManualInput = () => {
    setGenerationMethod('input');
  };

  const handleGenerate = async () => {
    if (!validateForm()) {
      return;
    }

    const generationParams = {
      tone: formData.tone,
      length: formData.length,
      ...advancedOptions
    };

    if (generationMethod === 'input') {
      try {
        const result = await generateCoverLetter({
          jobTitle: formData.jobTitle,
          companyName: formData.companyName,
          jobDescription: formData.jobDescription,
          ...generationParams
        });

        setSelectedCoverLetter({ ...result.coverLetter, isUnsaved: false });
        setActiveTab('result');
        
        if (coverLetters.length > 0) {
          loadCoverLetterHistory();
        }
      } catch (error) {
        console.error('Generation failed:', error);
      }
    } else {
      try {
        const result = await generateFromAnalysis({
          analysisResultId: selectedAnalysisId,
          ...generationParams
        });

        setSelectedCoverLetter({ ...result.coverLetter, isUnsaved: false });
        setActiveTab('result');
        
        if (coverLetters.length > 0) {
          loadCoverLetterHistory();
        }
      } catch (error) {
        console.error('Generation from analysis failed:', error);
      }
    }
  };

  // Note: handleUpdateCoverLetter removed since View Letter tab is now read-only

  const handleRegenerate = async (coverLetterId: string, tone: string, length: string) => {
    try {
      const result = await regenerateCoverLetter({
        coverLetterId,
        tone,
        length
      });

      setSelectedCoverLetter(prev => ({ 
        ...prev, 
        content: result.content,
        regeneration_count: result.regeneration_count 
      }));
      loadCoverLetterHistory();
    } catch (error) {
      console.error('Regeneration failed:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCoverLetter(id);
      setAllCoverLetters(prev => prev.filter(cl => cl.id !== id));
      setCoverLetters(prev => prev.filter(cl => cl.id !== id));
      if (selectedCoverLetter?.id === id) {
        setSelectedCoverLetter(null);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleViewCoverLetter = (coverLetter: any) => {
    setSelectedCoverLetter(coverLetter);
    setActiveTab('result');
  };

  const handleViewCVAnalysis = (analysisResultId: string) => {
    navigate('/analyze', {
      state: {
        analysisId: analysisResultId,
        activeTab: 'results'
      }
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRemainingFreeRegenerations = (regenerationCount: number) => {
    return Math.max(0, 2 - regenerationCount);
  };

  const canGenerate = generationMethod === 'input' 
    ? (formData.jobTitle && formData.companyName && formData.jobDescription)
    : selectedAnalysisId;

  const handleEditCoverLetter = (coverLetter: any) => {
    setSelectedCoverLetter(coverLetter);
    setActiveTab('result');
  };

  const handleTabChange = async (newTab: string) => {
    // Auto-save when switching away from the result tab if there's content
    if (activeTab === 'result' && selectedCoverLetter && user) {
      try {
        // Get current content from the Rich Text Editor
        const currentContent = selectedCoverLetter.content;
        if (currentContent && currentContent.trim()) {
          const { error } = await supabase
            .from('cover_letters')
            .update({ 
              content: currentContent
            })
            .eq('id', selectedCoverLetter.id)
            .eq('user_id', user.id);
          
          if (error) {
            console.error('Auto-save on tab switch failed:', error);
          } else {
            // Update local state
            setSelectedCoverLetter(prev => ({
              ...prev,
              content: currentContent,
              updated_at: new Date().toISOString()
            }));
            // Refresh history to show updated timestamp
            loadCoverLetterHistory();
          }
        }
      } catch (error) {
        console.error('Auto-save on tab switch error:', error);
      }
    }
    
    setActiveTab(newTab);
  };

  
  // Auto-save when user switches browser tabs or navigates away
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (activeTab === 'result' && selectedCoverLetter && user) {
        try {
          const currentContent = selectedCoverLetter.content;
          if (currentContent && currentContent.trim()) {
            // Use navigator.sendBeacon for reliable data sending on page unload
            const data = JSON.stringify({
              id: selectedCoverLetter.id,
              content: currentContent,
              user_id: user.id
            });
            
            // Fallback to fetch if sendBeacon is not available
            if (navigator.sendBeacon) {
              navigator.sendBeacon('/api/autosave-cover-letter', data);
            } else {
              await fetch('/api/autosave-cover-letter', {
                method: 'POST',
                body: data,
                headers: { 'Content-Type': 'application/json' },
                keepalive: true
              });
            }
          }
        } catch (error) {
          console.error('Auto-save on page unload failed:', error);
        }
      }
    };

    const handleVisibilityChange = async () => {
      if (document.hidden && activeTab === 'result' && selectedCoverLetter && user) {
        try {
          const currentContent = selectedCoverLetter.content;
          if (currentContent && currentContent.trim()) {
            const { error } = await supabase
              .from('cover_letters')
              .update({ 
                content: currentContent
              })
              .eq('id', selectedCoverLetter.id)
              .eq('user_id', user.id);
            
            if (!error) {
              setSelectedCoverLetter(prev => ({
                ...prev,
                content: currentContent,
                updated_at: new Date().toISOString()
              }));
            }
          }
        } catch (error) {
          console.error('Auto-save on visibility change failed:', error);
        }
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeTab, selectedCoverLetter, user]);

  // Note: Window blur/unload handlers removed since View Letter tab no longer uses RTE

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/3 dark:from-primary/10 dark:via-background dark:to-primary/5 py-6">
      <div className="max-w-wider mx-auto px-4">
        <Breadcrumbs />
        <div className="mb-6">
          <div className="flex items-start mb-6">
            <Edit className="h-8 w-8 text-zapier-orange mr-3 flex-shrink-0" />
            <div>
              <h1 className="text-display font-bold text-foreground">
                Generate Cover Letter
              </h1>
              <p className="text-subheading text-earth/70 dark:text-white/70 max-w-2xl mt-2">
                Create tailored cover letters that highlight your strengths and align perfectly with specific job requirements.
              </p>
            </div>
          </div>
        </div>

        <NoAnalysisModal
          isOpen={showNoAnalysisModal}
          onClose={() => setShowNoAnalysisModal(false)}
          onUseManualInput={() => setGenerationMethod('input')}
        />

        <EngagingUploadModal
          isOpen={isRegenerating}
          title="Regenerating Cover Letter"
          message="Creating a fresh version of your cover letter..."
        />

        <EngagingUploadModal
          isOpen={isGenerating}
          title="Generating Cover Letter"
          message="Our AI is crafting your personalized cover letter..."
        />


        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Main Content */}
          <div>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="create" className="flex items-center space-x-2 text-caption">
                  <Sparkles className="h-4 w-4" />
                  <span>Generate New</span>
                </TabsTrigger>
                <TabsTrigger value="result" className="flex items-center space-x-2 text-caption">
                  <Eye className="h-4 w-4" />
                  <span>View Letter</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center space-x-2 text-caption">
                  <History className="h-4 w-4" />
                  <span>History</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create">
                <div className="space-y-4">
                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1">
                          {validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Panel 1: Generation Method Selection */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-xl font-semibold">
                        <Sparkles className="h-5 w-5 text-primary mr-2" />
                        Generate Cover Letter
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      <div>
                        <Label className="text-base font-medium">How would you like to generate your cover letter?</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          <button
                            onClick={() => setGenerationMethod('input')}
                            className={`p-4 border rounded-md text-left transition-colors ${
                              generationMethod === 'input'
                                ? 'border-primary bg-primary/5'
                                : 'border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center mb-2">
                              <FileUp className="h-5 w-5 text-primary mr-2" />
                              <span className="font-medium">Generate from Input</span>
                            </div>
                            <p className="text-caption text-muted-foreground">
                              Enter job details manually to create a cover letter
                            </p>
                          </button>
                          
                          <button
                            onClick={() => setGenerationMethod('analysis')}
                            className={`p-4 border rounded-md text-left transition-colors ${
                              generationMethod === 'analysis'
                                ? 'border-primary bg-primary/5'
                                : 'border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center mb-2">
                              <Search className="h-5 w-5 text-primary mr-2" />
                              <span className="font-medium">Generate from Analysis</span>
                            </div>
                            <p className="text-caption text-muted-foreground">
                              Use your previous CV analysis results
                            </p>
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Panel 2: Job Details (only shown for input method) */}
                  {generationMethod === 'input' && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl font-semibold text-left">Job Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <CaptureInput
                              label="Job Title *"
                              placeholder="e.g., Marketing Manager"
                              value={formData.jobTitle}
                              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                              className={validationErrors.includes('Job title is required') ? 'border-red-500' : ''}
                              required
                            />
                          </div>
                          <div>
                            <CaptureInput
                              label="Company Name *"
                              placeholder="e.g., TechCorp"
                              value={formData.companyName}
                              onChange={(e) => handleInputChange('companyName', e.target.value)}
                              className={validationErrors.includes('Company name is required') ? 'border-red-500' : ''}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <CaptureTextarea
                            label="Job Description"
                            placeholder="Paste the complete job description here for the most tailored results..."
                            description="Job description is required for optimal cover letter generation"
                            value={formData.jobDescription}
                            onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                            rows={6}
                            className={validationErrors.includes('Job description is required') ? 'border-red-500' : ''}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Panel 3: Analysis Selection (only shown for analysis method) */}
                  {generationMethod === 'analysis' && (
                    <Card className="border border-gray-200 dark:border-gray-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl font-semibold">Select Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div>
                          <Label>Select Analysis *</Label>
                          <AnalysisSelector
                            onAnalysisSelect={setSelectedAnalysisId}
                            selectedAnalysisId={selectedAnalysisId}
                            disabled={isGenerating}
                          />
                          {validationErrors.includes('Please select an analysis to generate from') && (
                            <p className="text-sm text-red-600 mt-1">Please select an analysis to continue</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Panel 4: Settings and Options */}
                  <Card className="border border-gray-200 dark:border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl font-semibold">Generation Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      {/* Advanced Generation Options */}
                      <AdvancedGenerationOptions
                        value={advancedOptions}
                        onChange={setAdvancedOptions}
                      />

                      {/* Tone and Length */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="tone">Tone</Label>
                          <Select value={formData.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {toneOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="length">Length</Label>
                          <Select value={formData.length} onValueChange={(value) => handleInputChange('length', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {lengthOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* LinkedIn Profile Option */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeLinkedIn"
                          checked={advancedOptions.includeLinkedInUrl}
                          onCheckedChange={(checked) => 
                            setAdvancedOptions(prev => ({ 
                              ...prev, 
                              includeLinkedInUrl: Boolean(checked) 
                            }))
                          }
                        />
                        <Label htmlFor="includeLinkedIn" className="text-sm font-medium flex items-center">
                          <Linkedin className="h-4 w-4 mr-1" />
                          Include my LinkedIn profile URL in the cover letter
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Panel 5: Generate Button */}
                  <Card className="border border-gray-200 dark:border-gray-700">
                    <CardContent className="pt-4">
                      <Button
                        onClick={handleGenerate}
                        disabled={!canGenerate || isGenerating || credits < 1}
                        className="w-full bg-zapier-orange hover:bg-zapier-orange/90 text-white font-medium"
                      >
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Generating...
                          </>
                        ) : (
                          'Generate Cover Letter'
                        )}
                      </Button>
                      <div className="text-center mt-2 space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Our AI will generate a tailored cover letter, to help you stand out.
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400">
                          Please provide above required info to continue
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="result">
                {selectedCoverLetter ? (
                  <Card className="border border-gray-200 dark:border-gray-700">
                    <CardHeader className="pb-3">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <CardTitle className="text-xl font-semibold">{selectedCoverLetter.job_title} at {selectedCoverLetter.company_name}</CardTitle>
                          <button
                            onClick={() => {
                              setEditingCoverLetter(selectedCoverLetter);
                              setIsEditDialogOpen(true);
                            }}
                            className="text-gray-400 hover:text-zapier-orange transition-colors"
                            title="Edit title"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-normal text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Generated {formatDate(selectedCoverLetter.created_at)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs font-medium">
                              Version {selectedCoverLetter.regeneration_count + 1}
                            </Badge>
                            {selectedCoverLetter.regeneration_count > 0 && (
                              <span className="text-xs text-gray-500">
                                (Last updated {formatDate(selectedCoverLetter.updated_at || selectedCoverLetter.created_at)})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      {/* Cover Letter Content Display */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Cover Letter Content</h3>
                          <DownloadOptions 
                            content={selectedCoverLetter.content}
                            fileName={`${selectedCoverLetter.company_name}_${selectedCoverLetter.job_title}_Cover_Letter`}
                            triggerComponent={
                              <Button variant="outline" size="sm" className="gap-2 font-normal">
                                <Download className="h-4 w-4" />
                                Download
                              </Button>
                            }
                          />
                        </div>
                        <RichTextEditor
                          initialContent={(() => {
                            console.log('[CoverLetter] Processing content for RTE:', {
                              contentType: typeof selectedCoverLetter.content,
                              contentLength: selectedCoverLetter.content?.length,
                              isJSON: selectedCoverLetter.content?.startsWith('{'),
                              preview: selectedCoverLetter.content?.substring(0, 100)
                            });

                            try {
                              // First check if content is already valid JSON
                              try {
                                const jsonData = JSON.parse(selectedCoverLetter.content);
                                if (jsonData.sections && Array.isArray(jsonData.sections)) {
                                  console.log('[CoverLetter] Content is valid DocumentJson, returning as-is');
                                  return jsonData;
                                }
                              } catch (jsonError) {
                                console.log('[CoverLetter] Content is not JSON, processing as HTML/text');
                              }
                              
                              // Check if content looks like HTML with entities that need decoding
                              if (selectedCoverLetter.content.includes('&lt;') || selectedCoverLetter.content.includes('&gt;')) {
                                console.log('[CoverLetter] Content has HTML entities, decoding...');
                                
                                // Decode HTML entities properly
                                const tempDiv = document.createElement('div');
                                tempDiv.innerHTML = selectedCoverLetter.content;
                                const decodedHtml = tempDiv.innerHTML;
                                
                                console.log('[CoverLetter] Decoded HTML:', {
                                  original: selectedCoverLetter.content.substring(0, 100),
                                  decoded: decodedHtml.substring(0, 100)
                                });
                                
                                // Return the decoded HTML directly - let RichTextEditor handle conversion
                                return decodedHtml;
                              }
                              
                              // If it's HTML content, clean it but keep as HTML for the editor
                              if (selectedCoverLetter.content.includes('<p>') || selectedCoverLetter.content.includes('<h')) {
                                console.log('[CoverLetter] Content is HTML, cleaning formatting');
                                // Clean any double asterisks from HTML content
                                let cleanedHtml = selectedCoverLetter.content
                                  .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove markdown bold
                                  .replace(/\*\*/g, '');             // Remove any remaining double asterisks
                                return cleanedHtml;
                              }
                              
                              // If it's plain text, clean and return as-is
                              console.log('[CoverLetter] Content appears to be plain text, cleaning formatting');
                              let cleanedText = selectedCoverLetter.content || '<p>Your cover letter content will appear here...</p>';
                              cleanedText = cleanedText
                                .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove markdown bold
                                .replace(/\*\*/g, '');             // Remove any remaining double asterisks
                              return cleanedText;
                              
                            } catch (error) {
                              console.error('[CoverLetter] Error processing content for RTE:', error);
                              return '<p>Error loading content. Please try refreshing the page.</p>';
                            }
                          })()}
                          onContentChange={async (json, text) => {
                            if (selectedCoverLetter && user) {
                              // Convert back to HTML for storage
                              const htmlContent = json.sections.map(section => {
                                let html = section.content || '';
                                if (section.formatting?.bold) {
                                  html = `<strong>${html}</strong>`;
                                }
                                return `<p>${html}</p>`;
                              }).join('');
                              
                              // Update local state
                              setSelectedCoverLetter({
                                ...selectedCoverLetter,
                                content: htmlContent
                              });

                              // Auto-save to database with debouncing
                              try {
                                const { error } = await supabase
                                  .from('cover_letters')
                                  .update({ 
                                    content: htmlContent
                                  })
                                  .eq('id', selectedCoverLetter.id)
                                  .eq('user_id', user.id);
                                
                                if (error) {
                                  console.error('Auto-save failed:', error);
                                } else {
                                  // Update timestamp
                                  setSelectedCoverLetter(prev => ({
                                    ...prev,
                                    content: htmlContent,
                                    updated_at: new Date().toISOString()
                                  }));
                                }
                              } catch (error) {
                                console.error('Auto-save error:', error);
                              }
                            }
                          }}
                          showAIFeatures={true}
                          enableAutoSave={true}
                          className="min-h-[400px]"
                          placeholder="Start writing your cover letter..."
                        />
                      </div>
                      
                      <div className="flex items-start justify-between pt-4 border-t">
                        <div className="flex items-center space-x-4">
                          <Select
                            value={formData.tone}
                            onValueChange={(value) => handleInputChange('tone', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select tone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="conversational">Conversational</SelectItem>
                              <SelectItem value="confident">Confident</SelectItem>
                              <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                              <SelectItem value="friendly">Friendly</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Select
                            value={formData.length}
                            onValueChange={(value) => handleInputChange('length', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select length" />
                            </SelectTrigger>
                            <SelectContent>
                              {lengthOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <button
                            onClick={() => handleRegenerate(selectedCoverLetter.id, formData.tone, formData.length)}
                            disabled={isRegenerating}
                            className="bg-zapier-orange text-white px-4 py-2 rounded-md font-normal text-sm hover:bg-zapier-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                          >
                            {isRegenerating ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Regenerating...
                              </>
                            ) : getRemainingFreeRegenerations(selectedCoverLetter.regeneration_count || 0) > 0 ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Free Regeneration
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Regenerate (1 Credit)
                              </>
                            )}
                          </button>
                          <div className="text-xs font-normal text-gray-500 mt-1">
                            {getRemainingFreeRegenerations(selectedCoverLetter.regeneration_count || 0) > 0 
                              ? `${getRemainingFreeRegenerations(selectedCoverLetter.regeneration_count || 0)} free regenerations left`
                              : 'Additional regenerations: 1 credit each'
                            }
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border border-gray-200 dark:border-gray-700">
                    <CardContent className="text-center py-8">
                      <FileText className="h-12 w-12 text-zapier-orange mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2 font-normal">
                        No cover letter generated yet.
                      </p>
                      <p className="text-sm font-normal text-gray-500">
                        Create one in the <Link to="#" onClick={() => setActiveTab('create')} className="text-zapier-orange hover:text-zapier-orange/80 underline">Generate New</Link> tab or view previous letters in <Link to="#" onClick={() => setActiveTab('history')} className="text-zapier-orange hover:text-zapier-orange/80 underline">History</Link>.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <CoverLetterHistory 
                  onSelectCoverLetter={handleViewCoverLetter}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Credits Panel - Fixed Width */}
          <div>
            <CreditsPanel
              credits={credits}
              hasCreditsForAI={credits > 0}
            />
          </div>
        </div>

        <EditTitleDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingCoverLetter(null);
          }}
          onSave={async (newTitle) => {
            if (editingCoverLetter) {
              try {
                const { error } = await supabase
                  .from('cover_letters')
                  .update({ job_title: newTitle })
                  .eq('id', editingCoverLetter.id)
                  .eq('user_id', user?.id);
                if (error) throw error;
                await loadCoverLetterHistory();
                toast({ title: 'Success', description: 'Cover letter title updated successfully' });
              } catch (error) {
                toast({ title: 'Error', description: 'Failed to update title', variant: 'destructive' });
              }
            }
          }}
          currentTitle={editingCoverLetter?.job_title || ''}
          titleType="cover-letter"
        />
      </div>
    </div>
  );
};

export default CoverLetter;
