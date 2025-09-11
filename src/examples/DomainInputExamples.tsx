// Example Integration: Domain Input Usage
// This file demonstrates how to integrate the new DomainInput component

import React, { useState } from 'react';
import { DomainInput } from '../modules/spotlight/index.ts';

// ================================
// Example 1: Basic Usage
// ================================

export function BasicDomainInputExample() {
  const [domain, setDomain] = useState('');
  const orgId = 1; // Replace with actual org ID

  return (
    <div className="p-6 bg-zinc-900 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Basic Domain Input</h3>
      <DomainInput
        value={domain}
        onChange={setDomain}
        orgId={orgId}
        placeholder="Enter domain (e.g., tech, finance)"
      />
      <div className="mt-4 text-sm text-zinc-400">
        Current value: {domain || '(empty)'}
      </div>
    </div>
  );
}

// ================================
// Example 2: Form Integration
// ================================

interface SpotlightFormData {
  name: string;
  domain: string;
  description: string;
}

export function SpotlightFormExample() {
  const [formData, setFormData] = useState<SpotlightFormData>({
    name: '',
    domain: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const orgId = 1; // Replace with actual org ID

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.domain.trim()) newErrors.domain = 'Domain is required';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      console.log('Form submitted:', formData);
      // Handle form submission here
    }
  };

  return (
    <div className="p-6 bg-zinc-900 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Spotlight Form with Domain Input</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Spotlight Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter spotlight name"
            className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-white placeholder-zinc-400 focus:border-cyan-500 focus:outline-none"
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Domain *
          </label>
          <DomainInput
            value={formData.domain}
            onChange={(value) => setFormData(prev => ({ ...prev, domain: value }))}
            orgId={orgId}
            placeholder="e.g., tech, finance, healthcare"
            error={errors.domain}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your spotlight profile..."
            rows={3}
            className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-white placeholder-zinc-400 focus:border-cyan-500 focus:outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded transition-colors"
        >
          Create Spotlight
        </button>
      </form>
    </div>
  );
}

// ================================
// Example 3: Custom Styling
// ================================

export function CustomStyledDomainInputExample() {
  const [domain, setDomain] = useState('');
  const orgId = 1; // Replace with actual org ID

  return (
    <div className="p-6 bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Custom Styled Domain Input</h3>
      <DomainInput
        value={domain}
        onChange={setDomain}
        orgId={orgId}
        placeholder="Select or create a domain..."
        className="max-w-md"
      />
      <div className="mt-4 p-3 bg-black/20 rounded border border-white/10">
        <h4 className="text-sm font-medium text-white mb-2">Features:</h4>
        <ul className="text-sm text-zinc-300 space-y-1">
          <li>• Autocomplete with existing domains</li>
          <li>• Allows custom domain creation</li>
          <li>• Real-time filtering</li>
          <li>• Keyboard navigation support</li>
          <li>• Loading states</li>
        </ul>
      </div>
    </div>
  );
}

// ================================
// Export Usage Examples
// ================================

export default function DomainInputExamples() {
  return (
    <div className="space-y-6">
      <BasicDomainInputExample />
      <SpotlightFormExample />
      <CustomStyledDomainInputExample />
    </div>
  );
}
