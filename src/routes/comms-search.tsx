import React, { useState } from 'react';
import { Search, Filter, Calendar, MessageSquare, FileText, Mail } from 'lucide-react';
import { PageHeader } from '../components/PageHeader.js';
import AdvancedSearch from '../components/AdvancedSearch.js';
import { Button } from '../ui/button.js';
import { Badge } from '../ui/badge.js';

interface SearchFilters {
  dateRange: {
    start?: string;
    end?: string;
  };
  messageType: 'all' | 'email' | 'sms' | 'call';
  status: 'all' | 'open' | 'in_progress' | 'resolved' | 'closed';
  participants: string[];
}

export default function CommsSearchPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    dateRange: {},
    messageType: 'all',
    status: 'all',
    participants: []
  });

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const activeFiltersCount = [
    filters.dateRange.start || filters.dateRange.end,
    filters.messageType !== 'all',
    filters.status !== 'all',
    filters.participants.length > 0
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Communication Search"
        subtitle="Search across all threads, messages, and attachments"
      />

      {/* Search Header */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <AdvancedSearch
              initialQuery={searchQuery}
              className="w-full"
            />
          </div>
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge 
                variant="success" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium mb-2">Date Range</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={filters.dateRange.start || ''}
                    onChange={(e) => handleFilterChange('dateRange', {
                      ...filters.dateRange,
                      start: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                    placeholder="Start date"
                  />
                  <input
                    type="date"
                    value={filters.dateRange.end || ''}
                    onChange={(e) => handleFilterChange('dateRange', {
                      ...filters.dateRange,
                      end: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                    placeholder="End date"
                  />
                </div>
              </div>

              {/* Message Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Message Type</label>
                <select
                  value={filters.messageType}
                  onChange={(e) => handleFilterChange('messageType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="all">All Types</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="call">Call Notes</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-2">Thread Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setFilters({
                    dateRange: {},
                    messageType: 'all',
                    status: 'all',
                    participants: []
                  })}
                  className="flex-1"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <AdvancedSearch
            initialQuery={searchQuery}
            className="w-full"
          />
        </div>
      </div>

      {/* Quick Search Suggestions */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Quick Searches</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => setSearchQuery('status:open')}
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h4 className="font-medium">Open Threads</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Find all open conversations</p>
            </div>
          </button>

          <button
            onClick={() => setSearchQuery('type:email today')}
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <h4 className="font-medium">Today's Emails</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recent email communications</p>
            </div>
          </button>

          <button
            onClick={() => setSearchQuery('has:attachment')}
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <div>
              <h4 className="font-medium">With Attachments</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Messages containing files</p>
            </div>
          </button>

          <button
            onClick={() => setSearchQuery('urgent OR priority:high')}
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <h4 className="font-medium">Urgent Items</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">High priority communications</p>
            </div>
          </button>

          <button
            onClick={() => setSearchQuery('from:client')}
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <MessageSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <div>
              <h4 className="font-medium">From Clients</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Client initiated communications</p>
            </div>
          </button>

          <button
            onClick={() => setSearchQuery('this week')}
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <div>
              <h4 className="font-medium">This Week</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recent activity</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
