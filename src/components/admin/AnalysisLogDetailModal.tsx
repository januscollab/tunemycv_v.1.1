
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
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Analysis Log Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('prompt')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'prompt'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Prompt
          </button>
          <button
            onClick={() => setActiveTab('response')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'response'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Briefcase className="h-4 w-4 inline mr-2" />
            Response
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
              {/* User Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    User Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {log.first_name} {log.last_name}</div>
                    <div><span className="font-medium">Email:</span> {log.user_email}</div>
                    <div><span className="font-medium">CV File:</span> {log.cv_file_name || 'N/A'}</div>
                    <div><span className="font-medium">Job Description:</span> {log.job_description_file_name || 'N/A'}</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Job Analysis
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Job Title:</span> {log.job_title || 'N/A'}</div>
                    <div><span className="font-medium">Company:</span> {log.company_name || 'N/A'}</div>
                    <div><span className="font-medium">Compatibility Score:</span> {log.compatibility_score || 'N/A'}%</div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Technical Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Model:</span> {log.openai_model}</div>
                  <div><span className="font-medium">Processing Time:</span> {log.processing_time_ms}ms</div>
                  <div><span className="font-medium">Tokens Used:</span> {log.tokens_used || 'N/A'}</div>
                  <div><span className="font-medium">Created:</span> {new Date(log.created_at).toLocaleString()}</div>
                </div>
              </div>

              {/* Error Message */}
              {log.error_message && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2">Error Details</h3>
                  <p className="text-sm text-red-700 font-mono">{log.error_message}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'prompt' && (
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">OpenAI Prompt</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(log.prompt_text, 'Prompt')}
                    className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </button>
                  <button
                    onClick={() => downloadAsFile(log.prompt_text, `prompt-${log.id}.txt`)}
                    className="flex items-center px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {log.prompt_text}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'response' && (
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">OpenAI Response</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(log.response_text, 'Response')}
                    className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </button>
                  <button
                    onClick={() => downloadAsFile(formatJSON(log.response_text), `response-${log.id}.json`)}
                    className="flex items-center px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download JSON
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {formatJSON(log.response_text)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisLogDetailModal;
