
import React, { useState } from 'react';
import { X, Copy, Download, FileText, Clock, User, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalysisLogDetailModalProps {
  log: {
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
  };
  onClose: () => void;
}

const AnalysisLogDetailModal: React.FC<AnalysisLogDetailModalProps> = ({ log, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'prompt' | 'response'>('overview');
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: `${label} copied to clipboard` });
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Downloaded!', description: `${filename} downloaded successfully` });
  };

  const formatJSON = (jsonString: string) => {
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2);
    } catch {
      return jsonString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <h2 className="text-heading font-semibold text-foreground">Analysis Log Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b flex-shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium text-caption transition-colors ${
              activeTab === 'overview'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('prompt')}
            className={`px-6 py-3 font-medium text-caption transition-colors ${
              activeTab === 'prompt'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Prompt
          </button>
          <button
            onClick={() => setActiveTab('response')}
            className={`px-6 py-3 font-medium text-caption transition-colors ${
              activeTab === 'response'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Briefcase className="h-4 w-4 inline mr-2" />
            Response
          </button>
        </div>

        {/* Content - Made scrollable */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              {/* User Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    User Information
                  </h3>
                  <div className="space-y-2 text-caption">
                    <div><span className="font-medium">Name:</span> {log.first_name || 'N/A'} {log.last_name || ''}</div>
                    <div><span className="font-medium">Email:</span> {log.user_email || 'N/A'}</div>
                    <div><span className="font-medium">CV File:</span> {log.cv_file_name || 'N/A'}</div>
                    <div><span className="font-medium">Job Description:</span> {log.job_description_file_name || 'N/A'}</div>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Job Analysis
                  </h3>
                  <div className="space-y-2 text-caption">
                    <div><span className="font-medium">Job Title:</span> {log.job_title || 'Not specified'}</div>
                    <div><span className="font-medium">Company:</span> {log.company_name || 'Not specified'}</div>
                    <div><span className="font-medium">Compatibility Score:</span> {log.compatibility_score ? `${log.compatibility_score}%` : 'Not available'}</div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-micro ${
                        log.status === 'success' ? 'bg-success-50 text-success' : 'bg-destructive-50 text-destructive'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Technical Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-caption">
                  <div><span className="font-medium">Model:</span> {log.openai_model}</div>
                  <div><span className="font-medium">Processing Time:</span> {log.processing_time_ms}ms</div>
                  <div><span className="font-medium">Tokens Used:</span> {log.tokens_used || 'N/A'}</div>
                  <div><span className="font-medium">Created:</span> {new Date(log.created_at).toLocaleString()}</div>
                </div>
              </div>

              {/* Error Message */}
              {log.error_message && (
                <div className="bg-destructive-50 border border-destructive rounded-lg p-4">
                  <h3 className="font-semibold text-destructive mb-2">Error Details</h3>
                  <p className="text-caption text-destructive font-mono">{log.error_message}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'prompt' && (
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="font-semibold text-foreground">OpenAI Prompt</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(log.prompt_text, 'Prompt')}
                    className="flex items-center px-3 py-1 text-caption bg-muted hover:bg-muted-hover rounded transition-colors"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </button>
                  <button
                    onClick={() => downloadAsFile(log.prompt_text, `prompt-${log.id}.txt`)}
                    className="flex items-center px-3 py-1 text-caption bg-info-50 hover:bg-info text-info rounded transition-colors"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-muted rounded-lg p-4 overflow-y-auto">
                <pre className="text-caption text-muted-foreground whitespace-pre-wrap font-mono">
                  {log.prompt_text}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'response' && (
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="font-semibold text-foreground">OpenAI Response</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(log.response_text, 'Response')}
                    className="flex items-center px-3 py-1 text-caption bg-muted hover:bg-muted-hover rounded transition-colors"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </button>
                  <button
                    onClick={() => downloadAsFile(formatJSON(log.response_text), `response-${log.id}.json`)}
                    className="flex items-center px-3 py-1 text-caption bg-success-50 hover:bg-success text-success rounded transition-colors"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download JSON
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-muted rounded-lg p-4 overflow-y-auto">
                <pre className="text-caption text-muted-foreground whitespace-pre-wrap font-mono">
                  {formatJSON(log.response_text)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-muted flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisLogDetailModal;
