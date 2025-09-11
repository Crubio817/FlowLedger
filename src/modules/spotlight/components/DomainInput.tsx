// Spotlight Module v1.0 - Domain Input Component
// DomainInput: Autocomplete input for domain selection with suggestions

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { getSpotlightDomains } from '../services/spotlight.api.ts';

// ================================
// Component Props
// ================================

interface DomainInputProps {
  value: string;
  onChange: (value: string) => void;
  orgId: number;
  placeholder?: string;
  className?: string;
  error?: string;
}

// ================================
// DomainInput Component
// ================================

const DomainInput: React.FC<DomainInputProps> = ({
  value,
  onChange,
  orgId,
  placeholder = "Enter domain (e.g., tech, finance)",
  className = "",
  error,
}) => {
  const [domains, setDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredDomains, setFilteredDomains] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch domains on component mount
  useEffect(() => {
    const fetchDomains = async () => {
      setLoading(true);
      try {
        const result = await getSpotlightDomains(orgId);
        // Ensure result is an array
        if (Array.isArray(result)) {
          setDomains(result);
          setFilteredDomains(result);
        } else {
          console.warn('getSpotlightDomains returned non-array:', result);
          setDomains([]);
          setFilteredDomains([]);
        }
      } catch (error) {
        console.error('Failed to fetch domains:', error);
        setDomains([]);
        setFilteredDomains([]);
      } finally {
        setLoading(false);
      }
    };

    if (orgId) {
      fetchDomains();
    }
  }, [orgId]);

  // Filter domains based on input value
  useEffect(() => {
    if (!Array.isArray(domains)) {
      setFilteredDomains([]);
      return;
    }
    
    if (value.trim() === '') {
      setFilteredDomains(domains);
    } else {
      const filtered = domains.filter(domain =>
        domain.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDomains(filtered);
    }
  }, [value, domains]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true);
  };

  // Handle domain selection
  const handleDomainSelect = (domain: string) => {
    onChange(domain);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const showDropdown = isOpen && filteredDomains.length > 0;
  const hasCustomValue = value && Array.isArray(domains) && !domains.includes(value);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck="false"
          className={`w-full bg-zinc-800/40 border rounded px-3 py-2 pr-8 text-white placeholder-zinc-400 focus:outline-none transition-colors backdrop-blur-sm ${
            error
              ? 'border-red-500 focus:border-red-400'
              : 'border-zinc-600/50 focus:border-blue-500 hover:border-zinc-500/70'
          }`}
        />

        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
          </div>
        )}

        {/* Dropdown arrow */}
        {!loading && Array.isArray(domains) && domains.length > 0 && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* Custom value option */}
          {hasCustomValue && (
            <div
              onClick={() => handleDomainSelect(value)}
              className="px-3 py-2 text-white hover:bg-zinc-700 cursor-pointer border-b border-zinc-700"
            >
              <div className="flex items-center justify-between">
                <span>"{value}"</span>
                <span className="text-xs text-cyan-400">Create new</span>
              </div>
            </div>
          )}

          {/* Existing domains */}
          {filteredDomains.map((domain) => (
            <div
              key={domain}
              onClick={() => handleDomainSelect(domain)}
              className={`px-3 py-2 text-white hover:bg-zinc-700 cursor-pointer ${
                value === domain ? 'bg-zinc-700' : ''
              }`}
            >
              {domain}
            </div>
          ))}

          {/* No matches message */}
          {filteredDomains.length === 0 && value && (
            <div className="px-3 py-2 text-zinc-400 italic">
              No existing domains match "{value}"
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}

      {/* Helper text */}
      {!error && Array.isArray(domains) && domains.length > 0 && (
        <p className="text-zinc-500 text-xs mt-1">
          {domains.length} domain{domains.length !== 1 ? 's' : ''} available. You can also create a new one.
        </p>
      )}
    </div>
  );
};

export default DomainInput;
export type { DomainInputProps };
