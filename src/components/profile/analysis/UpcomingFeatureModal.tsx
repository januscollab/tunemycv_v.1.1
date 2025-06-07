
import React from 'react';
import { X, CreditCard, FileText, MessageSquare } from 'lucide-react';

interface UpcomingFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureType: 'cover-letter' | 'interview-prep' | null;
}

const UpcomingFeatureModal: React.FC<UpcomingFeatureModalProps> = ({ isOpen, onClose, featureType }) => {
  if (!isOpen || !featureType) return null;

  const getFeatureInfo = () => {
    switch (featureType) {
      case 'cover-letter':
        return {
          title: 'Create Cover Letter',
          icon: <FileText className="h-6 w-6 text-blue-600" />,
          cost: 1,
          description: 'Create a tailored cover letter that aligns your experience with the role — crafted from your CV and the job description for maximum impact.',
          features: [
            'Personalized content based on your CV',
            'Job-specific customization',
            'Professional formatting',
            'ATS-optimized language'
          ]
        };
      case 'interview-prep':
        return {
          title: 'Interview Preparation',
          icon: <MessageSquare className="h-6 w-6 text-green-600" />,
          cost: 2,
          description: 'Prepare with confidence — our bespoke analysis of the company, latest news, and interview focus areas so you walk into your interview informed and confident.',
          features: [
            'Predicted interview questions',
            'Personalized answer suggestions',
            'Behavioral question preparation',
            'Company-specific insights'
          ]
        };
      default:
        return null;
    }
  };

  const featureInfo = getFeatureInfo();
  if (!featureInfo) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            {featureInfo.icon}
            <h2 className="text-xl font-semibold text-gray-900">{featureInfo.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-50 rounded-full p-3">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-display font-bold text-foreground mb-2">{featureInfo.cost} Credit{featureInfo.cost > 1 ? 's' : ''}</div>
              <div className="text-sm text-gray-600">Required to use this feature</div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 mb-4">{featureInfo.description}</p>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Features included:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {featureInfo.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                Coming Soon
              </div>
            </div>
            <p className="text-sm text-blue-700">
              This feature is currently in development and will be available soon. 
              We'll notify you when it's ready!
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingFeatureModal;
