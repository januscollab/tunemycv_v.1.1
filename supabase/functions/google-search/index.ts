import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  query: string;
  searchType?: string;
  site?: string;
  dateRestrict?: string;
  num?: number;
  start?: number;
  options?: {
    cacheResults?: boolean;
    maxResults?: number;
    enableAIAnalysis?: boolean;
  };
}

// Security validation for search queries
const validateAndSanitizeQuery = (query: string): string => {
  if (!query || typeof query !== 'string') {
    throw new Error('Search query is required and must be a string');
  }
  
  // Remove potential injection patterns
  const sanitized = query
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 500); // Limit query length
  
  if (sanitized.length === 0) {
    throw new Error('Search query cannot be empty after sanitization');
  }
  
  return sanitized;
};

// Rate limiting check
const checkRateLimit = async (supabase: any, userId: string): Promise<void> => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const { data: recentSearches, error } = await supabase
    .from('analysis_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('operation_type', 'google_search')
    .gte('created_at', oneHourAgo.toISOString())
    .limit(50);
    
  if (error) {
    console.error('Rate limit check error:', error);
    throw new Error('Unable to verify rate limits');
  }
  
  if (recentSearches && recentSearches.length >= 50) {
    throw new Error('Rate limit exceeded: Maximum 50 searches per hour');
  }
};

// Log search interaction
const logSearchInteraction = async (
  supabase: any,
  data: {
    userId: string;
    query: string;
    searchType: string;
    resultsCount: number;
    processingTime: number;
    status: 'success' | 'error';
    errorMessage?: string;
  }
) => {
  try {
    const { error } = await supabase
      .from('analysis_logs')
      .insert({
        user_id: data.userId,
        operation_type: 'google_search',
        prompt_text: data.query,
        response_text: `Search completed: ${data.resultsCount} results`,
        processing_time_ms: data.processingTime,
        status: data.status,
        error_message: data.errorMessage,
        response_metadata: {
          search_type: data.searchType,
          results_count: data.resultsCount
        }
      });

    if (error) {
      console.error('Failed to log search interaction:', error);
    }
  } catch (error) {
    console.error('Error logging search interaction:', error);
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const googleApiKey = Deno.env.get('GOOGLE_SEARCH_API_KEY');
  const googleCxId = Deno.env.get('GOOGLE_SEARCH_CX_ID');
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  if (!googleApiKey || !googleCxId) {
    return new Response(
      JSON.stringify({ error: 'Google Custom Search API credentials not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  let requestData: SearchRequest;
  let userId: string | null = null;

  try {
    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    if (!userId) {
      throw new Error('Authentication required for search functionality');
    }

    requestData = await req.json();
    const { query, searchType = 'general', site, dateRestrict, num = 10, start = 1 } = requestData;

    console.log('Processing search request for user:', userId);
    
    // Validate and sanitize query
    const sanitizedQuery = validateAndSanitizeQuery(query);
    
    // Check rate limiting
    await checkRateLimit(supabase, userId);
    
    // Build search URL
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.set('key', googleApiKey);
    searchUrl.searchParams.set('cx', googleCxId);
    searchUrl.searchParams.set('q', sanitizedQuery);
    searchUrl.searchParams.set('num', Math.min(num, 10).toString()); // Max 10 per request
    searchUrl.searchParams.set('start', start.toString());
    
    if (site) {
      searchUrl.searchParams.set('siteSearch', site);
    }
    
    if (dateRestrict) {
      searchUrl.searchParams.set('dateRestrict', dateRestrict);
    }
    
    console.log('Calling Google Custom Search API...');
    
    // Call Google Custom Search API
    const response = await fetch(searchUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Google Search API error: ${response.status} - ${response.statusText}`);
    }
    
    const searchResults = await response.json();
    
    // Process and validate results
    const processedResults = {
      items: searchResults.items || [],
      searchInformation: searchResults.searchInformation || { totalResults: '0', searchTime: 0 },
      queries: searchResults.queries || {}
    };
    
    const resultsCount = processedResults.items.length;
    const processingTime = Date.now() - startTime;
    
    // Log successful search
    await logSearchInteraction(supabase, {
      userId,
      query: sanitizedQuery,
      searchType,
      resultsCount,
      processingTime,
      status: 'success'
    });
    
    console.log(`Search completed successfully: ${resultsCount} results in ${processingTime}ms`);
    
    return new Response(
      JSON.stringify(processedResults),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in google-search function:', error);
    
    // Log the error
    if (userId) {
      await logSearchInteraction(supabase, {
        userId,
        query: requestData?.query || 'Unknown query',
        searchType: requestData?.searchType || 'general',
        resultsCount: 0,
        processingTime: Date.now() - startTime,
        status: 'error',
        errorMessage: error.message
      });
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        code: 'SEARCH_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});