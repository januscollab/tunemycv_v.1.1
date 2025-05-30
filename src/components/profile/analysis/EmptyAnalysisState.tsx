
import React from 'react';
import { Calendar } from 'lucide-react';

const EmptyAnalysisState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <Calendar className="h-12 w-12 mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses yet</h3>
      <p className="text-gray-500 mb-4">
        Start analyzing your CV to see your history here.
      </p>
    </div>
  );
};

export default EmptyAnalysisState;
