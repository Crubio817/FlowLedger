import { __test } from '../services/client.ts';

// Minimal unit tests for URL joining to ensure no /api/api duplication

describe('joinUrl', () => {
  it('joins origin and root path', () => {
    expect(__test.joinUrl('http://localhost:4001', '/api/engagements')).toBe('http://localhost:4001/api/engagements');
  });
  it('prevents duplicate /api when base ends with /api', () => {
    expect(__test.joinUrl('http://localhost:4001/api', '/api/engagements')).toBe('http://localhost:4001/api/engagements');
  });
  it('handles path without leading slash', () => {
    expect(__test.joinUrl('http://localhost:4001', 'api/engagements')).toBe('http://localhost:4001/api/engagements');
  });
  it('returns absolute path unchanged', () => {
    expect(__test.joinUrl('http://x', 'https://api.example.com/engagements')).toBe('https://api.example.com/engagements');
  });
});
