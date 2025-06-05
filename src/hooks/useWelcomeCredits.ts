import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useWelcomeCredits = () => {
  const { user } = useAuth();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if this is a new user (just registered)
      const userCreatedAt = new Date(user.created_at || '');
      const now = new Date();
      const timeDiff = now.getTime() - userCreatedAt.getTime();
      const minutesDiff = timeDiff / (1000 * 60);

      // Show welcome modal if user was created within the last 5 minutes
      // and haven't seen the welcome modal before
      const hasSeenWelcome = localStorage.getItem(`welcome_shown_${user.id}`);
      
      if (minutesDiff < 5 && !hasSeenWelcome) {
        setShowWelcomeModal(true);
        localStorage.setItem(`welcome_shown_${user.id}`, 'true');
      }
    }
  }, [user]);

  const closeWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  return {
    showWelcomeModal,
    closeWelcomeModal
  };
};