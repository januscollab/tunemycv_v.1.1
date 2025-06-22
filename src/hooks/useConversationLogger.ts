import { useState, useCallback } from 'react';

interface ConversationLog {
  id: string;
  timestamp: Date;
  type: 'user' | 'assistant';
  content: string;
  summary?: string;
  tags: string[];
}

export const useConversationLogger = () => {
  const [isLogging, setIsLogging] = useState(false);

  const logConversation = useCallback((
    type: 'user' | 'assistant',
    content: string,
    summary?: string,
    tags: string[] = []
  ) => {
    // Only log in development mode
    if (!import.meta.env.DEV) return;

    try {
      const log: ConversationLog = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        type,
        content,
        summary,
        tags: [...tags, type] // Always include type as a tag
      };

      // Get existing logs
      const existingLogs = localStorage.getItem('dev-conversation-logs');
      const logs: ConversationLog[] = existingLogs ? JSON.parse(existingLogs) : [];

      // Add new log
      logs.push(log);

      // Keep only last 1000 logs to prevent storage issues
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }

      // Save back to localStorage
      localStorage.setItem('dev-conversation-logs', JSON.stringify(logs));
      
      console.log('[Dev Logger] Conversation logged:', { type, summary: summary || 'No summary' });
    } catch (error) {
      console.error('[Dev Logger] Failed to log conversation:', error);
    }
  }, []);

  const clearLogs = useCallback(() => {
    localStorage.removeItem('dev-conversation-logs');
    console.log('[Dev Logger] All logs cleared');
  }, []);

  const exportLogs = useCallback(() => {
    const logs = localStorage.getItem('dev-conversation-logs');
    return logs ? JSON.parse(logs) : [];
  }, []);

  return {
    logConversation,
    clearLogs,
    exportLogs,
    isLogging
  };
};
