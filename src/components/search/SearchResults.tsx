import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Clock, Search } from 'lucide-react';
import { SearchResponse } from '@/services/searchService';

interface SearchResultsProps {
  results: SearchResponse | null;
  loading: boolean;
  error: string | null;
  searchType?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  error,
  searchType,
  onLoadMore,
  hasMore = false
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Search className="h-4 w-4 animate-spin" />
          <span>Searching...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <Search className="h-4 w-4" />
            <span className="font-medium">Search Error</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!results || !results.items || results.items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">No results found. Try adjusting your search terms.</p>
        </CardContent>
      </Card>
    );
  }

  const formatSearchType = (type?: string) => {
    if (!type) return 'General';
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-4">
      {/* Search Info Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {formatSearchType(searchType)}
          </Badge>
          <span className="text-sm text-muted-foreground">
            About {parseInt(results.searchInformation.totalResults).toLocaleString()} results 
            ({results.searchInformation.searchTime.toFixed(2)} seconds)
          </span>
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-4">
        {results.items.map((item, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg leading-tight">
                    <a 
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: item.htmlTitle || item.title }}
                    />
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <span className="text-green-600">{item.displayLink}</span>
                    <ExternalLink className="h-3 w-3" />
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p 
                className="text-sm text-muted-foreground line-clamp-3"
                dangerouslySetInnerHTML={{ __html: item.htmlSnippet || item.snippet }}
              />
              
              {/* Additional metadata from pagemap if available */}
              {item.pagemap?.metatags?.[0] && (
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  {item.pagemap.metatags[0]['article:published_time'] && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(item.pagemap.metatags[0]['article:published_time']).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={onLoadMore}>
            Load More Results
          </Button>
        </div>
      )}
    </div>
  );
};