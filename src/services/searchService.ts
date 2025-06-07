import { supabase } from "@/integrations/supabase/client";

export interface SearchQuery {
  query: string;
  searchType?: 'job_research' | 'company_research' | 'industry_insights' | 'skill_validation' | 'interview_prep';
  site?: string;
  dateRestrict?: string;
  num?: number;
  start?: number;
}

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  formattedUrl: string;
  htmlTitle?: string;
  htmlSnippet?: string;
  pagemap?: any;
}

export interface SearchResponse {
  items: SearchResult[];
  searchInformation: {
    totalResults: string;
    searchTime: number;
  };
  queries?: {
    nextPage?: Array<{ startIndex: number }>;
    previousPage?: Array<{ startIndex: number }>;
  };
}

export interface SearchOptions {
  cacheResults?: boolean;
  maxResults?: number;
  enableAIAnalysis?: boolean;
}

class SearchService {
  private readonly BASE_URL = 'https://aohrfehhyjdebaatzqdl.supabase.co/functions/v1/google-search';

  async search(
    searchQuery: SearchQuery,
    options: SearchOptions = {}
  ): Promise<SearchResponse> {
    try {
      const response = await supabase.functions.invoke('google-search', {
        body: {
          query: searchQuery.query,
          searchType: searchQuery.searchType || 'general',
          site: searchQuery.site,
          dateRestrict: searchQuery.dateRestrict,
          num: searchQuery.num || options.maxResults || 10,
          start: searchQuery.start || 1,
          options
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Search request failed');
      }

      return response.data;
    } catch (error) {
      console.error('Search service error:', error);
      throw error;
    }
  }

  // Specialized search methods for different use cases
  async searchJobs(jobTitle: string, location?: string, options?: SearchOptions): Promise<SearchResponse> {
    const query = location ? `${jobTitle} jobs ${location}` : `${jobTitle} jobs`;
    return this.search({
      query,
      searchType: 'job_research',
      site: 'linkedin.com OR indeed.com OR glassdoor.com'
    }, options);
  }

  async searchCompany(companyName: string, options?: SearchOptions): Promise<SearchResponse> {
    return this.search({
      query: `${companyName} company culture reviews employee experience`,
      searchType: 'company_research'
    }, options);
  }

  async searchIndustryTrends(industry: string, options?: SearchOptions): Promise<SearchResponse> {
    return this.search({
      query: `${industry} industry trends 2024 market analysis`,
      searchType: 'industry_insights',
      dateRestrict: 'y1' // Last year
    }, options);
  }

  async searchSkillRequirements(skill: string, jobRole?: string, options?: SearchOptions): Promise<SearchResponse> {
    const query = jobRole 
      ? `${skill} requirements ${jobRole} job market demand`
      : `${skill} skill market demand requirements`;
    
    return this.search({
      query,
      searchType: 'skill_validation'
    }, options);
  }

  async searchInterviewQuestions(companyName: string, role?: string, options?: SearchOptions): Promise<SearchResponse> {
    const query = role 
      ? `${companyName} ${role} interview questions experience`
      : `${companyName} interview questions process experience`;
    
    return this.search({
      query,
      searchType: 'interview_prep'
    }, options);
  }
}

export const searchService = new SearchService();