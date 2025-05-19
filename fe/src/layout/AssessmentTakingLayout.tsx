import React from 'react';
import { AssessmentTakingProvider } from '../contexts/AssessmentTakingContext';


interface AssessmentTakingLayoutProps {
  children: React.ReactNode;
}

const AssessmentTakingLayout: React.FC<AssessmentTakingLayoutProps> = ({ children }) => {
  return <AssessmentTakingProvider>{children}</AssessmentTakingProvider>;
};

export default AssessmentTakingLayout;