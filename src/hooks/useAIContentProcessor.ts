import { useState, useCallback } from 'react';
import { AIAction } from '@/components/ui/ai-context-menu';

interface AIProcessorOptions {
  apiEndpoint?: string;
  onSuccess?: (processedText: string) => void;
  onError?: (error: string) => void;
}

interface UseAIContentProcessorReturn {
  isProcessing: boolean;
  processContent: (action: AIAction) => Promise<string | null>;
  error: string | null;
}

/**
 * Hook for processing content with AI
 * Currently returns placeholder responses - ready for OpenAI integration
 */
export const useAIContentProcessor = ({
  apiEndpoint = '/api/ai/process-content',
  onSuccess,
  onError
}: AIProcessorOptions = {}): UseAIContentProcessorReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePrompt = useCallback((action: AIAction): string => {
    const { type, subType, selectedText } = action;
    
    const prompts = {
      rephrase: {
        professional: `Rewrite the following text to use formal, polished business language while maintaining the original meaning:\n\n"${selectedText}"`,
        conversational: `Rewrite the following text in a more conversational, friendly tone while keeping the core message:\n\n"${selectedText}"`,
        creative: `Rewrite the following text with more creativity, storytelling elements, or unique flair:\n\n"${selectedText}"`,
        structured: `Rewrite the following text with better sentence structure, improved flow, and clearer logic:\n\n"${selectedText}"`
      },
      improve: `Improve the clarity, grammar, and readability of the following text while maintaining its original meaning:\n\n"${selectedText}"`,
      adjust_length: {
        longer: `Expand the following text with more detail, examples, or supporting information:\n\n"${selectedText}"`,
        shorter: `Condense the following text to its core message while preserving the key information:\n\n"${selectedText}"`,
        summarize: `Provide a concise 1-2 sentence summary of the following text:\n\n"${selectedText}"`,
        expand_example: `Add a relevant real-world example or specific result to illustrate the following text:\n\n"${selectedText}"`
      },
      role_specific: `Tailor the following text to be more relevant for a specific job role, using appropriate industry terminology and tone:\n\n"${selectedText}"`
    };

    if (type === 'rephrase' && subType && subType in prompts.rephrase) {
      return prompts.rephrase[subType as keyof typeof prompts.rephrase];
    }
    
    if (type === 'adjust_length' && subType && subType in prompts.adjust_length) {
      return prompts.adjust_length[subType as keyof typeof prompts.adjust_length];
    }
    
    if (type === 'improve') {
      return prompts.improve;
    }
    
    if (type === 'role_specific') {
      return prompts.role_specific;
    }
    
    return prompts.improve;
  }, []);

  const processContent = useCallback(async (action: AIAction): Promise<string | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Use the Supabase edge function for AI processing
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error: functionError } = await supabase.functions.invoke('process-ai-content', {
        body: {
          action: action,
          selectedText: action.selectedText
        }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Failed to process content with AI');
      }

      const processedText = data?.processedText;
      if (!processedText) {
        throw new Error('No processed text received from AI');
      }

      if (onSuccess) {
        onSuccess(processedText);
      }

      return processedText;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process content with AI';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [apiEndpoint, generatePrompt, onSuccess, onError]);

  return {
    isProcessing,
    processContent,
    error
  };
};