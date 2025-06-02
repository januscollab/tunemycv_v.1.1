
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Sparkles, Trash2, RefreshCw, Clock, FileUp, Search, AlertCircle, Eye } from 'lucide-react';
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
import AnalysisSelector from '@/components/cover-letter/AnalysisSelector';
import AdvancedGenerationOptions from '@/components/cover-letter/AdvancedGenerationOptions';
import DownloadOptions from '@/components/cover-letter/DownloadOptions';
import EditableCoverLetter from '@/components/cover-letter/EditableCoverLetter';
import NoAnalysisModal from '@/components/cover-letter/NoAnalysisModal';

const CoverLetter = () => {
  const { user } = useAuth();
  const { credits } = useUserData();
  const { generateCoverLetter, generateFromAnalysis, regenerateCoverLetter, getCoverLetters, deleteCoverLetter, updateCoverLetter, isGenerating, isRegenerating } = useCoverLetter();
  
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
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showNoAnalysisModal, setShowNoAnalysisModal] = useState(false);

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
    return Math.max(0, 5 - regenerationCount);
  };

  const canGenerate = generationMethod === 'input' 
    ? (formData.jobTitle && formData.companyName && formData.jobDescription)
    : selectedAnalysisId;

  if (!user) {
    const coverLetterExplanation = {
      title: 'Generate Cover Letter',
      subtitle: 'Create tailored cover letters that highlight your strengths and align perfectly with specific job requirements.',
      benefits: [
        'AI-powered cover letter generation that matches your experience to the job requirements',
        'Multiple tone and length options to match company culture',
        'Tailored content that highlights your most relevant qualifications'
      ],
      features: [
        'Enter the job title and company name for personalized addressing',
        'Paste the complete job description for maximum relevance and keyword optimization',
        'Choose your preferred tone and length to match the role and company culture'
      ]
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-apple-core/20 via-white to-citrus/10 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
            <div className="flex items-start">
              <ServiceExplanation
                title={coverLetterExplanation.title}
                subtitle={coverLetterExplanation.subtitle}
                benefits={coverLetterExplanation.benefits}
                features={coverLetterExplanation.features}
                icon={<FileText className="h-8 w-8 text-apricot" />}
                compact={true}
              />
            </div>
            <div className="flex items-end justify-center">
              <div className="w-full max-w-sm">
                <EmbeddedAuth
                  title="Login to Get Started"
                  description="Cover letter generation requires an account to ensure personalized results and save your work."
                  icon={<FileText className="h-6 w-6 text-apricot mr-2" />}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleTabChange = (newTab: string) => {
    if (hasUnsavedChanges && newTab !== activeTab) {
      setShowSavePrompt(true);
      return;
    }
    setActiveTab(newTab);
  };

  const confirmTabChange = (save: boolean) => {
    if (save) {
      handleSaveCoverLetter();
    } else {
      setHasUnsavedChanges(false);
    }
    setShowSavePrompt(false);
    setActiveTab('create');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/10 via-white to-citrus/5 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center mb-4">
                <FileText className="h-10 w-10 text-apricot mr-3" />
                <h1 className="text-4xl font-bold text-blueberry dark:text-citrus">
                  Generate Cover Letter
                </h1>
              </div>
              <p className="text-xl text-blueberry/80 dark:text-apple-core max-w-3xl">
                Generate tailored cover letters that highlight your strengths and align with specific job requirements.
              </p>
            </div>
          </div>
        </div>

        <NoAnalysisModal
          isOpen={showNoAnalysisModal}
          onClose={() => setShowNoAnalysisModal(false)}
          onUseManualInput={handleUseManualInput}
        />

        {showSavePrompt && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md">
              <h3 className="text-lg font-semibold mb-4">Unsaved Changes</h3>
              <p className="mb-6">You have unsaved changes. Would you like to save before continuing?</p>
              <div className="flex space-x-4">
                <Button onClick={() => confirmTabChange(true)} className="bg-apricot hover:bg-apricot/90">
                  Save & Continue
                </Button>
                <Button variant="outline" onClick={() => confirmTabChange(false)}>
                  Don't Save
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-1">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="create">Generate New</TabsTrigger>
                <TabsTrigger value="result">Current Result</TabsTrigger>
                <TabsTrigger value="history">Document History</TabsTrigger>
              </TabsList>

              <TabsContent value="create">
                <div className="space-y-6">
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

                  {/* Panel 1: Title and Generation Method Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-blueberry dark:text-citrus">
                        <Sparkles className="h-5 w-5 text-apricot mr-2" />
                        Generate Cover Letter
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-base font-medium text-blueberry dark:text-apple-core">How would you like to generate your cover letter?</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <button
                            onClick={() => handleGenerationMethodChange('input')}
                            className={`p-4 border rounded-lg text-left transition-colors ${
                              generationMethod === 'input'
                                ? 'border-apricot bg-apricot/5'
                                : 'border-apple-core/30 dark:border-citrus/20 hover:border-apple-core/50 dark:hover:border-citrus/30'
                            }`}
                          >
                            <div className="flex items-center mb-2">
                              <FileUp className="h-5 w-5 text-apricot mr-2" />
                              <span className="font-medium text-blueberry dark:text-citrus">Generate from Input</span>
                            </div>
                            <p className="text-sm text-blueberry/70 dark:text-apple-core/70">
                              Enter job details manually to create a cover letter
                            </p>
                          </button>
                          
                          <button
                            onClick={() => handleGenerationMethodChange('analysis')}
                            className={`p-4 border rounded-lg text-left transition-colors ${
                              generationMethod === 'analysis'
                                ? 'border-apricot bg-apricot/5'
                                : 'border-apple-core/30 dark:border-citrus/20 hover:border-apple-core/50 dark:hover:border-citrus/30'
                            }`}
                          >
                            <div className="flex items-center mb-2">
                              <Search className="h-5 w-5 text-apricot mr-2" />
                              <span className="font-medium text-blueberry dark:text-citrus">Generate from Analysis</span>
                            </div>
                            <p className="text-sm text-blueberry/70 dark:text-apple-core/70">
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
                      <CardHeader>
                        <CardTitle className="text-blueberry dark:text-citrus">Job Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="jobTitle" className="text-blueberry dark:text-apple-core">Job Title *</Label>
                            <Input
                              id="jobTitle"
                              placeholder="e.g., Marketing Manager"
                              value={formData.jobTitle}
                              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                              className={validationErrors.includes('Job title is required') ? 'border-red-500' : 'border-apple-core/30 dark:border-citrus/20'}
                            />
                          </div>
                          <div>
                            <Label htmlFor="companyName" className="text-blueberry dark:text-apple-core">Company Name *</Label>
                            <Input
                              id="companyName"
                              placeholder="e.g., TechCorp"
                              value={formData.companyName}
                              onChange={(e) => handleInputChange('companyName', e.target.value)}
                              className={validationErrors.includes('Company name is required') ? 'border-red-500' : 'border-apple-core/30 dark:border-citrus/20'}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="jobDescription" className="text-blueberry dark:text-apple-core">Job Description *</Label>
                          <Textarea
                            id="jobDescription"
                            placeholder="Paste the complete job description here for the most tailored results..."
                            value={formData.jobDescription}
                            onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                            rows={6}
                            className={validationErrors.includes('Job description is required') ? 'border-red-500' : 'border-apple-core/30 dark:border-citrus/20'}
                          />
                          <p className="text-sm text-blueberry/70 dark:text-apple-core/70 mt-1">
                            Job description is required for optimal cover letter generation
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Panel 3: Analysis Selection (only shown for analysis method) */}
                  {generationMethod === 'analysis' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-blueberry dark:text-citrus">Select Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div>
                          <Label className="text-blueberry dark:text-apple-core">Select Analysis *</Label>
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-blueberry dark:text-citrus">Generation Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Advanced Generation Options */}
                      <AdvancedGenerationOptions
                        value={advancedOptions}
                        onChange={setAdvancedOptions}
                      />

                      {/* Tone and Length */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="tone" className="text-blueberry dark:text-apple-core">Tone</Label>
                          <Select value={formData.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                            <SelectTrigger className="border-apple-core/30 dark:border-citrus/20">
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
                          <Label htmlFor="length" className="text-blueberry dark:text-apple-core">Length</Label>
                          <Select value={formData.length} onValueChange={(value) => handleInputChange('length', value)}>
                            <SelectTrigger className="border-apple-core/30 dark:border-citrus/20">
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
                  <Card>
                    <CardContent className="pt-6">
                      <Button
                        onClick={handleGenerate}
                        disabled={!canGenerate || isGenerating || credits < 1}
                        className="w-full bg-apricot hover:bg-apricot/90 text-white font-medium"
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
                      <p className="text-sm text-blueberry/70 dark:text-apple-core/70 text-center mt-2">
                        Our AI uses the info above to generate a tailored cover letter, to help you stand out.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="result">
                {selectedCoverLetter ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-blueberry dark:text-citrus">{selectedCoverLetter.job_title} at {selectedCoverLetter.company_name}</CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm text-blueberry/70 dark:text-apple-core/70">
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
                          <DownloadOptions
                            content={selectedCoverLetter.content}
                            fileName={`Cover_Letter_${selectedCoverLetter.company_name}_${selectedCoverLetter.job_title}`}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <EditableCoverLetter
                        content={selectedCoverLetter.content}
                        onSave={handleUpdateCoverLetter}
                      />
                      
                      <div className="flex items-center justify-between pt-4 border-t border-apple-core/30 dark:border-citrus/20">
                        <div className="flex items-center space-x-4">
                          <Select
                            value={formData.tone}
                            onValueChange={(value) => handleInputChange('tone', value)}
                          >
                            <SelectTrigger className="w-32 border-apple-core/30 dark:border-citrus/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="conversational">Conversational</SelectItem>
                              <SelectItem value="confident">Confident</SelectItem>
                              <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Select
                            value={formData.length}
                            onValueChange={(value) => handleInputChange('length', value)}
                          >
                            <SelectTrigger className="w-40 border-apple-core/30 dark:border-citrus/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {lengthOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label.split(' ')[0]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <Button
                            variant="outline"
                            onClick={() => handleRegenerate(selectedCoverLetter.id, formData.tone, formData.length)}
                            disabled={isRegenerating}
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
                          </Button>
                          <div className="text-xs text-blueberry/60 dark:text-apple-core/60 mt-1">
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
                  <Card>
                    <CardContent className="text-center py-8">
                      <FileText className="h-12 w-12 text-apple-core/60 dark:text-citrus/60 mx-auto mb-4" />
                      <p className="text-blueberry/70 dark:text-apple-core/70 mb-2">
                        No cover letter generated yet.
                      </p>
                      <p className="text-sm text-blueberry/60 dark:text-apple-core/60">
                        Create one in the "Generate New" tab or view previous letters in "Document History".
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-blueberry dark:text-citrus">Document History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingHistory ? (
                      <div className="text-center py-8 text-blueberry/70 dark:text-apple-core/70">Loading...</div>
                    ) : coverLetters.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-apple-core/60 dark:text-citrus/60 mx-auto mb-4" />
                        <p className="text-blueberry/70 dark:text-apple-core/70">
                          No cover letters created yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {coverLetters.map((coverLetter) => (
                          <div
                            key={coverLetter.id}
                            className="border border-apple-core/30 dark:border-citrus/20 rounded-lg p-4 hover:bg-apple-core/10 dark:hover:bg-blueberry/10 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-blueberry dark:text-citrus">{coverLetter.job_title} at {coverLetter.company_name}</h3>
                                  {coverLetter.regeneration_count > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      v{coverLetter.regeneration_count + 1}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-blueberry/70 dark:text-apple-core/70">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(coverLetter.created_at)}
                                  </div>
                                  {coverLetter.updated_at !== coverLetter.created_at && (
                                    <div>Updated {formatDate(coverLetter.updated_at)}</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewCoverLetter(coverLetter)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <DownloadOptions
                                  content={coverLetter.content}
                                  fileName={`Cover_Letter_${coverLetter.company_name}_${coverLetter.job_title}`}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(coverLetter.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
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
        </div>
      </div>
    </div>
  );
};

export default CoverLetter;
