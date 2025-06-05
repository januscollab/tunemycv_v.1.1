import { useState, useCallback } from 'react';
import { searchService, SearchQuery, SearchResponse, SearchOptions } from '@/services/searchService';
import { useToast } from '@/hooks/use-toast';

export interface UseGoogleSearchResult {
  data: SearchResponse | null;
  loading: boolean;
  error: string | null;
  search: (query: SearchQuery, options?: SearchOptions) => Promise<void>;
  searchJobs: (jobTitle: string, location?: string) => Promise<void>;
  searchCompany: (companyName: string) => Promise<void>;
  searchIndustryTrends: (industry: string) => Promise<void>;
  searchSkillRequirements: (skill: string, jobRole?: string) => Promise<void>;
  searchInterviewQuestions: (companyName: string, role?: string) => Promise<void>;
  clearResults: () => void;
}

export const useGoogleSearch = (): UseGoogleSearchResult => {
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleError = useCallback((err: any) => {
    const errorMessage = err.message || 'An error occurred during search';
    setError(errorMessage);
    
    if (errorMessage.includes('Rate limit exceeded')) {
      toast({
        title: "Search Limit Reached",
        description: "You've reached the hourly search limit. Please try again later.",
        variant: "destructive",
      });
    } else if (errorMessage.includes('Authentication required')) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use search functionality.",
        variant: "destructive",
      });
    } else if (errorMessage.includes('credentials not configured')) {
      toast({
        title: "Search Not Available",
        description: "Google Search API is not configured. Please contact support.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Search Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  const search = useCallback(async (query: SearchQuery, options?: SearchOptions) => {
    if (!query.query.trim()) {
      setError('Search query cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchService.search(query, options);
      setData(results);
      
      if (results.items.length === 0) {
        toast({
          title: "No Results Found",
          description: "Try adjusting your search terms or criteria.",
          variant: "default",
        });
      }
    } catch (err) {
      handleError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [handleError, toast]);

  const searchJobs = useCallback(async (jobTitle: string, location?: string) => {
    if (!jobTitle.trim()) {
      setError('Job title cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchService.searchJobs(jobTitle, location);
      setData(results);
    } catch (err) {
      handleError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const searchCompany = useCallback(async (companyName: string) => {
    if (!companyName.trim()) {
      setError('Company name cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchService.searchCompany(companyName);
      setData(results);
    } catch (err) {
      handleError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const searchIndustryTrends = useCallback(async (industry: string) => {
    if (!industry.trim()) {
      setError('Industry cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchService.searchIndustryTrends(industry);
      setData(results);
    } catch (err) {
      handleError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const searchSkillRequirements = useCallback(async (skill: string, jobRole?: string) => {
    if (!skill.trim()) {
      setError('Skill cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchService.searchSkillRequirements(skill, jobRole);
      setData(results);
    } catch (err) {
      handleError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const searchInterviewQuestions = useCallback(async (companyName: string, role?: string) => {
    if (!companyName.trim()) {
      setError('Company name cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchService.searchInterviewQuestions(companyName, role);
      setData(results);
    } catch (err) {
      handleError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const clearResults = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    search,
    searchJobs,
    searchCompany,
    searchIndustryTrends,
    searchSkillRequirements,
    searchInterviewQuestions,
    clearResults,
  };
};