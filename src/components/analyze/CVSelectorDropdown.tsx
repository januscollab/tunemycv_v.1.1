
import React from 'react';
import { FileText } from 'lucide-react';
import { VybeSelect } from '@/components/design-system/VybeSelect';

interface CVUpload {
  id: string;
  file_name: string;
  file_size: number;
  created_at: string;
  extracted_text: string;
}

interface CVSelectorDropdownProps {
  savedCVs: CVUpload[];
  selectedCVId: string | null;
  onCVSelect: (cv: CVUpload) => void;
}

const CVSelectorDropdown: React.FC<CVSelectorDropdownProps> = ({ 
  savedCVs, 
  selectedCVId, 
  onCVSelect 
}) => {
  if (savedCVs.length === 0) return null;

  const cvOptions = savedCVs.map((cv) => ({
    value: cv.id,
    label: cv.file_name,
    description: new Date(cv.created_at).toLocaleDateString(),
    icon: FileText
  }));

  const handleCVChange = (cvId: string) => {
    const selectedCV = savedCVs.find(cv => cv.id === cvId);
    if (selectedCV) {
      onCVSelect(selectedCV);
    }
  };

  return (
    <div className="mb-4">
      <h4 className="text-caption font-medium text-blueberry dark:text-citrus mb-3">Saved CVs</h4>
      <VybeSelect
        placeholder="Select a saved CV"
        value={selectedCVId || ''}
        onValueChange={handleCVChange}
        options={cvOptions}
        icon={FileText}
      />
    </div>
  );
};

export default CVSelectorDropdown;
