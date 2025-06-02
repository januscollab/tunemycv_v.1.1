
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { Edit, Plus, FileText, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCoverLetter } from '@/hooks/useCoverLetter';
import AnalysisSelector from '@/components/cover-letter/AnalysisSelector';
import AdvancedGenerationOptions from '@/components/cover-letter/AdvancedGenerationOptions';
import EditableCoverLetter from '@/components/cover-letter/EditableCoverLetter';
import CoverLetterLoggedOut from '@/components/cover-letter/CoverLetterLoggedOut';
import CreditsPanel from '@/components/analyze/CreditsPanel';
import DocumentActions from '@/components/common/DocumentActions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CoverLetter = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('generate');
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState({
    tone: 'professional',
    length: 'medium',
    focusAreas: [],
    customInstructions: ''
  });

  // Get pre-selected analysis from navigation state
  useEffect(() => {
    if (location.state?.analysisId) {
      setSelectedAnalysisId(location.state.analysisId);
      setActiveTab('generate');
    }
  }, [location.state]);

  const {
    coverLetter,
    isGenerating,
    generateFromAnalysis,
    savedCoverLetters,
    refetchSavedLetters
  } = useCoverLetter();

  // Fetch user credits
  const { data: userCredits } = useQuery({
    queryKey: ['user-credits', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const credits = userCredits?.credits || 0;
  const hasCreditsForAI = credits > 0;

  const handleGenerate = async () => {
    if (!selectedAnalysisId) return;
    
    const result = await generateFromAnalysis({ analysisId: selectedAnalysisId });
    if (result) {
      setActiveTab('current');
    }
  };

  const handleEditCoverLetter = (coverLetterId: string) => {
    // Find the cover letter and switch to current tab in edit mode
    const letter = savedCoverLetters?.find(cl => cl.id === coverLetterId);
    if (letter) {
      setActiveTab('current');
      setIsEditMode(true);
    }
  };

  const downloadCoverLetterAsText = (content: string, fileName: string) => {
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

  const downloadCoverLetterAsPdf = (content: string, fileName: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${fileName}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                font-size: 12pt; 
                line-height: 1.5; 
                margin: 20mm; 
                white-space: pre-wrap;
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>${content.replace(/\n/g, '<br>')}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const downloadCoverLetterAsWord = (content: string, fileName: string) => {
    // Fallback to text download for Word format
    downloadCoverLetterAsText(content, fileName);
  };

  if (!user) {
    return <CoverLetterLoggedOut />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-earth dark:text-white mb-4">
            Generate Cover Letter
          </h1>
          <p className="text-xl text-earth/70 dark:text-white/70">
            Create tailored cover letters that highlight your strengths and align with job requirements
          </p>
        </div>

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1" style={{ width: '80%' }}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="generate" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Generate New</span>
                </TabsTrigger>
                <TabsTrigger value="current" className="flex items-center space-x-2" disabled={!coverLetter}>
                  <FileText className="h-4 w-4" />
                  <span>Current Result</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center space-x-2">
                  <History className="h-4 w-4" />
                  <span>History</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="generate" className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <div className="space-y-6">
                    <div className="border-l-4 border-zapier-orange pl-4 bg-zapier-orange/5 p-4 rounded-r-lg">
                      <h3 className="font-medium text-earth dark:text-white mb-2">Generate from Analysis</h3>
                      <AnalysisSelector
                        onAnalysisSelect={setSelectedAnalysisId}
                        selectedAnalysisId={selectedAnalysisId}
                        disabled={isGenerating}
                      />
                    </div>

                    <AdvancedGenerationOptions
                      value={advancedOptions}
                      onChange={setAdvancedOptions}
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleGenerate}
                    disabled={!selectedAnalysisId || isGenerating || !hasCreditsForAI}
                    className="bg-zapier-orange text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-zapier-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3"
                  >
                    <Edit className="h-5 w-5" />
                    <span>{isGenerating ? 'Generating...' : 'Generate Cover Letter'}</span>
                  </button>
                </div>
              </TabsContent>

              <TabsContent value="current">
                {coverLetter && (
                  <EditableCoverLetter
                    content={coverLetter.content}
                    isEditing={isEditMode}
                    onEditToggle={() => setIsEditMode(!isEditMode)}
                    fileName={`${coverLetter.job_title}_${coverLetter.company_name}_cover_letter`}
                  />
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                {savedCoverLetters && savedCoverLetters.length > 0 ? (
                  savedCoverLetters.map((letter) => (
                    <div key={letter.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow hover:border-zapier-orange/50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {letter.job_title} at {letter.company_name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Created: {new Date(letter.created_at!).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {letter.content.substring(0, 150)}...
                          </p>
                        </div>
                        
                        <DocumentActions
                          onEdit={() => handleEditCoverLetter(letter.id)}
                          onDownloadTxt={() => downloadCoverLetterAsText(letter.content, `${letter.job_title}_${letter.company_name}_cover_letter`)}
                          onDownloadPdf={() => downloadCoverLetterAsPdf(letter.content, `${letter.job_title}_${letter.company_name}_cover_letter`)}
                          onDownloadWord={() => downloadCoverLetterAsWord(letter.content, `${letter.job_title}_${letter.company_name}_cover_letter`)}
                          showEdit={true}
                          showDownload={true}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No cover letters generated yet. Create your first cover letter!
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Credits Panel */}
          <div className="w-[180px]">
            <CreditsPanel credits={credits} hasCreditsForAI={hasCreditsForAI} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetter;
