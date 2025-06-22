import React from 'react';
import { Badge } from '@/components/ui/badge';

interface CoverLetterVersionBadgeProps {
  version: number;
  isLatest: boolean;
  totalVersions: number;
}

const CoverLetterVersionBadge: React.FC<CoverLetterVersionBadgeProps> = ({ 
  version, 
  isLatest, 
  totalVersions 
}) => {
  const getVersionDisplay = () => {
    if (totalVersions === 1) return null; // Don't show version for single version
    // Show v1 for first version when multiple versions exist
    return `v${version}`;
  };

  const versionText = getVersionDisplay();
  if (!versionText) return null;

  return (
    <Badge 
      variant="compact" 
      className={`${
        isLatest 
          ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-600' 
          : 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-600'
      }`}
    >
      {versionText}
    </Badge>
  );
};

export default CoverLetterVersionBadge;