import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Sparkles, Download, Trash2, RefreshCw, Clock } from 'lucide-react';
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
import EmbeddedAuth from '@/components/auth/EmbeddedAuth';
import ServiceExplanation from '@/components/common/ServiceExplanation';
import FloatingActionBar from '@/components/common/FloatingActionBar';

const CoverLetter = () => {
  const { user } = useAuth();
  const { credits } = useUserData();
  const { generateCoverLetter, regenerateCoverLetter, getCoverLetters, deleteCoverLetter, isGenerating, isRegenerating } = useCoverLetter();
  
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    jobDescription: '',
    tone: 'professional',
    length: 'concise'
  });
  
  const [coverLetters, setCoverLetters] = useState<any[]>([]);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('create');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (selectedCoverLetter && !hasUnsavedChanges) {
      setHasUnsavedChanges(true);
    }
  };

  const handleGenerate = async () => {
    if (!formData.jobTitle || !formData.companyName || !formData.jobDescription) {
      return;
    }

    try {
      const result = await generateCoverLetter({
        jobTitle: formData.jobTitle,
        companyName: formData.companyName,
        jobDescription: formData.jobDescription,
        tone: formData.tone,
        length: formData.length
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
  };

  const handleSaveCoverLetter = () => {
    if (selectedCoverLetter) {
      setSelectedCoverLetter(prev => ({ ...prev, isUnsaved: false }));
      setHasUnsavedChanges(false);
      loadCoverLetterHistory();
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

  const downloadCoverLetter = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRemainingFreeRegenerations = (regenerationCount: number) => {
    return Math.max(0, 5 - regenerationCount);
  };

  const canGenerate = formData.jobTitle && formData.companyName && formData.jobDescription;

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
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ServiceExplanation
            title={coverLetterExplanation.title}
            subtitle={coverLetterExplanation.subtitle}
            benefits={coverLetterExplanation.benefits}
            features={coverLetterExplanation.features}
            icon={<FileText className="h-8 w-8 text-apricot" />}
            compact={true}
          />
          <EmbeddedAuth
            title="Login to Get Started"
            description="Cover letter generation requires an account to ensure personalized results and save your work."
            icon={<FileText className="h-6 w-6 text-apricot mr-2" />}
          />
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
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blueberry dark:text-citrus mb-4">Generate Cover Letter</h1>
          <div className="flex items-center justify-between">
            <p className="text-xl text-blueberry/80 dark:text-apple-core max-w-2xl">
              Generate tailored cover letters that highlight your strengths and align with specific job requirements.
            </p>
            <Badge variant="outline" className="text-apricot border-apricot text-lg px-4 py-2">
              {credits} Credits Available
            </Badge>
          </div>
        </div>

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

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="result">Current Result</TabsTrigger>
            <TabsTrigger value="history">Document History</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 text-apricot mr-2" />
                  Generate Cover Letter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jobTitle">Job Title *</Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g., Marketing Manager"
                      value={formData.jobTitle}
                      onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      placeholder="e.g., TechCorp"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
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
                    required
                  />
                  <p className="text-sm text-blueberry/70 dark:text-apple-core/70 mt-1">
                    Job description is required for optimal cover letter generation
                  </p>
                </div>

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
          </TabsContent>

          <TabsContent value="result">
            {selectedCoverLetter ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedCoverLetter.job_title} at {selectedCoverLetter.company_name}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadCoverLetter(
                          selectedCoverLetter.content,
                          `Cover_Letter_${selectedCoverLetter.company_name}_${selectedCoverLetter.job_title}`
                        )}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {selectedCoverLetter.content}
                    </pre>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
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
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={formData.length}
                        onValueChange={(value) => handleInputChange('length', value)}
                      >
                        <SelectTrigger className="w-40">
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
                      <div className="text-xs text-gray-500 mt-1">
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
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No cover letter generated yet. Create one in the "Create New" tab.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Document History</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="text-center py-8">Loading...</div>
                ) : coverLetters.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No cover letters created yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {coverLetters.map((coverLetter) => (
                      <div
                        key={coverLetter.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
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
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadCoverLetter(
                                coverLetter.content,
                                `Cover_Letter_${coverLetter.company_name}_${coverLetter.job_title}`
                              )}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(coverLetter.id)}
                            >
                              <Trash2 className="h-4 w-4" />
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

      {/* Floating Action Bar for Cover Letter Generation */}
      {activeTab === 'create' && (
        <FloatingActionBar
          credits={credits}
          actionText="Generate Cover Letter"
          onAction={handleGenerate}
          disabled={!canGenerate || isGenerating}
          loading={isGenerating}
          creditCost={1}
        />
      )}
    </div>
  );
};

export default CoverLetter;
