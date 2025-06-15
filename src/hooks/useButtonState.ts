import { useState, useCallback } from 'react';

interface UseButtonStateOptions {
  onSuccess?: () => void;
  loadingDuration?: number;
}

interface UseButtonStateReturn {
  isLoading: boolean;
  isSuccess: boolean;
  isVisible: boolean;
  handleAction: (action: () => Promise<void> | void) => Promise<void>;
  reset: () => void;
  hide: () => void;
}

export const useButtonState = ({
  onSuccess,
  loadingDuration = 500
}: UseButtonStateOptions = {}): UseButtonStateReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleAction = useCallback(async (action: () => Promise<void> | void) => {
    setIsLoading(true);
    
    try {
      await action();
      setIsSuccess(true);
      onSuccess?.();
      
      // Keep loading state briefly to show user action was registered
      setTimeout(() => {
        setIsLoading(false);
        // Hide button after successful action
        setTimeout(() => {
          setIsVisible(false);
        }, 200);
      }, loadingDuration);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, [onSuccess, loadingDuration]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setIsSuccess(false);
    setIsVisible(true);
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    isLoading,
    isSuccess,
    isVisible,
    handleAction,
    reset,
    hide
  };
};
