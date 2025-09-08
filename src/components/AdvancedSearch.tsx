/**
 * Advanced Search Component for Communication Hub
 * Provides full-text search across threads and messages
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Search, Filter, Calendar, Clock, MessageSquare, Mail, X, ChevronDown } from 'lucide-react';
import { useCommunicationSearch } from '../hooks/useCommunicationHub.js';
import { Button } from '../ui/button.js';
import { Badge } from '../ui/badge.js';

export interface AdvancedSearchProps {
  principalId?: number;
  orgId?: number;
  onResultSelect?: (result: any) => void;
  initialQuery?: string;
  className?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  principalId,
  orgId,
  onResultSelect,
  initialQuery = '',
  className = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<'general' | 'threads' | 'messages'>('general');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    mailbox_id: undefined as number | undefined,
    status: undefined as string | undefined,
    from_date: undefined as string | undefined,
    to_date: undefined as string | undefined
  });

  const { searchState, search, loadMore, clearResults } = useCommunicationSearch(principalId, orgId);

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(() => {
    if (!query || query.length < 3) {
      clearResults();
      return;
    }

    search(query, {
      type: searchType,
      ...filters,
      page: 1,
      limit: 20
    });
  }, [query, searchType, filters, search, clearResults]);

  // Handle search input change with debouncing
  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      if (newQuery !== query) return; // Query changed since timeout was set
      performSearch();
    }, 300);

    setSearchTimeout(timeout);
  }, [searchTimeout, performSearch]);

  // Handle filter changes
  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Apply filters
  const applyFilters = useCallback(() => {
    performSearch();
    setShowFilters(false);
  }, [performSearch]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      mailbox_id: undefined,
      status: undefined,
      from_date: undefined,
      to_date: undefined
    });
  }, []);

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'resolved': return 'success';
      case 'escalated': return 'destructive';
      default: return 'outline';
    }
  };

  // Highlight search terms in text
  const highlightText = (text: string, highlights: string[] = []) => {
    if (!highlights.length) return text;
    
    let highlightedText = text;
    highlights.forEach(highlight => {
      const regex = new RegExp(`(${highlight})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 text-zinc-900">$1</mark>');
    });
    
    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  // Handle result click
  const handleResultClick = (result: any) => {
    if (onResultSelect) {
      onResultSelect(result);
    } else {
      // Default navigation
      window.location.href = `/comms/threads/${result.thread_id}`;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search communications..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-900/50 border border-zinc-700 rounded-lg 
                       text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 
                       focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Search Type Selector */}
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as any)}
            className="px-3 py-2 bg-zinc-900/50 border border-zinc-700 rounded-lg text-zinc-200 
                     focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="general">All</option>
            <option value="threads">Threads</option>
            <option value="messages">Messages</option>
          </select>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`${showFilters ? 'bg-cyan-500/20 border-cyan-500' : ''}`}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-zinc-900/95 backdrop-blur-sm 
                        border border-zinc-700 rounded-lg shadow-xl z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-zinc-200 
                           focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="escalated">Escalated</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={filters.from_date || ''}
                    onChange={(e) => handleFilterChange('from_date', e.target.value || undefined)}
                    className="px-2 py-2 bg-zinc-800 border border-zinc-600 rounded text-zinc-200 text-sm
                             focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <input
                    type="date"
                    value={filters.to_date || ''}
                    onChange={(e) => handleFilterChange('to_date', e.target.value || undefined)}
                    className="px-2 py-2 bg-zinc-800 border border-zinc-600 rounded text-zinc-200 text-sm
                             focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-zinc-700">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-zinc-400"
              >
                Clear Filters
              </Button>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={applyFilters}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Stats */}
      {searchState.results.length > 0 && (
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <span>
            {searchState.totalResults} result{searchState.totalResults !== 1 ? 's' : ''} found
          </span>
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearResults}
              className="text-zinc-400 hover:text-zinc-200"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      )}

      {/* Loading State */}
      {searchState.loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
          <span className="ml-2 text-zinc-400">Searching...</span>
        </div>
      )}

      {/* Error State */}
      {searchState.error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
          <p className="text-red-400 text-sm">{searchState.error}</p>
        </div>
      )}

      {/* Search Results */}
      {searchState.results.length > 0 && (
        <div className="space-y-3">
          {searchState.results.map((result) => (
            <div
              key={`${result.type}-${result.id}`}
              onClick={() => handleResultClick(result)}
              className="p-4 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-lg 
                       hover:border-zinc-700 cursor-pointer transition-all duration-200 
                       hover:bg-zinc-900/70"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {result.type === 'thread' ? (
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Mail className="w-4 h-4 text-emerald-400" />
                  )}
                  <Badge variant="muted" className="text-xs">
                    {result.type}
                  </Badge>
                  <span className="text-xs text-zinc-500">
                    Score: {Math.round(result.relevance_score * 100)}%
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-zinc-500">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(result.created_utc).toLocaleDateString()}</span>
                </div>
              </div>

              <h3 className="font-medium text-zinc-200 mb-1">
                {highlightText(result.title, result.highlights)}
              </h3>
              
              <p className="text-sm text-zinc-400 mb-2 line-clamp-2">
                {highlightText(result.content, result.highlights)}
              </p>

              <div className="text-xs text-zinc-500">
                Thread: <span className="text-zinc-400">{result.thread_subject}</span>
              </div>
            </div>
          ))}

          {/* Load More Button */}
          {searchState.hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => loadMore(query, { type: searchType, ...filters })}
                disabled={searchState.loading}
                className="text-zinc-400 border-zinc-700 hover:border-zinc-600"
              >
                {searchState.loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Loading...
                  </>
                ) : (
                  'Load More Results'
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {!searchState.loading && searchState.results.length === 0 && query.length >= 3 && (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 mb-1">No results found</p>
          <p className="text-sm text-zinc-500">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
