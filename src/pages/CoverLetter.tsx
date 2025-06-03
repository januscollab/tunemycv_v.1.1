import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Sparkles, Trash2, RefreshCw, Clock, FileUp, Search, AlertCircle, Eye, Edit, Download, History } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoverLetter } from '@/hooks/useCoverLetter';
import { useUserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EmbeddedAuth from '@/components/auth/EmbeddedAuth';
import ServiceExplanation from '@/components/common/ServiceExplanation';
import CreditsPanel from '@/components/analyze/CreditsPanel';
import AnalysisSelector from '@/components/cover-letter/AnalysisSelector';
import AdvancedGenerationOptions from '@/components/cover-letter/AdvancedGenerationOptions';
import DownloadOptions from '@/components/cover-letter/DownloadOptions';
import EditableCoverLetter from '@/components/cover-letter/EditableCoverLetter';
import NoAnalysisModal from '@/components/cover-letter/NoAnalysisModal';
import CoverLetterLoggedOut from '@/components/cover-letter/CoverLetterLoggedOut';

const CoverLetter = () => {
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
  const location = useLocation();
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
    resetForm
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
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('create');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [generationMethod, setGenerationMethod] = useState<'input' | 'analysis'>('input');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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
    const state = location.state as { analysis?: any } | null;
    if (state?.analysis) {
      console.log('Navigation state detected:', state.analysis);
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
    }
  }, [location.state, setSelectedAnalysisId]);

  useEffect(() => {
    if (user && activeTab === 'history') {
      loadCoverLetterHistory();
    }
  }, [user, activeTab]);

  const loadCoverLetterHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getCoverLetters();
      setCoverLetters(data);
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
    if (selectedCoverLetter && !hasUnsavedChanges) {
      setHasUnsavedChanges(true);
    }
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

        setSelectedCoverLetter({ ...result.coverLetter, isUnsaved: true });
        setActiveTab('result');
        setHasUnsavedChanges(true);
        
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

        setSelectedCoverLetter({ ...result.coverLetter, isUnsaved: true });
        setActiveTab('result');
        setHasUnsavedChanges(true);
        
        if (coverLetters.length > 0) {
          loadCoverLetterHistory();
        }
      } catch (error) {
        console.error('Generation from analysis failed:', error);
      }
    }
  };

  const handleSaveCoverLetter = () => {
    if (selectedCoverLetter) {
      setSelectedCoverLetter(prev => ({ ...prev, isUnsaved: false }));
      setHasUnsavedChanges(false);
      loadCoverLetterHistory();
    }
  };

  const handleUpdateCoverLetter = async (newContent: string) => {
    if (selectedCoverLetter) {
      try {
        await updateCoverLetter(selectedCoverLetter.id, newContent);
        setSelectedCoverLetter(prev => ({ ...prev, content: newContent }));
        loadCoverLetterHistory();
      } catch (error) {
        console.error('Update failed:', error);
      }
    }
  };

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

  const handleTabChange = (newTab: string) => {
    if (hasUnsavedChanges && newTab !== activeTab) {
      setShowSavePrompt(true);
      return;
    }
    setActiveTab(newTab);
  };

  const confirmTabChange = (save: boolean) => {
    if (save) {
      // handleSaveCoverLetter();
    } else {
      setHasUnsavedChanges(false);
    }
    setShowSavePrompt(false);
    setActiveTab('create');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/15 via-white to-citrus/5 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-left">
              <div className="flex items-start mb-3 text-left">
                <Edit className="h-8 w-8 text-zapier-orange mr-3 flex-shrink-0" />
                <div className="text-left">
                  <h1 className="text-3xl font-bold text-earth dark:text-white text-left">
                    Generate Cover Letter
                  </h1>
                  <p className="text-lg font-normal text-earth/70 dark:text-white/70 max-w-2xl mt-2 text-left">
                    Create tailored cover letters that highlight your strengths and align perfectly with specific job requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <NoAnalysisModal
          isOpen={showNoAnalysisModal}
          onClose={() => setShowNoAnalysisModal(false)}
          onUseManualInput={() => setGenerationMethod('input')}
        />

        {showSavePrompt && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-md p-6 max-w-md border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 font-display">Unsaved Changes</h3>
              <p className="mb-6 font-normal">You have unsaved changes. Would you like to save before continuing?</p>
              <div className="flex space-x-4">
                <Button onClick={() => confirmTabChange(true)} className="bg-zapier-orange hover:bg-zapier-orange/90">
                  Save & Continue
                </Button>
                <Button variant="outline" onClick={() => confirmTabChange(false)}>
                  Don't Save
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="create" className="flex items-center space-x-2 text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>Generate New</span>
                </TabsTrigger>
                <TabsTrigger value="result" className="flex items-center space-x-2 text-sm">
                  <Eye className="h-4 w-4" />
                  <span>Current Result</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center space-x-2 text-sm">
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
                  <Card className="border border-gray-200 dark:border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-xl font-semibold">
                        <Sparkles className="h-5 w-5 text-zapier-orange mr-2" />
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
                                ? 'border-zapier-orange bg-zapier-orange/5'
                                : 'border-gray-200 hover:border-zapier-orange/50'
                            }`}
                          >
                            <div className="flex items-center mb-2">
                              <FileUp className="h-5 w-5 text-zapier-orange mr-2" />
                              <span className="font-medium">Generate from Input</span>
                            </div>
                            <p className="text-sm font-normal text-gray-600">
                              Enter job details manually to create a cover letter
                            </p>
                          </button>
                          
                          <button
                            onClick={() => setGenerationMethod('analysis')}
                            className={`p-4 border rounded-md text-left transition-colors ${
                              generationMethod === 'analysis'
                                ? 'border-zapier-orange bg-zapier-orange/5'
                                : 'border-gray-200 hover:border-zapier-orange/50'
                            }`}
                          >
                            <div className="flex items-center mb-2">
                              <Search className="h-5 w-5 text-zapier-orange mr-2" />
                              <span className="font-medium">Generate from Analysis</span>
                            </div>
                            <p className="text-sm font-normal text-gray-600">
                              Use your previous CV analysis results
                            </p>
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Panel 2: Job Details (only shown for input method) */}
                  {generationMethod === 'input' && (
                    <Card className="border border-gray-200 dark:border-gray-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl font-semibold text-left">Job Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="jobTitle">Job Title *</Label>
                            <Input
                              id="jobTitle"
                              placeholder="e.g., Marketing Manager"
                              value={formData.jobTitle}
                              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                              className={validationErrors.includes('Job title is required') ? 'border-red-500' : ''}
                            />
                          </div>
                          <div>
                            <Label htmlFor="companyName">Company Name *</Label>
                            <Input
                              id="companyName"
                              placeholder="e.g., TechCorp"
                              value={formData.companyName}
                              onChange={(e) => handleInputChange('companyName', e.target.value)}
                              className={validationErrors.includes('Company name is required') ? 'border-red-500' : ''}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="jobDescription">Job Description *</Label>
                          <Textarea
                            id="jobDescription"
                            placeholder="Paste the complete job description here for the most tailored results..."
                            value={formData.jobDescription}
                            onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                            rows={6}
                            className={validationErrors.includes('Job description is required') ? 'border-red-500' : ''}
                          />
                          <p className="text-sm font-normal text-blueberry/70 dark:text-apple-core/70 mt-1">
                            Job description is required for optimal cover letter generation
                          </p>
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
                      <p className="text-sm font-normal text-gray-600 dark:text-gray-400 text-center mt-2">
                        Our AI uses the info above to generate a tailored cover letter, to help you stand out.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="result">
                {selectedCoverLetter ? (
                  <Card className="border border-gray-200 dark:border-gray-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-semibold">{selectedCoverLetter.job_title} at {selectedCoverLetter.company_name}</CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Generated {formatDate(selectedCoverLetter.created_at)}
                            </div>
                            {selectedCoverLetter.regeneration_count > 0 && (
                              <Badge variant="outline" className="text-xs">
                                Iteration {selectedCoverLetter.regeneration_count + 1}
                              </Badge>
                            )}
                            {selectedCoverLetter.isUnsaved && (
                              <Badge variant="outline" className="text-orange-600 border-orange-600">
                                Unsaved
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedCoverLetter.isUnsaved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleSaveCoverLetter}
                              className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                            >
                              Save Cover Letter
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      {/* Download option above edit area */}
                      <div className="flex justify-end">
                        <DownloadOptions
                          content={selectedCoverLetter.content}
                          fileName={`Cover_Letter_${selectedCoverLetter.company_name}_${selectedCoverLetter.job_title}`}
                          triggerComponent={
                            <div className="flex items-center text-sm text-gray-600 hover:text-zapier-orange transition-colors cursor-pointer">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </div>
                          }
                        />
                      </div>

                      <EditableCoverLetter
                        content={selectedCoverLetter.content}
                        onSave={handleUpdateCoverLetter}
                      />
                      
                      <div className="flex items-start justify-between pt-4 border-t">
                        <div className="flex items-center space-x-4">
                          <Select
                            value={formData.tone}
                            onValueChange={(value) => handleInputChange('tone', value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
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
                            <SelectTrigger className="w-48">
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
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2 font-normal">
                        No cover letter generated yet.
                      </p>
                      <p className="text-sm font-normal text-gray-500">
                        Create one in the "Generate New" tab or view previous letters in "Document History".
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="history">
                <Card className="border border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-semibold">History</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {loadingHistory ? (
                      <div className="text-center py-8 font-normal">Loading...</div>
                    ) : coverLetters.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 font-normal">
                          No cover letters created yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {coverLetters.map((coverLetter) => (
                          <div
                            key={coverLetter.id}
                            className="border rounded-md p-4 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-zapier-orange/50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium">{coverLetter.job_title} at {coverLetter.company_name}</h3>
                                  {coverLetter.regeneration_count > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      v{coverLetter.regeneration_count + 1}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm font-normal text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(coverLetter.created_at).toLocaleDateString()}
                                  </div>
                                  {coverLetter.updated_at !== coverLetter.created_at && (
                                    <div>Updated {new Date(coverLetter.updated_at).toLocaleDateString()}</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => handleViewCoverLetter(coverLetter)}
                                  className="flex items-center text-sm text-gray-600 hover:text-zapier-orange transition-colors"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </button>
                                <button
                                  onClick={() => handleEditCoverLetter(coverLetter)}
                                  className="flex items-center text-sm text-gray-600 hover:text-zapier-orange transition-colors"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </button>
                                <DownloadOptions
                                  content={coverLetter.content}
                                  fileName={`Cover_Letter_${coverLetter.company_name}_${coverLetter.job_title}`}
                                  triggerComponent={
                                    <button className="text-sm text-gray-600 hover:text-zapier-orange transition-colors">
                                      <Download className="h-4 w-4" />
                                    </button>
                                  }
                                />
                                <button
                                  onClick={() => handleDelete(coverLetter.id)}
                                  className="text-sm text-red-600 hover:text-zapier-orange transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Credits Panel - Reduced Width */}
          <div className="lg:col-span-1">
            <CreditsPanel
              credits={credits}
              hasCreditsForAI={credits > 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetter;
