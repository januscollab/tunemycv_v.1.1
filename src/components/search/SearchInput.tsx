import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnifiedInput } from '@/components/ui/unified-input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { SearchQuery } from '@/services/searchService';

interface SearchInputProps {
  onSearch: (query: SearchQuery) => void;
  loading?: boolean;
  placeholder?: string;
  showSearchType?: boolean;
  defaultSearchType?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  loading = false,
  placeholder = "Enter your search query...",
  showSearchType = true,
  defaultSearchType = 'general'
}) => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState(defaultSearchType);
  const [site, setSite] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const searchTypes = [
    { value: 'general', label: 'General Search' },
    { value: 'job_research', label: 'Job Research' },
    { value: 'company_research', label: 'Company Research' },
    { value: 'industry_insights', label: 'Industry Insights' },
    { value: 'skill_validation', label: 'Skill Validation' },
    { value: 'interview_prep', label: 'Interview Preparation' },
  ];

  const siteFilters = [
    { value: '', label: 'All Sites' },
    { value: 'linkedin.com', label: 'LinkedIn' },
    { value: 'indeed.com', label: 'Indeed' },
    { value: 'glassdoor.com', label: 'Glassdoor' },
    { value: 'stackoverflow.com', label: 'Stack Overflow' },
    { value: 'github.com', label: 'GitHub' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    const searchQuery: SearchQuery = {
      query: query.trim(),
      searchType: searchType as any,
      ...(site && { site }),
    };

    onSearch(searchQuery);
  };

  const clearQuery = () => {
    setQuery('');
    setSite('');
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Google Search
          </CardTitle>
          {showAdvanced && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Simple' : 'Advanced'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Search Input */}
          <div className="flex gap-2">
            <div className="flex-1">
              <UnifiedInput
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full"
                maxLength={500}
                secure={true}
              />
            </div>
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearQuery}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={!query.trim() || loading}
              className="shrink-0"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Search Type and Site Filter */}
          <div className="flex gap-2">
            {showSearchType && (
              <div className="flex-1">
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Search type" />
                  </SelectTrigger>
                  <SelectContent>
                    {searchTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex-1">
              <Select value={site} onValueChange={setSite}>
                <SelectTrigger>
                  <SelectValue placeholder="All sites" />
                </SelectTrigger>
                <SelectContent>
                  {siteFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchType !== 'general' || site) && (
            <div className="flex flex-wrap gap-1">
              {searchType !== 'general' && (
                <Badge variant="secondary">
                  {searchTypes.find(t => t.value === searchType)?.label}
                </Badge>
              )}
              {site && (
                <Badge variant="secondary">
                  Site: {siteFilters.find(s => s.value === site)?.label}
                </Badge>
              )}
            </div>
          )}
        </form>

        {/* Quick Search Suggestions */}
        {!query && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Quick searches:</p>
            <div className="flex flex-wrap gap-1">
              {[
                'Software Engineer jobs',
                'React developer requirements',
                'Google company culture',
                'Tech industry trends 2024',
                'Interview questions'
              ].map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};