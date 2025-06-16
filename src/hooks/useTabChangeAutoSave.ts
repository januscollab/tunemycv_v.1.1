import { useEffect, useRef } from 'react';

interface UseTabChangeAutoSaveProps {
  onSave: () => Promise<void>;
  enabled?: boolean;
}

export const useTabChangeAutoSave = ({ onSave, enabled = true }: UseTabChangeAutoSaveProps) => {
  const saveOnUnloadRef = useRef<() => Promise<void>>();
  
  useEffect(() => {
    saveOnUnloadRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      if (saveOnUnloadRef.current) {
        try {
          await saveOnUnloadRef.current();
        } catch (error) {
          console.error('Failed to save on tab change:', error);
        }
      }
    };

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden' && saveOnUnloadRef.current) {
        try {
          await saveOnUnloadRef.current();
        } catch (error) {
          console.error('Failed to save on visibility change:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);
};