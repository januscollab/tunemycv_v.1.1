import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useGoogleSearch } from '@/hooks/useGoogleSearch';
import { SearchInput } from './SearchInput';
import { SearchResults } from './SearchResults';
import { SearchQuery } from '@/services/searchService';

interface GoogleSearchPanelProps {
  searchType?: string;
  placeholder?: string;
  title?: string;
}

export const GoogleSearchPanel: React.FC<GoogleSearchPanelProps> = ({
  searchType = 'general',
  placeholder,
  title = 'Research Assistant'
}) => {
  const { data, loading, error, search } = useGoogleSearch();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentQuery, setCurrentQuery] = useState<SearchQuery | null>(null);

  const handleSearch = (query: SearchQuery) => {
    setCurrentQuery(query);
    setCurrentPage(1);
    search(query);
  };

  const handleLoadMore = () => {
    if (currentQuery) {
      const nextPage = currentPage + 1;
      const startIndex = (nextPage - 1) * 10 + 1;
      
      search({
        ...currentQuery,
        start: startIndex
      });
      
      setCurrentPage(nextPage);
    }
  };

  const hasMore = data?.queries?.nextPage && data.queries.nextPage.length > 0;

  return (
    <div className="space-y-6">
      <SearchInput
        onSearch={handleSearch}
        loading={loading}
        placeholder={placeholder}
        defaultSearchType={searchType}
        showSearchType={searchType === 'general'}
      />
      
      <SearchResults
        results={data}
        loading={loading}
        error={error}
        searchType={currentQuery?.searchType}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      />
    </div>
  );
};