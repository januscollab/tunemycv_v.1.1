
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import InterviewPrepLoggedOut from '@/components/analyze/InterviewPrepLoggedOut';

const InterviewPrep = () => {
  const { user } = useAuth();

  // If user is logged in, redirect to analyze page with interview-prep tab
  if (user) {
    return <Navigate to="/analyze?tab=interview-prep" replace />;
  }

  return <InterviewPrepLoggedOut />;
};

export default InterviewPrep;
