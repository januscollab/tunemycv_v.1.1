
import { Upload, FileText, CheckCircle, TrendingUp } from 'lucide-react';

const AnalyzeCV = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Analyze Your CV</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your CV and get instant feedback with actionable recommendations to improve your chances of getting hired.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
            <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your CV</h3>
            <p className="text-gray-600 mb-4">Drag and drop your CV here, or click to browse</p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
              Choose File
            </button>
            <p className="text-sm text-gray-500 mt-2">Supports PDF, DOC, DOCX (Max 10MB)</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Content Analysis</h3>
            <p className="text-gray-600 text-sm">Get detailed feedback on your CV content, structure, and formatting.</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">ATS Optimization</h3>
            <p className="text-gray-600 text-sm">Ensure your CV passes Applicant Tracking Systems with our optimization tips.</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Score & Recommendations</h3>
            <p className="text-gray-600 text-sm">Receive a comprehensive score and personalized improvement suggestions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyzeCV;
