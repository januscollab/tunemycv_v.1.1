import React from 'react';
import { useCopyRestriction } from '@/hooks/useCopyRestriction';

interface SecureAnalysisContentProps {
  children: React.ReactNode;
  className?: string;
}

const SecureAnalysisContent: React.FC<SecureAnalysisContentProps> = ({ children, className = '' }) => {
  const { restrictionClass } = useCopyRestriction();

  return (
    <div className={`${className} ${restrictionClass}`}>
      {children}
    </div>
  );
};

export default SecureAnalysisContent;